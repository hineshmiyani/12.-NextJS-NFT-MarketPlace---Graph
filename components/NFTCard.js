import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { Card, useNotification } from "@web3uikit/core";
import nftAbi from "../constants/BasicNftAbi.json";
import UpdateListingModal from "./UpdateListingModal";
import nftMarketPlaceAbi from "../constants/NftMarketPlaceAbi.json";

const NFTCard = ({
  price,
  nftAddress,
  tokenId,
  marketplaceAddress,
  seller,
}) => {
  const { isWeb3Enabled, account } = useMoralis();
  const [nftData, setNftData] = useState({
    title: "",
    description: "",
    imageURL: "",
  });
  const [showModal, setShowModal] = useState(false);
  const dispatch = useNotification();

  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: nftAbi,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: {
      tokenId: tokenId,
    },
  });

  const { runContractFunction: buyItem } = useWeb3Contract({
    abi: nftMarketPlaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "buyItem",
    msgValue: price,
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
  });

  async function updateUI() {
    // Get the tokenURI
    const tokenURI = await getTokenURI();
    const requestURL = tokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
    const tokenURIResponse = await (await fetch(requestURL)).json();

    // Using the image property from tokenURI, get the image
    // Get image from the reponse
    console.log({ tokenURIResponse });

    const imageURL = tokenURIResponse?.image?.replace(
      "ipfs://",
      "https://ipfs.io/ipfs/"
    );

    setNftData((prevData) => {
      return {
        ...prevData,
        title: tokenURIResponse?.name,
        description: tokenURIResponse?.description,
        imageURL: imageURL,
      };
    });
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const isOwnedByUser = seller === account || seller === account;
  const sellerAddress = isOwnedByUser
    ? "You"
    : `: ${seller.slice(0, 5)}...${seller.slice(-5)}`;

  const handleCardClick = () => {
    isOwnedByUser
      ? setShowModal(true)
      : buyItem({
          onError: (error) => console.error(error),
          onSuccess: () => handleBuyItemSuccess(),
        });
  };

  const handleBuyItemSuccess = () => {
    dispatch({
      type: "success",
      message: "Item Bought!",
      title: "Item Bought",
      position: "topR",
    });
  };

  const hideModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      {nftData?.imageURL ? (
        <>
          <UpdateListingModal
            nftAddress={nftAddress}
            tokenId={tokenId}
            isVisible={showModal}
            marketplaceAddress={marketplaceAddress}
            onClose={hideModal}
          />
          <Card
            description={nftData?.description}
            title={nftData?.title}
            onClick={handleCardClick}
          >
            <div className="p-2 flex flex-col items-end  gap-2">
              <p>#{tokenId}</p>
              <p className="italic text-sm  whitespace-nowrap">
                Owned by {sellerAddress}
              </p>
              <Image
                loader={() => nftData?.imageURL}
                src={nftData?.imageURL}
                height={200}
                width={200}
                alt="nft-image"
              />
              <p className="font-bold text-center w-full">
                Price: {ethers.utils.formatEther(price)} ETH
              </p>
            </div>
          </Card>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default NFTCard;
