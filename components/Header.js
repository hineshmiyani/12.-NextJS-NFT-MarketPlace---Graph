import React from "react";
import Link from "next/link";
import { ConnectButton } from "@web3uikit/web3";

const Header = () => {
  return (
    <>
      <nav className="p-5 border-b-2 flex justify-between items-center">
        <h1 className="p-4 text-3xl font-bold">NFT Marketplace</h1>
        <div className="flex flex-row items-center space-x-8 text-base font-semibold">
          <Link href="/">
            <a>Home</a>
          </Link>
          <Link href="/sell-nft">
            <a>Sell NFT</a>
          </Link>
          <ConnectButton moralisAuth={false} />
        </div>
      </nav>
    </>
  );
};

export default Header;
