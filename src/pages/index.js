import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import CollectionCard from "@/components/cards/CollectionCard";
import LaunchCollectionCard from "@/components/cards/LaunchCollectionCard";
import SmallCollectionCard from "@/components/cards/SmallCollectionCard";
import venomLogo from "../../public/venom.svg"
import Loader from "@/components/Loader";
import { MdVerified } from "react-icons/md";

export default function Home({ theme, collections, loading }) {
  return (
    <div
      className={`${theme} overflow-x-hidden font-body text-jacarta-500 dark:bg-jacarta-900`}
    >
      <Head>
        <title>Venomart - NFT Marketplace on Venom</title>
        <meta
          name="description"
          content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain"
        />
        <meta
          name="keywords"
          content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>

      {loading ?
        <Loader theme={theme} />
        :
        <>
          {/* hero section  */}
          <section className="relative pb-10 pt-20 md:pt-32 dark:bg-jacarta-800" id={`${theme == "dark" ? "heroBackDark" : "heroBackLight"}`}>
            <div className="h-full px-6 xl:px-20">
              <div className="grid h-full items-center gap-4 lg:grid-cols-12">
                <div className="col-span-6 flex h-full flex-col items-center justify-center py-10 md:items-start md:py-20 xl:col-span-5 xl:pl-[20%] xl:pr-[10%]">
                  <div className="mb-10 w-full sm:flex sm:space-x-4">
                    <div className="mb-4 flex-1 rounded-2lg bg-white p-4 text-center dark:bg-white/[.15]">
                      <span className="block font-display text-3xl text-[#8DD059]">
                        {collections?.length}
                      </span>
                      <span className="block font-display text-sm text-jacarta-500 dark:text-white">
                        NFT Collections
                      </span>
                    </div>
                    <div className="mb-4 flex-1 rounded-2lg bg-white p-4 text-center dark:bg-white/[.15]">
                      <span className="block font-display text-3xl text-[#737EF2]">
                        112
                      </span>
                      <span className="block font-display text-sm text-jacarta-500 dark:text-white">
                        NFTs Minted
                      </span>
                    </div>
                    <div className="mb-4 flex-1 rounded-2lg bg-white p-4 text-center dark:bg-white/[.15]">
                      <span className="flex justify-center align-middle font-display text-3xl text-[#F35BC7]">
                        3
                        <Image
                          src={venomLogo}
                          height={100}
                          width={100}
                          style={{
                            height: "19px",
                            width: "19px",
                            marginLeft: "8px",
                            marginTop: "6px"
                          }}
                        />
                      </span>
                      <span className="block font-display text-sm text-jacarta-500 dark:text-white">
                        Sale Volume
                      </span>
                    </div>
                  </div>
                  <h1 className="mb-6 text-center font-display text-5xl text-jacarta-700 dark:text-white md:text-left lg:text-5xl xl:text-6xl">
                    Buy, sell and collect NFTs.
                  </h1>
                  <p className="mb-8 text-center text-lg dark:text-jacarta-200 md:text-left">
                    Venomart is the first fully-fledged NFT Marketplace on Venom.
                    Get quick and easy access to digital collectibles and explore,
                    buy and sell NFTs
                  </p>
                  <div className="flex flex-wrap justify-center align-middle space-x-4">
                    <Link
                      href="/explore/NFTs"
                      className="w-45 mb-4 rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                    >
                      Explore NFTs
                    </Link>
                    <Link
                      href="/explore/Collections"
                      className="w-45 mb-4 rounded-full bg-white py-3 px-8 ml-[-225px] text-center font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume"
                    >
                      Explore Collections
                    </Link>
                  </div>
                </div>

                {/* <!-- featured collections --> */}
                <div className="relative col-span-6 xl:col-span-6 xl:col-start-7">
                  <div className="md:flex md:space-x-6 xl:space-x-12">
                    {/* featured 1 */}
                    <div className="mb-6 md:flex md:w-1/2 md:items-center ">
                      <div>
                        <div className="block overflow-hidden rounded-2.5xl bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-jacarta-700">
                          <div className="relative">
                            {/* cover imge  */}
                            <Link href="/collection/0:b840eec9db67755c0f65ea61fab15f7fa39b2d41d1ab86c88d44bf35c9d333e0">
                              <img
                                src="https://ipfs.io/ipfs/QmNRgw61q81mUb2dRarA6NBFqdE3E9rsYYhRWfdfgcPMnL/earlypass.gif"
                                alt="item 1"
                                className="w-full object-cover"
                                height="437"
                                width="406"
                              />
                            </Link>
                          </div>
                          <div className="p-6">
                            <div className="flex">
                              {/* logo  */}
                              <Link href="/collection/0:b840eec9db67755c0f65ea61fab15f7fa39b2d41d1ab86c88d44bf35c9d333e0" className="shrink-0">
                                <img
                                  src="https://ipfs.io/ipfs/QmNRgw61q81mUb2dRarA6NBFqdE3E9rsYYhRWfdfgcPMnL/earlypass.gif"
                                  alt="avatar"
                                  className="mr-4 h-10 w-10 rounded-full"
                                  height={100}
                                  width={100}
                                />
                              </Link>
                              <div>
                                {/* name  */}
                                <Link href="/collection/0:b840eec9db67755c0f65ea61fab15f7fa39b2d41d1ab86c88d44bf35c9d333e0" className="block">
                                  <span className="flex align-middle font-display text-lg leading-none text-jacarta-700 hover:text-accent dark:text-white">
                                    Venom Passes
                                    <MdVerified
                                      style={{ color: "#4f87ff", marginBottom: "3px", marginLeft: "3px" }}
                                      size={21}
                                    />
                                  </span>
                                </Link>

                                <a className="text-2xs text-accent dark:text-white">
                                  1000+ Items | 200+ Owners
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* featured 2  */}
                    {/* <div className="space-y-6 md:w-1/2 xl:space-y-12">
                      <div>
                        <div className="block overflow-hidden rounded-2.5xl bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-jacarta-700">
                          <div className="relative">
                            <Link href={"/collection/0:def84d678dd3887d627ddfa430faf4f488bc426e61237d34e1d069ccb87641cb"}>
                              <img
                                src="https://ipfs.ventory.gg/ventory/upload-quest/5png1690035055140.png"
                                alt="item 1"
                                className="w-full object-cover"
                                height="437"
                                width="406"
                              />
                            </Link>
                          </div>
                          <div className="p-6">
                            <div className="flex">
                              <Link href={"/collection/0:def84d678dd3887d627ddfa430faf4f488bc426e61237d34e1d069ccb87641cb"} className="shrink-0">
                                <img
                                  src="https://ipfs.ventory.gg/ventory/upload-quest/5png1690035055140.png"
                                  alt="avatar"
                                  className="mr-4 h-10 w-10 rounded-full"
                                  height={100}
                                  width={100}
                                />
                              </Link>
                              <div>
                                <Link href={"/collection/0:def84d678dd3887d627ddfa430faf4f488bc426e61237d34e1d069ccb87641cb"} className="block">
                                  <span className="font-display text-lg leading-none text-jacarta-700 hover:text-accent dark:text-white">
                                    Chew Chew
                                  </span>
                                </Link>

                                <a className="text-2xs text-accent dark:text-white">
                                  2222 Items | 1650 Owners
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            {theme === "dark" && (
              <div class="custom-shape-divider-bottom-1690698441">
                <svg
                  data-name="Layer 1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                    class="shape-fill"
                  ></path>
                </svg>
              </div>
            )}
          </section>

          {/* launchpad collections  */}
          <div className="relative py-24 dark:bg-jacarta-800">
            <div className="container">
              <div className="mb-12 text-center font-display text-3xl text-jacarta-700 dark:text-white">
                <h2 className="inline">Venomart Launchpad </h2>
              </div>
              <div className="flex justify-center align-middle flex-wrap">
                {/* {all_collections?.map((e, index) => {
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
                })} */}

                {/* hardcoding here  */}
                <LaunchCollectionCard
                  Cover={
                    "https://ipfs.io/ipfs/QmdhUuDUXrAfHEwx7tEWw6LnFRhTx4DurmieaBW5WvFARu/20230729_204210.jpg"
                  }
                  Logo={
                    "https://ipfs.io/ipfs/QmNRgw61q81mUb2dRarA6NBFqdE3E9rsYYhRWfdfgcPMnL/earlypass.gif"
                  }
                  Name={"venomart Passes"}
                  Description={"venomart Passes"}
                  mintPrice={"1"}
                  status={"Live"}
                  CollectionAddress={
                    "0:b840eec9db67755c0f65ea61fab15f7fa39b2d41d1ab86c88d44bf35c9d333e0"
                  }
                  customLink={"/custom/venomartPass"}
                  verified={true}
                />
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/explore/Launchpad"
                  className="inline-block rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* top collections  */}
          {/* <section className="relative py-24 dark:bg-jacarta-700">
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
          </section> */}

          {/* Latest collections  */}
          <div className="relative py-24 dark:bg-jacarta-800">
            <div className="container">
              <div className="mb-12 text-center font-display text-3xl text-jacarta-700 dark:text-white">
                <h2 className="inline">Latest Collections </h2>
              </div>
              <div className="flex justify-center align-middle flex-wrap">
                {collections?.map((e, index) => {
                  return (
                    index < 6 && (
                      <CollectionCard
                        key={index}
                        Cover={e.coverImage}
                        Logo={e.logo}
                        Name={e.name}
                        OwnerAddress={e.OwnerAddress}
                        CollectionAddress={e.contractAddress}
                        verified={e.isVerified}
                      />
                    )
                  );
                })}
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/explore/Collections"
                  className="inline-block rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                >
                  Explore All Collections
                </Link>
              </div>
            </div>
          </div>
        </>
      }
    </div>
  );
}
