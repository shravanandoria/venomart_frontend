import React, { useEffect, useState } from "react";
import NftCard from "../../components/cards/NftCard";
import Head from "next/head";
import Loader from "../../components/Loader";
import { fetch_nfts } from "../../utils/mongo_api/nfts/nfts";

const NFTs = ({ theme }) => {
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);

  const [nfts, set_nfts] = useState([]);

  const scroll_get_all_nfts = async () => {
    const res = await fetch_nfts(skip);
    set_nfts([...nfts, ...res]);
  };

  const handleScroll = (e) => {
    const { offsetHeight, scrollTop, scrollHeight } = e.target;
    if (offsetHeight + scrollTop + 10 >= scrollHeight) {
      setSkip(nfts.length);
    }
  };

  useEffect(() => {
    scroll_get_all_nfts();
  }, [skip]);

  return (
    <>
      <Head>
        <title>Explore NFTs - Venomart Marketplace</title>
        <meta
          name="description"
          content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain"
        />
        <meta
          name="keywords"
          content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>

      {loading ? (
        <Loader theme={theme} />
      ) : (
        <div className={`${theme} scroll-list`} onScroll={handleScroll}>
          <section className="relative py-24 dark:bg-jacarta-800">
            <div>
              <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                Explore NFTs
              </h1>
              <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                Explore and trade the amazing NFTs on venomart marketplace
              </p>

              <div>
                <div>
                  <div className="flex justify-center align-middle flex-wrap">
                    {nfts?.map((e, index) => {
                      return (
                        <NftCard
                          key={index}
                          ImageSrc={e?.nft_image?.replace(
                            "ipfs://",
                            "https://ipfs.io/ipfs/"
                          )}
                          Name={e?.name}
                          Description={e?.description}
                          Address={e.NFTAddress}
                          tokenId={e?._id}
                        // listedBool={e?.isListed}
                        />
                      );
                    })}
                    {nfts?.length <= 0 && (
                      <h2 className="text-jacarta-700 dark:text-jacarta-200">
                        No NFTs Found
                      </h2>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default NFTs;
