import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import NftCard from "../../components/cards/NftCard";
import { MdVerified } from "react-icons/md";
import {
  BsArrowUpRight,
  BsBrowserChrome,
  BsDiscord,
  BsFillExclamationCircleFill,
  BsTelegram,
  BsTwitter,
} from "react-icons/bs";
import Head from "next/head";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import { loadNFTs_collection } from "../../utils/user_nft";
import venomLogo from "../../../public/venomBG.webp";
import defLogo from "../../../public/deflogo.png";
import defBack from "../../../public/defback.png";
import { get_collection_by_contract } from "../../utils/mongo_api/collection/collection";
import collectionAbi from "../../../abi/CollectionDrop.abi.json";

const Collection = ({
  blockURL,
  theme,
  standalone,
  webURL,
  copyURL,
  venomProvider,
}) => {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(false);
  const [isHovering, SetIsHovering] = useState(false);

  const [share, setShare] = useState(false);
  const [collection, set_collection] = useState({});
  const [nfts, set_nfts] = useState([]);
  const [totalSupply, setTotalSupply] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(16);

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentCollectionNFTs = nfts?.slice(firstPostIndex, lastPostIndex);

  const gettingCollectionInfo = async () => {
    if (!standalone && !slug) return;
    setLoading(true);
    // getting nfts
    const nfts = await loadNFTs_collection(standalone, slug);
    set_nfts(nfts);
    // getting contract info
    const res = await get_collection_by_contract(slug);
    set_collection(res?.data);
    // getting total supply
    if (venomProvider != undefined) {
      try {
        const contract = new venomProvider.Contract(collectionAbi, slug);
        const totalSupply = await contract.methods
          .totalSupply({ answerId: 0 })
          .call();
        setTotalSupply(totalSupply.count);
      } catch (error) {
        console.log("total supply error");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!slug) return;
    gettingCollectionInfo();
  }, [standalone, slug]);

  return (
    <div className={`${theme}`}>
      <Head>
        <title>Collection - Venomart Marketplace</title>
        <meta
          name="description"
          content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain"
        />
        <meta
          name="keywords"
          content={`venomart, nft collections on venom, top nft collection on venom, best NFTs on venom testnet`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>

      {loading ? (
        <Loader theme={theme} />
      ) : (
        <div className="dark:bg-jacarta-900">
          {/* <!-- Banner IMG--> */}
          <div className="relative pt-24">
            {collection?.coverImage ? (
              <Image
                src={collection?.coverImage?.replace(
                  "ipfs://",
                  "https://ipfs.io/ipfs/"
                )}
                width={100}
                height={100}
                alt="banner"
                className="h-[18.75rem] w-[100%] object-cover"
              />
            ) : (
              <Image
                src={defBack}
                width={100}
                height={100}
                alt="banner"
                className="h-[18.75rem] w-[100%] object-cover"
              />
            )}
          </div>

          {/* <!-- Collection Section --> */}
          <section className="relative bg-light-base pb-6 pt-20 dark:bg-jacarta-800">
            <div className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
              <div className="relative">
                {collection?.logo ? (
                  <Image
                    src={collection?.logo?.replace(
                      "ipfs://",
                      "https://ipfs.io/ipfs/"
                    )}
                    width={100}
                    height={100}
                    alt="collection avatar"
                    className="rounded-xl border-[5px] border-white dark:border-jacarta-600 h-[130px] w-[auto]"
                  />
                ) : (
                  <Image
                    src={defLogo}
                    width={100}
                    height={100}
                    alt="collection avatar"
                    className="rounded-xl border-[5px] border-white dark:border-jacarta-600 h-[130px] w-[auto]"
                  />
                )}
                <div className="absolute -right-3 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white dark:border-jacarta-600">
                  {collection?.isVerified ? (
                    <MdVerified
                      style={{ color: "#4f87ff", cursor: "pointer" }}
                      size={30}
                      onMouseOver={() => SetIsHovering(true)}
                      onMouseOut={() => SetIsHovering(false)}
                    />
                  ) : (
                    <BsFillExclamationCircleFill
                      style={{ color: "#c3c944", cursor: "pointer" }}
                      size={30}
                      onMouseOver={() => SetIsHovering(true)}
                      onMouseOut={() => SetIsHovering(false)}
                    />
                  )}
                </div>
                <div className="absolute mb-6 ml-[24px] mt-[-12px] inline-flex items-center justify-center">
                  {collection?.isVerified && isHovering && (
                    <p
                      className="bg-blue px-[20px] py-[3px] text-white text-[12px]"
                      style={{ borderRadius: "10px" }}
                    >
                      Verified
                    </p>
                  )}
                  {!collection?.isVerified && isHovering && (
                    <p
                      className="bg-[#c3c944] px-[10px] py-[3px] text-black text-[12px]"
                      style={{ borderRadius: "10px" }}
                    >
                      Not Verified
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="container">
              <div className="text-center">
                <div className="flex justify-center align-middle mb-6 mt-2">
                  {collection?.socials && (
                    <>
                      {collection?.socials[0] != "" && (
                        <a
                          href={
                            collection?.socials?.length
                              ? collection?.socials[0]
                              : "#"
                          }
                          target="_blank"
                          className="group ml-4"
                        >
                          <BsBrowserChrome className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                        </a>
                      )}
                      {collection?.socials[1] != "" && (
                        <a
                          href={
                            collection?.socials?.length
                              ? collection?.socials[1]
                              : "#"
                          }
                          target="_blank"
                          className="group ml-4"
                        >
                          <BsTwitter className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                        </a>
                      )}
                      {collection?.socials[2] != "" && (
                        <a
                          href={
                            collection?.socials?.length
                              ? collection?.socials[2]
                              : "#"
                          }
                          target="_blank"
                          className="group ml-4"
                        >
                          <BsDiscord className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                        </a>
                      )}
                      {collection?.socials[3] != "" && (
                        <a
                          href={
                            collection?.socials?.length
                              ? collection?.socials[3]
                              : "#"
                          }
                          target="_blank"
                          className="group ml-4"
                        >
                          <BsTelegram className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                        </a>
                      )}
                    </>
                  )}
                </div>

                <div className="mb-6 inline-flex items-center justify-center rounded-full border border-jacarta-100 bg-white py-1.5 px-4 dark:border-jacarta-600 dark:bg-jacarta-700">
                  <a
                    href={`${blockURL}accounts/${slug}`}
                    target="_blank"
                    className="js-copy-clipboard max-w-[10rem] select-none overflow-hidden text-ellipsis whitespace-nowrap dark:text-jacarta-200"
                  >
                    <span>{slug}</span>
                  </a>
                  <BsArrowUpRight
                    className="text-jacarta-700 dark:text-jacarta-200 cursor-pointer"
                    onClick={() =>
                      window.open(
                        `${blockURL}` + `accounts/` + `${slug}`,
                        "_blank"
                      )
                    }
                  />
                </div>
                <h2 className="mb-2 mt-2 font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                  {collection?.name ? collection?.name : "Undefined Collection"}
                </h2>
                <div className="mb-4"></div>

                {/* desc  */}
                <div className="mx-auto mb-14 max-w-xl text-lg dark:text-jacarta-300">
                  {collection?.description ? (
                    collection?.description
                  ) : (
                    <div>
                      This collection is tracked but not verified on Venomart.
                      If you are the owner, you can{" "}
                      <a
                        href="https://forms.gle/UtYWWkhsBYG9ZUjD8"
                        target="_blank"
                        className="text-blue-500"
                      >
                        submit
                      </a>{" "}
                      it now for approval now!
                    </div>
                  )}
                </div>

                {/* stats  */}
                <div className="mb-8 inline-flex flex-wrap items-center justify-center rounded-xl border border-jacarta-100 bg-white dark:border-jacarta-600 dark:bg-jacarta-800">
                  <a
                    href="#"
                    className="w-1/2 rounded-l-xl border-r border-jacarta-100 py-4 hover:shadow-md dark:border-jacarta-600 sm:w-32"
                  >
                    <div className="mb-1 text-base font-bold text-jacarta-700 dark:text-white">
                      {totalSupply ? totalSupply : nfts?.length + "+"}
                    </div>
                    <div className="text-2xs font-medium tracking-tight dark:text-jacarta-400">
                      Items
                    </div>
                  </a>
                  <a
                    href="#"
                    className="w-1/2 border-jacarta-100 py-4 hover:shadow-md dark:border-jacarta-600 sm:w-32 sm:border-r"
                  >
                    <div className="mb-1 text-base font-bold text-jacarta-700 dark:text-white">
                      {nfts ? nfts?.length : "0"}+
                    </div>
                    <div className="text-2xs font-medium tracking-tight dark:text-jacarta-400">
                      Owners
                    </div>
                  </a>
                  <a
                    href="#"
                    className="w-1/2 border-r border-jacarta-100 py-4 hover:shadow-md dark:border-jacarta-600 sm:w-32"
                  >
                    <div className="mb-1 flex items-center justify-center text-base font-medium text-jacarta-700 dark:text-white">
                      <Image
                        src={venomLogo}
                        height={100}
                        width={100}
                        style={{
                          height: "15px",
                          width: "15px",
                          marginTop: "2px",
                        }}
                        alt="Venomart"
                      />
                      <span className="font-bold ml-1">0</span>
                    </div>
                    <div className="text-2xs font-medium tracking-tight dark:text-jacarta-400">
                      Floor Price
                    </div>
                  </a>
                  <a
                    href="#"
                    className="w-1/2 rounded-r-xl border-jacarta-100 py-4 hover:shadow-md sm:w-32"
                  >
                    <div className="mb-1 flex items-center justify-center text-base font-medium text-jacarta-700 dark:text-white">
                      <Image
                        src={venomLogo}
                        height={100}
                        width={100}
                        style={{
                          height: "15px",
                          width: "15px",
                          marginTop: "2px",
                        }}
                        alt="Venomart"
                      />
                      <span className="font-bold ml-1">0</span>
                    </div>
                    <div className="text-2xs font-medium tracking-tight dark:text-jacarta-400">
                      Volume Traded
                    </div>
                  </a>
                </div>

                <div className="mt-6 flex items-center justify-center space-x-2.5">
                  {/* Share  */}
                  <div
                    onClick={() => setShare(!share)}
                    className="dropdown rounded-xl border border-jacarta-100 bg-white dark:border-jacarta-600 dark:bg-jacarta-800"
                  >
                    <a
                      className="dropdown-toggle inline-flex h-10 w-10 items-center justify-center text-sm"
                      role="button"
                      id="collectionShare"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      data-tippy-content="Share"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="h-4 w-4 fill-jacarta-500 dark:fill-jacarta-200"
                      >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M13.576 17.271l-5.11-2.787a3.5 3.5 0 1 1 0-4.968l5.11-2.787a3.5 3.5 0 1 1 .958 1.755l-5.11 2.787a3.514 3.514 0 0 1 0 1.458l5.11 2.787a3.5 3.5 0 1 1-.958 1.755z" />
                      </svg>
                    </a>

                    {share && (
                      <div className="dropdown-menu dropdown-menu-end z-10 min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">
                        <a
                          href={`https://twitter.com/intent/tweet?text=I%20found%20this%20collection%20on%20venomart.io%20check%20it%20here-%20${webURL}collection/${slug}%20`}
                          target="_blank"
                          className="flex w-full items-center rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                        >
                          <svg
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fab"
                            data-icon="twitter"
                            className="mr-2 h-4 w-4 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white"
                            role="img"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                          >
                            <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                          </svg>
                          <span className="mt-1 inline-block text-jacarta-700 dark:text-jacarta-200">
                            Twitter
                          </span>
                        </a>
                        <a
                          href="#"
                          onClick={copyURL}
                          className="flex w-full items-center rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="mr-2 h-4 w-4 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white"
                          >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z" />
                          </svg>
                          <span className="mt-1 inline-block text-jacarta-700 dark:text-jacarta-200">
                            Copy
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* nft section  */}
          <section className="relative py-24 pt-20">
            <div>
              <div className="tab-content">
                <div
                  className="tab-pane fade show active"
                  id="on-sale"
                  role="tabpanel"
                  aria-labelledby="on-sale-tab"
                >
                  <div className="flex justify-center align-middle flex-wrap">
                    {currentCollectionNFTs?.map((e, index) => {
                      return (
                        <NftCard
                          key={index}
                          ImageSrc={e?.preview?.source?.replace(
                            "ipfs://",
                            "https://ipfs.io/ipfs/"
                          )}
                          Name={e?.name}
                          Description={e?.description}
                          Address={e?.nftAddress?._address}
                        // listedBool={e.isListed}
                        // listingPrice={e.listingPrice}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-center">
                    {currentCollectionNFTs?.length <= 0 && (
                      <h2 className="text-xl font-display font-thin text-gray-700 dark:text-gray-300">
                        This collection has no NFTs !!
                      </h2>
                    )}
                  </div>
                </div>
                <Pagination
                  totalPosts={nfts?.length}
                  postsPerPage={postsPerPage}
                  setCurrentPage={setCurrentPage}
                  currentPage={currentPage}
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Collection;
