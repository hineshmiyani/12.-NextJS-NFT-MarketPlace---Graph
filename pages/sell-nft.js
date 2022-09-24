import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { Button, Form, useNotification } from "@web3uikit/core";
import nftAbi from "../constants/BasicNftAbi.json";
import networkMapping from "../constants/networkMapping.json";
import nftMarketplaceAbi from "../constants/nftMarketPlaceAbi.json";
import styles from "../styles/Home.module.css";

export default function Home() {
  const { chainId, account, isWeb3Enabled } = useMoralis();
  const chainIdString = chainId ? parseInt(chainId).toString() : "31337";
  const marketPlaceAddress = networkMapping[chainIdString]["NftMarketPlace"][0];
  const dispatch = useNotification();
  const [proceeds, setProceeds] = useState("0");
  const { runContractFunction } = useWeb3Contract();
  const router = useRouter();

  async function approveList(data) {
    console.log("Approving...");
    console.log(data);
    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils.parseEther(data.data[2].inputResult).toString();

    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketPlaceAddress,
        tokenId: tokenId,
      },
    };

    await runContractFunction({
      params: approveOptions,
      onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
      onError: (error) => console.error(error),
    });
  }

  async function handleApproveSuccess(nftAddress, tokenId, price) {
    console.log("Listing NFT...");
    const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketPlaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price,
      },
    };

    await runContractFunction({
      params: listOptions,
      onSuccess: (tx) => handleListSuccess(tx),
      onError: (error) => console.error(error),
    });
  }

  async function handleListSuccess(tx) {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "NFT Listing",
      title: "NFT Listed",
      position: "topR",
    });
    setTimeout(() => {
      router.reload(window.location.pathname);
    }, 6000);
  }

  const handleWithdrawSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Withdrawing proceeds",
      position: "topR",
    });
    setTimeout(() => {
      router.reload(window.location.pathname);
    }, 6000);
  };

  async function setupUI() {
    const returnedProceeds = await runContractFunction({
      params: {
        abi: nftMarketplaceAbi,
        contractAddress: marketPlaceAddress,
        functionName: "getProceeds",
        params: {
          seller: account,
        },
      },
      onError: (error) => console.log(error),
    });
    if (returnedProceeds) {
      setProceeds(returnedProceeds.toString());
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      setupUI();
    }
  }, [proceeds, account, isWeb3Enabled, chainId]);
  return (
    <div className={styles.container}>
      <Form
        buttonConfig={{
          theme: "colored",
          color: "blue",
          size: "large",
        }}
        data={[
          {
            name: "NFT Address",
            type: "text",
            value: "",
            key: "nftAddress",
          },
          {
            name: "Token ID",
            type: "number",
            value: "",
            key: "tokenId",
          },
          {
            name: "Price (in ETH)",
            type: "number",
            value: "",
            key: "price",
          },
        ]}
        onSubmit={approveList}
        title="Sell your NFT!"
        id="sell-nft-form"
      />

      <div className="p-4 space-y-4">
        <h1 className="font-bold text-xl text-[#68738d]">Withdraw</h1>
        <p>Withdraw {ethers.utils.formatEther(proceeds)} ETH proceeds</p>
        {proceeds != "0" ? (
          <Button
            type="button"
            color="blue"
            theme="colored"
            text="Withdraw"
            size="large"
            onClick={() => {
              runContractFunction({
                params: {
                  abi: nftMarketplaceAbi,
                  contractAddress: marketPlaceAddress,
                  functionName: "withdrawProceeds",
                  params: {},
                },
                onError: (error) => console.log(error),
                onSuccess: handleWithdrawSuccess,
              });
            }}
          />
        ) : (
          <div>No proceeds detected</div>
        )}
      </div>
    </div>
  );
}
