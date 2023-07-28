import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import NftCard from "@/components/cards/NftCard";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { BsDiscord, BsFillExclamationCircleFill, BsInstagram, BsTelegram, BsTwitter } from "react-icons/bs";
import { AiFillCloseCircle } from "react-icons/ai";
import Head from "next/head";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";

import fav from "../../../public/fav.png"

const Collection = ({
    blockURL,
    theme
}) => {
    const router = useRouter();
    const { slug } = router.query;

    const [loading, setLoading] = useState(false);

    const [actionVerify, setActionVerify] = useState(false);
    const [share, setShare] = useState(false);
    const [collection, set_collection] = useState({});
    const [nfts, set_nfts] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(16);

    const lastPostIndex = currentPage * postsPerPage;
    const firstPostIndex = lastPostIndex - postsPerPage;
    const currentCollectionNFTs = nfts?.slice(firstPostIndex, lastPostIndex);

    const verifyAction = () => {
        setLoading(true);
        setTimeout(() => {
            setActionVerify(true);
            setLoading(false);
        }, 2000);
    }

    return (
        <div className={`${theme}`}>
            <Head>
                <title>Collection - Venomart Marketplace</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.png" />
            </Head>

            {loading ? (
                <Loader theme={theme} />
            ) : (
                <div className="dark:bg-jacarta-900">
                    {/* <!-- Intro Section--> */}
                    <div className="relative pt-24 h-[100%] w-[100%]">
                        <div className="container h-full w-full">
                            <div className="grid h-full items-center gap-4 md:grid-cols-12">
                                {/* left section  */}
                                <div className="col-span-6 flex h-full flex-col items-center justify-center py-10 md:items-start md:py-20 xl:col-span-4">
                                    {/* title  */}
                                    <h1 className="flex mb-6 text-center font-display text-[12px] text-jacarta-700 dark:text-white md:text-left lg:text-6xl xl:text-7xl" style={{ fontSize: "35px" }}>
                                        <span> Venom Punks </span> <MdVerified style={{ color: "#4f87ff", cursor: "pointer", marginTop: "5px", marginLeft: "7px" }} size={30} />
                                    </h1>
                                    {/* social icons  */}
                                    <div className="flex space-x-4 mb-6 mt-[-8px] ml-[7px]">
                                        {/* twitter  */}
                                        <a href="https://twitter.com/venomart23" target="_blank" className="group">
                                            <BsTwitter className="h-6 w-6 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                                        </a>
                                        {/* discord  */}
                                        <a href="https://discord.gg/wQbBr6Xean" target="_blank" className="group">
                                            <BsDiscord className="h-6 w-6 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                                        </a>
                                        {/* instagram */}
                                        <a href="https://discord.gg/wQbBr6Xean" target="_blank" className="group">
                                            <BsInstagram className="h-6 w-6 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                                        </a>
                                        {/* telegram */}
                                        <a href="https://discord.gg/wQbBr6Xean" target="_blank" className="group">
                                            <BsTelegram className="h-6 w-6 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                                        </a>
                                    </div>
                                    {/* short desc  */}
                                    <p className="mb-8 text-center text-lg dark:text-jacarta-200 md:text-left">
                                        Punks is a hand drawn 1/1 PFP collection by muimooi. AxA is the Alpha Gang in AVAX, Profile picture illustration. Supply 50 characters
                                    </p>
                                    {/* action  */}
                                    <div className="flex space-x-6">
                                        <a href="create.html"
                                            className="w-36 rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark" >
                                            Explorer
                                        </a>
                                        <a href="collections.html"
                                            className="w-36 rounded-full bg-white py-3 px-8 text-center font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume">
                                            Collection
                                        </a>
                                    </div>
                                </div>

                                {/* right section   */}
                                <div className="col-span-6 xl:col-span-8">
                                    <div className="relative text-center md:pl-8 md:text-right">
                                        <img src="../axa.jpeg" alt="" style={{ borderRadius: "25px" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <!-- Mint Section --> */}
                    <section className="relative bg-light-base pb-12 pt-12 dark:bg-jacarta-800">
                        <section className="text-gray-600 body-font overflow-hidden">
                            <div className="container px-5 py-24 mx-auto">
                                <div className="lg:w-4/5 mx-auto flex flex-wrap justify-between w[100%]">
                                    <img alt="ecommerce" className="lg:w-1/2 w-full lg:h-auto h-64 object-cover object-center rounded" src="https://dummyimage.com/400x400" />
                                    <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
                                        <h2 className="text-sm title-font text-gray-500 tracking-widest">PUBLIC MINT</h2>
                                        <h1 className=" text-[8px] text-jacarta-700 dark:text-white text-3xl title-font font-medium mb-1">Tasks :</h1>
                                        <div className="flex mt-6 items-center pb-5 border-gray-100 ">
                                            <p className=" text-center text-lg dark:text-jacarta-200 md:text-left">
                                                Follow punks on twitter
                                            </p>
                                            <button className="flex ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded">Follow</button>
                                        </div>
                                        <div className="flex items-center pb-5 border-b-2 dark:border-gray-100 mb-5">
                                            <p className="text-center text-[20px] dark:text-jacarta-200 md:text-left">
                                                Join our discord server
                                            </p>
                                            <button className="flex ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded">Join</button>
                                        </div>
                                        <div className="flex items-center pb-5 border-b-2 border-gray-100 mb-5">
                                            <p className="text-center text-[17px] dark:text-jacarta-200 md:text-left">
                                                After completing tasks please verify to start minting..
                                            </p>
                                            {actionVerify ?
                                                <button className="w-[60%] flex ml-auto text-white bg-green border-0 py-2 px-6 focus:outline-none rounded">Verified</button>
                                                :
                                                <button onClick={verifyAction} className="w-[60%] flex ml-auto text-white bg-red border-0 py-2 px-6 focus:outline-none rounded">Verify</button>
                                            }
                                        </div>
                                        <div className="flex">
                                            {/* price  */}
                                            <div>
                                                <span className="title-font font-medium text-[23px] text-jacarta-700 dark:text-white">price : </span>
                                                <span className="title-font font-medium text-[19px] text-gray-400 text-center mt-[6px] ml-[3px]"> 1 VENOM</span>
                                            </div>

                                            {/* mint  */}
                                            <button className="flex ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded">Mint</button>

                                            {/* share btn  */}
                                            <button className="rounded-full w-10 h-10 bg-gray-200 p-0 border-0 inline-flex items-center justify-center text-gray-500 ml-4">
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
                                                        {share ?
                                                            <AiFillCloseCircle className="h-6 w-6 fill-jacarta-500 dark:fill-jacarta-200" />
                                                            :
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
                                                        }
                                                    </a>

                                                    {share && (
                                                        <div className="dropdown-menu dropdown-menu-end z-10 min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">
                                                            <a
                                                                href="https://twitter.com/home"
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
                                                                <span className="mt-1 inline-block text-black dark:text-white">
                                                                    Twitter
                                                                </span>
                                                            </a>
                                                            <a
                                                                href="https://gmail.com"
                                                                target="_blank"
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
                                                                    <path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm9.06 8.683L5.648 6.238 4.353 7.762l7.72 6.555 7.581-6.56-1.308-1.513-6.285 5.439z" />
                                                                </svg>
                                                                <span className="mt-1 inline-block text-black dark:text-white">
                                                                    Email
                                                                </span>
                                                            </a>
                                                            <a
                                                                href="#"
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
                                                                <span className="mt-1 inline-block text-black dark:text-white">
                                                                    Copy
                                                                </span>
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </section>
                </div>
            )}
        </div>
    );
};

export default Collection;
