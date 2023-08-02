import React, { useState } from "react";
import Image from "next/image";
import Head from "next/head";
import Pagination from "@/components/Pagination";
import LaunchCollectionCard from "@/components/cards/LaunchCollectionCard";

const Launchpad = ({ theme, all_collections }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(12);

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentCollections = all_collections?.slice(
    firstPostIndex,
    lastPostIndex
  );

  return (
    <>
      <Head>
        <title>Exclusive Launchpad - Venomart Marketplace</title>
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

      <div className={`${theme}`}>
        <section className="relative py-24 dark:bg-jacarta-800">
          <div className="container">
            <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
              Launchpad Collections
            </h1>
            <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
              Explore all the exclusive collections on venomart launchpad
            </p>

            {/* loop public collections here  */}
            {/* <div className="flex justify-center align-middle flex-wrap">
                            {currentCollections?.map((e, index) => (
                                <LaunchCollectionCard
                                    key={index}
                                    Cover={e.Cover}
                                    Logo={e.Logo}
                                    Name={e.Name}
                                    OwnerAddress={e.OwnerAddress}
                                    CollectionAddress={e.CollectionAddress}
                                />
                            ))}
                        </div>
                        <Pagination
                            totalPosts={all_collections.length}
                            postsPerPage={postsPerPage}
                            setCurrentPage={setCurrentPage}
                            currentPage={currentPage}
                        /> */}

            {/* add custom launch here  */}
            <div className="flex justify-center align-middle flex-wrap">
              <LaunchCollectionCard
                Cover={
                  "https://ipfs.io/ipfs/QmdhUuDUXrAfHEwx7tEWw6LnFRhTx4DurmieaBW5WvFARu/20230729_204210.jpg"
                }
                Logo={
                  "https://ipfs.io/ipfs/QmNRgw61q81mUb2dRarA6NBFqdE3E9rsYYhRWfdfgcPMnL/earlypass.gif"
                }
                Name={"venomart Passes"}
                Description={"Exclusive Passes On Venomart Marketplace"}
                mintPrice={"1"}
                status={"Sold Out"}
                CollectionAddress={
                  "0:9a49dc04f979f0ed7b0b465fc2d9266e57025406497ad5038e4ff61259eaf9d2"
                }
                customLink={"custom/venomartPass"}
                verified={true}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Launchpad;
