import React, { useState } from "react";
import Head from "next/head";
import Pagination from "../../components/Pagination";
import LaunchCollectionCard from "../../components/cards/LaunchCollectionCard";

const Launchpad = ({ theme, customLaunchpad }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(12);

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentCollections = customLaunchpad?.slice(
    firstPostIndex,
    lastPostIndex
  );

  return (
    <>
      <Head>
        <title>Exclusive Launchpad - Venomart Marketplace</title>
        <meta
          name="description"
          content="Exclusive launchpad of venomart | Powered by Venom Blockchain"
        />
        <meta
          name="keywords"
          content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>

      <div className={`${theme}`}>
        <section className="relative py-24 dark:bg-jacarta-900">
          <div className="container">
            <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
              Launchpad Collections
            </h1>
            <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
              Explore all the exclusive collections on venomart launchpad
            </p>


            <div className="flex justify-center align-middle flex-wrap">
              {/* fetching custom laucnh here  */}
              {currentCollections?.sort(({ id: previousID }, { id: currentID }) => currentID - previousID)?.map((e, id) => {
                return (
                  id < 7 && e.verified == true && (
                    <LaunchCollectionCard
                      key={id}
                      Cover={e.Cover}
                      Logo={e.Logo}
                      Name={e.Name}
                      Description={e.Description}
                      mintPrice={e.mintPrice}
                      status={e.status}
                      CollectionAddress={e.CollectionAddress}
                      customLink={e.customLink}
                      verified={e.verified}
                      startDate={e.startDate}
                      endDate={e.endDate}
                    />
                  )
                );
              })}
            </div>
            <Pagination
              totalPosts={customLaunchpad.length}
              postsPerPage={postsPerPage}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default Launchpad;