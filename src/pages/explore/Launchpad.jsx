import React, { useEffect, useState } from "react";
import Head from "next/head";
import LaunchCollectionCard from "../../components/cards/LaunchCollectionCard";
import InfiniteScroll from "react-infinite-scroll-component";
import { get_launchpad_events } from "../../utils/mongo_api/launchpad/launchpad";

const Launchpad = ({ theme, OtherImagesBaseURI }) => {

  const [collections, set_collections] = useState([]);
  const [skip, setSkip] = useState(0);
  const [sortby, setSortBy] = useState("upcoming");
  const [hasMore, setHasMore] = useState(true);

  const scrollFetchLaunches = async () => {
    const collectionsJSON = await get_launchpad_events(sortby, skip);
    if (collectionsJSON) {
      set_collections([...collections, ...collectionsJSON]);
      if (collectionsJSON == "" || collectionsJSON == undefined) {
        setHasMore(false);
      }
    }
  };

  const handleScroll = () => {
    setSkip(collections.length);
  };

  useEffect(() => {
    scrollFetchLaunches();
  }, [skip]);
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
        <meta name="robots" content="INDEX,FOLLOW" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.webp" />
      </Head>

      <div className={`${theme}`}>
        <section className="relative py-24 dark:bg-jacarta-900">
          <div className="container">
            <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
              Launchpad Collections🚀
            </h1>
            <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
              Explore all the exclusive collections on venomart launchpad
            </p>


            <div className="flex justify-center align-middle flex-wrap">
              <InfiniteScroll
                dataLength={collections ? collections?.length : 0}
                next={handleScroll}
                hasMore={hasMore}
                className="flex flex-wrap justify-center align-middle"
                loader={
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                    <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                    <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                  </div>
                }
              >
                {collections?.map((e, index) => {
                  const endLength = e?.phases?.length - 1;
                  return (
                    <LaunchCollectionCard
                      key={index}
                      Cover={e.coverImage}
                      Logo={e.logo}
                      Name={e.name}
                      pageName={e.pageName}
                      Description={e.description}
                      mintPrice={e?.phases[endLength]?.mintPrice}
                      supply={e.maxSupply}
                      status={e.status}
                      verified={true}
                      CollectionAddress={e.contractAddress}
                      startDate={e?.phases[0]?.startDate}
                      endDate={e?.phases[endLength]?.EndDate}
                      OtherImagesBaseURI={OtherImagesBaseURI}
                    />
                  );
                })}
              </InfiniteScroll>
            </div>
          </div>
        </section >
      </div >
    </>
  );
};

export default Launchpad;