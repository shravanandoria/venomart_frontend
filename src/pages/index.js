import Image from 'next/image'
import Link from 'next/link';
import testNFT from "../../public/test.jpg";
import Head from 'next/head';
import CollectionCard from '@/components/cards/CollectionCard';
import LaunchCollectionCard from '@/components/cards/LaunchCollectionCard';
import SmallCollectionCard from '@/components/cards/SmallCollectionCard';

export default function Home({ theme }) {
  // test collection array 
  const all_collections = [{
    Cover: testNFT,
    Logo: testNFT,
    Name: "cover",
    OwnerAddress: "cover",
    CollectionAddress: "cover",
  }]

  return (
    <div className={`${theme} overflow-x-hidden font-body text-jacarta-500 dark:bg-jacarta-900`}>
      <Head>
        <title>Venomart- NFT Marketplace</title>
        <meta
          name="description"
          content="First Cross-chain And Multi-chain Advanced NFT Marketplace With AI NFT Generation"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>

      {/* hero section  */}
      <section className="relative pb-10 pt-20 md:pt-32 lg:h-[88vh] dark:bg-jacarta-800" id={`${theme == "dark" ? "heroBackDark" : "heroBackLight"}`}>
        <picture className="pointer-events-none absolute inset-x-0 top-0 -z-10 dark:hidden">
          <img src="img/gradient.jpg" alt="gradient" />
        </picture>
        <picture className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden dark:block">
          <img src="img/gradient_dark.jpg" alt="gradient dark" />
        </picture>

        <div className="container h-full">
          <div className="grid h-full items-center gap-4 md:grid-cols-12">
            <div
              className="col-span-6 flex h-full flex-col items-center justify-center py-10 md:items-start md:py-20 xl:col-span-4">
              <h1
                className="mb-6 text-center font-display text-5xl text-jacarta-700 dark:text-white md:text-left lg:text-6xl xl:text-7xl">
                Buy, sell and collect NFTs.
              </h1>
              <p className="mb-8 text-center text-lg dark:text-jacarta-200 md:text-left">
                The world's largest digital marketplace for crypto collectibles and non-fungible tokens
              </p>
              <div className="flex space-x-4">
                <a href="create.html"
                  className="w-36 rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark">
                  Upload
                </a>
                <a href="collections.html"
                  className="w-36 rounded-full bg-white py-3 px-8 text-center font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume">
                  Explore
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* launchpad collections  */}
      <div className="relative py-24 dark:bg-jacarta-800">
        <div className="container">
          <div className="mb-12 text-center font-display text-3xl text-jacarta-700 dark:text-white">
            <h2 className="inline">Venomart Launchpad </h2>
          </div>
          <div className="grid grid-cols-1 gap-[1.875rem] md:grid-cols-3 lg:grid-cols-4">
            {all_collections?.map((e, index) => {
              return (
                index < 8 && (
                  <LaunchCollectionCard
                    key={index}
                    Cover={e.Cover}
                    Logo={e.Logo}
                    Name={e.Name}
                    OwnerAddress={e.OwnerAddress}
                    CollectionAddress={e.CollectionAddress}
                  />
                )
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/collection/TopCollections"
              className="inline-block rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
            >
              View All
            </Link>
          </div>
        </div>
      </div>

      {/* top collections  */}
      <section className="relative py-24 dark:bg-jacarta-700">
        <div className="container">
          <div className="mb-12 text-center font-display text-3xl text-jacarta-700 dark:text-white">
            <h2 className="inline">Top collections over</h2>
            <div className="dropdown inline cursor-pointer">
              <button className="dropdown-toggle inline-flex items-center text-accent" type="button" id="collectionSort"
                data-bs-toggle="dropdown" aria-expanded="false">
                last 7 days
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                  className="h-8 w-8 fill-accent">
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z" />
                </svg>
              </button>
              <div
                className="dropdown-menu z-10 hidden min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800"
                aria-labelledby="collectionSort">
                <a className="dropdown-item block rounded-xl px-5 py-2 text-sm transition-colors hover:bg-jacarta-50 dark:hover:bg-jacarta-600"
                  href="#">Last 24 Hours</a>
                <a className="dropdown-item block rounded-xl px-5 py-2 text-sm transition-colors hover:bg-jacarta-50 dark:hover:bg-jacarta-600"
                  href="#">Last 7 Days</a>
                <a className="dropdown-item block rounded-xl px-5 py-2 text-sm transition-colors hover:bg-jacarta-50 dark:hover:bg-jacarta-600"
                  href="#">Last 30 Days</a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-[1.875rem] lg:grid-cols-4">
            {all_collections?.map((e, index) => {
              return (
                index < 8 && (
                  <SmallCollectionCard
                    key={index}
                    Cover={e.Cover}
                    Logo={e.Logo}
                    Name={e.Name}
                    OwnerAddress={e.OwnerAddress}
                    CollectionAddress={e.CollectionAddress}
                    theme={theme}
                  />
                )
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <a href="rankings.html"
              className="inline-block rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark">Go
              to Rankings</a>
          </div>
        </div>
      </section>

      {/* Trending collections  */}
      <div className="relative py-24 dark:bg-jacarta-800">
        <div className="container">
          <div className="mb-12 text-center font-display text-3xl text-jacarta-700 dark:text-white">
            <h2 className="inline">Trending Collections </h2>
          </div>
          <div className="grid grid-cols-1 gap-[1.875rem] md:grid-cols-3 lg:grid-cols-4">
            {all_collections?.map((e, index) => {
              return (
                index < 8 && (
                  <CollectionCard
                    key={index}
                    Cover={e.Cover}
                    Logo={e.Logo}
                    Name={e.Name}
                    OwnerAddress={e.OwnerAddress}
                    CollectionAddress={e.CollectionAddress}
                  />
                )
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/collection/TopCollections"
              className="inline-block rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
            >
              Explore All Collections
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
