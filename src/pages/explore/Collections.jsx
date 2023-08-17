import React, { useEffect, useState } from "react";
import CollectionCard from "../../components/cards/CollectionCard";
import Head from "next/head";
import Loader from "../../components/Loader";
import { get_collections } from "../../utils/mongo_api/collection/collection";

const Collections = ({ theme }) => {
  const [collections, set_collections] = useState([]);
  const [skip, setSkip] = useState(3);

  const [loading, setLoading] = useState(false);

  const scrollFetchCollections = async () => {
    const collectionsJSON = await get_collections(skip);
    set_collections([...collections, ...collectionsJSON]);
  };

  const handleScroll = (e) => {
    const { offsetHeight, scrollTop, scrollHeight } = e.target;
    if (offsetHeight + scrollTop + 10 >= scrollHeight) {
      setSkip(collections.length);
    }
  };

  useEffect(() => {
    scrollFetchCollections();
  }, [skip]);

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
        <div className={`${theme} scroll-list`} onScroll={handleScroll}>
          <section className="relative py-24 dark:bg-jacarta-800">
            <div className="container">
              <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                Explore Collections
              </h1>
              <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                Explore and trade the amazing collections on venomart
                marketplace
              </p>

              {/* loop collections here  */}
              <div className="flex justify-center align-middle flex-wrap">
                {collections?.map((e, index) => (
                  <CollectionCard
                    key={index}
                    Cover={e?.coverImage}
                    Logo={e?.logo}
                    Name={e?.name}
                    Description={e?.description}
                    OwnerAddress={e?.OwnerAddress}
                    CollectionAddress={e?.contractAddress}
                    verified={e?.isVerified}
                  />
                ))}
                {collections?.length <= 0 && (
                  <h2 className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                    No Collections Found
                  </h2>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default Collections;
