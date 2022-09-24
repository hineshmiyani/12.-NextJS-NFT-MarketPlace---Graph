import { useQuery } from "@apollo/client";
import { useMoralis } from "react-moralis";
import { GET_ACTIVE_ITEMS } from "../constants/subgraphQueries";
import networkMapping from "../constants/networkMapping.json";
import NFTCard from "../components/NFTCard";
import nftMarketplaceAbi from "../constants/nftMarketPlaceAbi.json";

export default function Home() {
  const { chainId, isWeb3Enabled } = useMoralis();
  const chainIdString = chainId ? parseInt(chainId).toString() : "31337";
  const marketPlaceAddress = networkMapping[chainIdString]["NftMarketPlace"][0];

  const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

  return (
    <div className="px-28 py-12 mx-auto">
      <h1 className="pb-6 font-bold text-2xl">Recently Listed</h1>
      {isWeb3Enabled ? (
        <div className="flex flex-wrap gap-x-4 gap-y-4">
          {loading || !listedNfts ? (
            <div>Loading...</div>
          ) : (
            listedNfts?.activeItems?.map((nft) => {
              const { price, nftAddress, tokenId, seller } = nft;
              return (
                <div key={nft?.id}>
                  <NFTCard
                    price={price}
                    nftAddress={nftAddress}
                    tokenId={tokenId}
                    marketplaceAddress={marketPlaceAddress}
                    seller={seller}
                  />
                </div>
              );
            })
          )}
        </div>
      ) : (
        <p>Web3 currently not enabled.</p>
      )}
    </div>
  );
}

// Note:
// How do we show the recently listed NFTs?

// We will index the events off - chain and then read from our database.
// Setup a server to listen for those events to be fired , and we will add them to a database to query.

// TheGraph does this in a decentralized way
// Moralis does it in a centralized way and comes with a ton of other features.

// All our logic is still 100 % on chain .
// Speed & Development time .
// Its really hard to start a prod blockchain project 100 % decetralized .
// They are working on open sourcing their code .
// Feature richness
// We can create more features with a centralized back end to start
// As more decentralized tools are being created.
// Local development
