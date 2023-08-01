import React, { useEffect, useState } from "react";
import Image from "next/image";
import CollectionCard from "@/components/cards/CollectionCard";
import Head from "next/head";
import Pagination from "@/components/Pagination";
import { get_collections } from "@/utils/mongo_api/collection/collection";
import Loader from "@/components/Loader";

const Collections = ({ theme }) => {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(12);
  const [collections, set_collections] = useState([]);

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentCollections = collections.slice(firstPostIndex, lastPostIndex);

  const fetch_all_collections = async () => {
    setLoading(true);
    const res = await get_collections();
    set_collections(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetch_all_collections();
  }, []);

  return (
    <>
      <Head>
        <title>Top Collections - Venomart Marketplace</title>
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
            <picture className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
              <img
                src="img/gradient_light.jpg"
                alt="gradient"
                className="h-full w-full"
              />
            </picture>
            <div className="container">
              <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                Explore Collections
              </h1>
              <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                Explore and trade the amazing collections on venomart marketplace
              </p>

              {/* loop collections here  */}
              <div className="flex justify-center align-middle flex-wrap">
                {currentCollections?.map((e, index) => (
                  <CollectionCard
                    key={index}
                    Cover={e.coverImage.replace(
                      "ipfs://",
                      "https://ipfs.io/ipfs/"
                    )}
                    Logo={e.logo.replace("ipfs://", "https://ipfs.io/ipfs/")}
                    Name={e.name}
                    OwnerAddress={e.OwnerAddress}
                    CollectionAddress={e.contractAddress}
                  />
                ))}
              </div>
              <Pagination
                totalPosts={collections.length}
                postsPerPage={postsPerPage}
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
              />
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default Collections;
