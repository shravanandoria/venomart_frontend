import React, { useEffect, useState } from "react";
import NftCard from "@/components/cards/NftCard";
import Head from "next/head";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import { get_listed_tokens } from "@/utils/user_nft";
import { loadNFTs_collection } from "@/utils/user_nft";
import { COLLECTION_ADDRESS } from "@/utils/user_nft";

const NFTs = ({ theme, venomProvider, standalone }) => {

  const [loading, setLoading] = useState(false);
  const [propShow, setPropShow] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(12);

  const [nfts, set_nfts] = useState([]);
  const [listed_nfts, set_listed_nfts] = useState([]);

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentNFTs = nfts?.slice(firstPostIndex, lastPostIndex);


  const fetch_listed_nfts = async () => {
    const res = await get_listed_tokens(venomProvider);
    // set_listed_nfts(res);
  };

  const get_nfts = async () => {
    setLoading(true);
    const res = await loadNFTs_collection(standalone, COLLECTION_ADDRESS);
    set_nfts(res);
    setLoading(false);
  };

  useEffect(() => {
    if (!venomProvider) return;
    fetch_listed_nfts();
    get_nfts();
  }, [venomProvider]);

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
        <div className={`${theme}`}>
          <section className="relative py-24 dark:bg-jacarta-800">
            <div className="container">
              <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                Explore NFTs
              </h1>
              <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                Explore and trade the amazing NFTs on venomart marketplace
              </p>

              {/* <!-- Filters --> */}
              <div className="mb-8 flex flex-wrap items-center justify-between">
                <ul className="flex flex-wrap items-center">
                  <li className="my-1 mr-2.5" onClick={() => setPropShow(true)}>
                    <a
                      href="#"
                      className={`${propShow && "border-transparent bg-accent text-white"
                        } group flex h-9 items-center rounded-lg border border-jacarta-100 bg-white px-4 font-display text-sm font-semibold text-jacarta-500 transition-colors `}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="mr-1 h-4 w-4 fill-jacarta-700"
                      >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M12 2c5.522 0 10 3.978 10 8.889a5.558 5.558 0 0 1-5.556 5.555h-1.966c-.922 0-1.667.745-1.667 1.667 0 .422.167.811.422 1.1.267.3.434.689.434 1.122C13.667 21.256 12.9 22 12 22 6.478 22 2 17.522 2 12S6.478 2 12 2zm-1.189 16.111a3.664 3.664 0 0 1 3.667-3.667h1.966A3.558 3.558 0 0 0 20 10.89C20 7.139 16.468 4 12 4a8 8 0 0 0-.676 15.972 3.648 3.648 0 0 1-.513-1.86zM7.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM12 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                      </svg>
                      <span>Listed NFTs</span>
                    </a>
                  </li>
                  <li
                    className="my-1 mr-2.5"
                    onClick={() => setPropShow(false)}
                  >
                    <a
                      href="#"
                      className={`${!propShow && "border-transparent bg-accent text-white"
                        } group flex h-9 items-center rounded-lg border border-jacarta-100 bg-white px-4 font-display text-sm font-semibold text-jacarta-500 transition-colors `}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="mr-1 h-4 w-4 fill-jacarta-700"
                      >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M12 2c5.522 0 10 3.978 10 8.889a5.558 5.558 0 0 1-5.556 5.555h-1.966c-.922 0-1.667.745-1.667 1.667 0 .422.167.811.422 1.1.267.3.434.689.434 1.122C13.667 21.256 12.9 22 12 22 6.478 22 2 17.522 2 12S6.478 2 12 2zm-1.189 16.111a3.664 3.664 0 0 1 3.667-3.667h1.966A3.558 3.558 0 0 0 20 10.89C20 7.139 16.468 4 12 4a8 8 0 0 0-.676 15.972 3.648 3.648 0 0 1-.513-1.86zM7.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM12 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                      </svg>
                      <span>All NFTs</span>
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <div className="container">
                  {propShow ? (
                    <div className="grid grid-cols-1 gap-[1.875rem] md:grid-cols-2 lg:grid-cols-4">
                      {listed_nfts?.map((e, index) => (
                        <NftCard
                          key={index}
                          ImageSrc={e?.nft_image?.replace(
                            "ipfs://",
                            "https://ipfs.io/ipfs/"
                          )}
                          Name={e?.name}
                          Description={e?.description}
                          Address={e.nft_address._address}
                          tokenId={e?.id}
                          chainImgPre={"../"}
                          // listedBool={e?.isListed}
                          chain_image={e?.chain_image}
                          chain_symbol={e?.chain_symbol}
                        />
                      ))}
                      {listed_nfts?.length <= 0 && <h2 className="text-jacarta-700 dark:text-jacarta-200">No Listed NFTs</h2>}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-[1.875rem] md:grid-cols-2 lg:grid-cols-4">
                        {currentNFTs?.map((e, index) => {
                          return (
                            <NftCard
                              key={index}
                              ImageSrc={e?.nft_image?.replace(
                                "ipfs://",
                                "https://ipfs.io/ipfs/"
                              )}
                              Name={e?.name}
                              Description={e?.description}
                              Address={e.nftAddress._address}
                              tokenId={e?.id}
                              chainImgPre={"../"}
                              // listedBool={e?.isListed}
                              chain_image={e?.chain_image}
                              chain_symbol={e?.chain_symbol}
                            />
                          );
                        })}
                        {nfts?.length <= 0 && <h2 className="text-jacarta-700 dark:text-jacarta-200">No NFTs Found</h2>}
                      </div>
                      <Pagination
                        totalPosts={nfts?.length}
                        postsPerPage={postsPerPage}
                        setCurrentPage={setCurrentPage}
                        currentPage={currentPage}
                      />
                    </>
                  )}
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
