import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import testNFT from "../../../public/twitterback.png";
import Image from "next/image";
import NftCard from "@/components/cards/NftCard";
import CollectionCard from "@/components/cards/LaunchCollectionCard";
import Loader from "@/components/Loader";
import Head from "next/head";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { loadNFTs_user } from "@/utils/user_nft";

const Profile = ({ theme, signer_address, blockURL, standalone }) => {
  const [user_data, set_user_data] = useState({});
  const [loading, set_loading] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const [myNFTsActive, setMyNFTSActive] = useState(true);
  const [my_collections, set_my_collections] = useState([]);
  const [nfts, set_nfts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(12);

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentNFTs = nfts?.slice(firstPostIndex, lastPostIndex);

  const get_my_nfts = async () => {
    const res = await loadNFTs_user(standalone, signer_address);
    console.log(res);
    set_nfts(res);
  };

  useEffect(() => {
    if (!standalone && !signer_address) return;

    get_my_nfts();
  }, [standalone, signer_address]);

  return loading ? (
    <Loader />
  ) : (
    <div className={`${theme} w-[100%] dark:bg-jacarta-900`}>
      <Head>
        <title>Profile - Venomart Marketplace</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>
      {/* <!-- Banner IMG--> */}
      <div className="relative pt-24 dark:bg-jacarta-800">
        <Image
          src={
            user_data?.coverImage?.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            ) || testNFT
          }
          alt="banner"
          height={100}
          width={100}
          className="h-[18.75rem] w-[100%] object-cover"
        />
      </div>

      {/* <!-- Profile Section --> */}
      <section className="relative pb-6 pt-28 dark:bg-jacarta-800">
        <div className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <figure className="relative">
            <Image
              src={
                user_data?.profileImage?.replace(
                  "ipfs://",
                  "https://ipfs.io/ipfs/"
                ) || testNFT
              }
              alt="collection avatar"
              height={100}
              width={100}
              className="rounded-xl border-[5px] border-white dark:border-jacarta-600 h-[130px] w-[auto]"
            />
          </figure>
        </div>

        <div className="container">
          <div className="text-center">
            {/* username  */}
            <h2 className="mb-6 mt-[-15px] font-display text-4xl font-medium text-jacarta-700 dark:text-white">
              {user_data?.username}
            </h2>

            {/* block URL  */}
            <div className="mt-[-30px] mb-8 inline-flex items-center justify-center rounded-full border border-jacarta-100 bg-white py-1.5 px-4 dark:border-jacarta-600 dark:bg-jacarta-700">
              <a
                href={`${blockURL}` + `address/` + `${slug}`}
                target="_blank"
                className="js-copy-clipboard max-w-[10rem] select-none overflow-hidden text-ellipsis whitespace-nowrap dark:text-jacarta-200"
              >
                <span>{slug}</span>
              </a>
            </div>

            {/* bio  */}
            <p className="mx-auto max-w-xl text-lg dark:text-jacarta-300 mb-6">
              {user_data?.bio}
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam
              officiis similique pariatur recusandae eos labore excepturi, culpa
              qui. Hic obcaecati, quas non delectus nihil fugiat voluptatem
              ratione ipsa ea atque alias laborum odit facere! Corporis
              architecto beatae cupiditate hic in sequi temporibus id aperiam
              deserunt.
            </p>

            {/* join date */}
            <p className="mx-auto max-w-xl text-[16px] dark:text-jacarta-400 mb-6">
              Joined December 2019
            </p>

            {/* social accounts  */}
            {signer_address && (
              <div className="flex justify-center align-middle mb-10 mt-4">
                <a
                  href={
                    user_data?.socials?.length ? user_data?.socials[0] : "#"
                  }
                  target="_blank"
                  className="group mr-4"
                >
                  <svg
                    className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                  </svg>
                </a>
                <a
                  href={
                    user_data?.socials?.length ? user_data?.socials[1] : "#"
                  }
                  target="_blank"
                  className="group"
                >
                  <svg
                    className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                  >
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                  </svg>
                </a>
              </div>
            )}

            {/* edi tprofile btn  */}
            {slug == signer_address && (
              <div className="flex justify-center align-middle mb-10">
                <Link
                  href="EditProfile"
                  className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                >
                  Edit Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* switch buttons  */}
      <section className="pt-6 dark:bg-jacarta-900">
        <ul
          className="nav nav-tabs scrollbar-custom pb-12 flex items-center justify-start overflow-x-auto overflow-y-hidden border-jacarta-100 dark:border-jacarta-600 md:justify-center"
          role="tablist"
        >
          {/* my nfts button  */}
          <li
            className="nav-item"
            role="presentation"
            onClick={() => setMyNFTSActive(true)}
          >
            <button
              className={`nav-link ${
                myNFTsActive && "active relative"
              } flex items-center whitespace-nowrap py-3 px-6 text-jacarta-400 hover:text-jacarta-700 dark:hover:text-white`}
              id="created-tab"
              data-bs-toggle="tab"
              data-bs-target="#created"
              type="button"
              role="tab"
              aria-controls="created"
              aria-selected="false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="mr-1 h-5 w-5 fill-current"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M5 5v3h14V5H5zM4 3h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 9h6a1 1 0 0 1 1 1v3h1v6h-4v-6h1v-2H5a1 1 0 0 1-1-1v-2h2v1zm11.732 1.732l1.768-1.768 1.768 1.768a2.5 2.5 0 1 1-3.536 0z" />
              </svg>
              <span className="font-display text-base font-medium">
                My NFTs ({nfts?.length ? nfts?.length : "0"})
              </span>
            </button>
          </li>

          {/* my collections button  */}
          <li
            className="nav-item"
            role="presentation"
            onClick={() => setMyNFTSActive(false)}
          >
            <button
              className={`nav-link ${
                !myNFTsActive && "active relative"
              } flex items-center whitespace-nowrap py-3 px-6 text-jacarta-400 hover:text-jacarta-700 dark:hover:text-white`}
              id="collections-tab"
              data-bs-toggle="tab"
              data-bs-target="#collections"
              type="button"
              role="tab"
              aria-controls="collections"
              aria-selected="false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="mr-1 h-5 w-5 fill-current"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
              </svg>
              <span className="font-display text-base font-medium">
                My Collections
              </span>
            </button>
          </li>
        </ul>
      </section>

      {myNFTsActive == true ? (
        <section className="relative py-24 pt-20 dark:bg-jacarta-900">
          <div className="container">
            <div className="tab-content">
              <div
                className="tab-pane fade show active"
                id="on-sale"
                role="tabpanel"
                aria-labelledby="on-sale-tab"
              >
                <div className="grid grid-cols-1 gap-[2rem] md:grid-cols-3 lg:grid-cols-4">
                  {currentNFTs?.map((e, index) => {
                    return (
                      <NftCard
                        key={index}
                        ImageSrc={e?.nft_image?.replace(
                          "ipfs://",
                          "https://ipfs.io/ipfs/"
                        )}
                        Name={e?.ipfsData?.name}
                        Description={e?.ipfsData?.description}
                        Address={e?.ipfsData?.collection}
                        tokenId={e?.tokenId}
                        chainImgPre={"../"}
                        listedBool={e?.isListed}
                        chain_image={e?.chain_image}
                        chain_symbol={e?.chain_symbol}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-center">
                  {currentNFTs?.length <= 0 && (
                    <h2 className="text-xl font-display font-thin dark:text-jacarta-200">
                      No NFTs to show!
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
      ) : (
        //fetch collections here
        <section className="relative py-24 pt-20 dark:bg-jacarta-900">
          <div className="container">
            <div className="tab-content">
              <div
                className="tab-pane fade show active"
                id="on-sale"
                role="tabpanel"
                aria-labelledby="on-sale-tab"
              >
                <div className="grid grid-cols-1 gap-[1.875rem] md:grid-cols-3 lg:grid-cols-4">
                  {my_collections?.map((e, index) => (
                    <CollectionCard
                      key={index}
                      Cover={e.coverImage}
                      Logo={e.logo}
                      Name={e.name}
                      Description={e.description}
                      OwnerAddress={e.owner}
                      CollectionAddress={e.collection_address}
                      chain_image={e.chain_image}
                      isCollectionVerified={e.isCollectionVerified}
                      chainImgPre={"../"}
                    />
                  ))}
                </div>
                <div className="flex justify-center">
                  {my_collections?.length <= 0 && (
                    <h2 className="text-xl font-display font-thin dark:text-jacarta-200">
                      No Collections to show!
                    </h2>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;
