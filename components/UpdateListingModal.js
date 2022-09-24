import React, { useState } from "react";
import { ethers } from "ethers";
import { useWeb3Contract } from "react-moralis";
import { Modal, Input, useNotification } from "@web3uikit/core";
import nftMarketPlaceAbi from "../constants/NftMarketPlaceAbi.json";

const UpdateListingModal = ({
  nftAddress,
  tokenId,
  isVisible,
  marketplaceAddress,
  onClose,
}) => {
  const dispatch = useNotification();
  const [priceToUpdateListingWith, setpriceToUpdateListingWith] = useState(0);

  const handleUpdateListingSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "listing updated",
      title: "Listing updated - please refresh (and move blocks)",
      position: "topR",
    });
    onClose && onClose();
    setpriceToUpdateListingWith(0);
  };

  const { runContractFunction: updateListing } = useWeb3Contract({
    abi: nftMarketPlaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "updateListing",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
      newPrice: ethers.utils.parseEther(
        priceToUpdateListingWith.toString() || "0"
      ),
    },
  });

  return (
    <Modal
      isVisible={isVisible}
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() => {
        updateListing({
          onError: (error) => console.log(error),
          onSuccess: handleUpdateListingSuccess,
        });
      }}
    >
      <div className="space-y-4 py-6">
        <Input
          label="Update listing price in L1 Currency (ETH)"
          name="New listing price"
          type="number"
          value={priceToUpdateListingWith}
          onChange={(e) => setpriceToUpdateListingWith(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default UpdateListingModal;
