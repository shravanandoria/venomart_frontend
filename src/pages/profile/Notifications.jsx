import { React, useState, useEffect } from "react";
import Image from "next/image";
import Head from "next/head";
import { deleteNotification, getNotification } from "../../utils/mongo_api/notification/notification";
import venomLogo from "../../../public/venomBG.webp";
import { AiOutlineDelete } from "react-icons/ai";
import moment from 'moment';
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";

const Notifications = ({ signer_address, theme, blockURL }) => {

    const [loading, set_loading] = useState(false);
    const [moreLoading, setMoreLoading] = useState(false);
    const [btn_loading, set_btn_loading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [notificationData, setNotificationData] = useState();
    const [skip, setSkip] = useState(0);

    const [propShow, setPropShow] = useState(true);

    const getNotificationData = async () => {
        set_loading(true);
        const getData = await getNotification(signer_address, skip);
        setNotificationData(getData);
        if (getData == "") {
            setHasMore(false);
        }
        set_loading(false);
    }

    // on scroll fetch nft activity
    const scroll_fetch_notifications = async () => {
        if (skip == 0) return;
        setMoreLoading(true);
        const getData = await getNotification(signer_address, skip);
        if (getData) {
            setNotificationData([...notificationData, ...getData]);
        }
        if (getData == "") {
            setHasMore(false);
        }
        setMoreLoading(false);
    };

    const handleScroll = (e) => {
        setSkip(notificationData?.length);
    };

    const deleteSeletedNotification = async () => {
        set_btn_loading(true);
        const deleteNoti = await deleteNotification(notificationData[0]?._id);
        getNotificationData();
        set_btn_loading(false);
    }

    useEffect(() => {
        if (!signer_address) return;
        getNotificationData();
    }, [signer_address])

    useEffect(() => {
        if (!skip) return;
        scroll_fetch_notifications();
    }, [skip])

    return (
        <div className={`${theme}`}>
            <Head>
                <title>Notifications - Venomart Marketplace</title>
                <meta
                    name="description"
                    content="All your activity notifications on venomart marketplace"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.webp" />
            </Head>

            <section className="relative py-24 dark:bg-jacarta-900">
                <div className="container">
                    <h1 className="mt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">Notifications🔔</h1>
                    <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                        Stay updated with all your important activities on venomart marketplace
                    </p>

                    <div className="scrollbar-custom overflow-x-auto rounded-lg">
                        <div className="min-w-fit">
                            <ul className="nav nav-tabs flex items-center" role="tablist">
                                <li
                                    className="nav-item"
                                    role="presentation"
                                    onClick={() => setPropShow(true)}
                                >
                                    <button
                                        className={`nav-link ${propShow &&
                                            "active relative"} flex items-center whitespace-nowrap py-3 px-6 text-jacarta-400 hover:text-jacarta-700 dark:hover:text-white`}
                                    >
                                        <span className="font-display text-base font-medium">
                                            Activity Notifications
                                        </span>
                                    </button>
                                </li>

                                {/* <!-- Details --> */}
                                <li
                                    className="nav-item"
                                    role="presentation"
                                    onClick={() => (setPropShow(false))}
                                >
                                    <button
                                        className={`nav-link ${!propShow &&
                                            "active relative"} flex items-center whitespace-nowrap py-3 px-6 text-jacarta-400 hover:text-jacarta-700 dark:hover:text-white`}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width="24"
                                            height="24"
                                            className="mr-1 h-5 w-5 fill-current"
                                        >
                                            <path fill="none" d="M0 0h24v24H0z" />
                                            <path d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1zm-1-2V4H5v16h14zM7 6h4v4H7V6zm0 6h10v2H7v-2zm0 4h10v2H7v-2zm6-9h4v2h-4V7z" />
                                        </svg>
                                        <span className="font-display text-base font-medium">
                                            Marketplace Updates
                                        </span>
                                    </button>
                                </li>
                            </ul>

                            {/* <!-- Tab Contents --> */}
                            <div className="tab-content">
                                {propShow ? (
                                    <div>
                                        <div className="rounded-t-2lg rounded-b-2lg rounded-tl-none border border-jacarta-100 bg-white p-6 dark:border-jacarta-600 dark:bg-jacarta-900 md:p-10">
                                            <InfiniteScroll
                                                dataLength={notificationData ? notificationData?.length : 0}
                                                next={handleScroll}
                                                hasMore={hasMore}
                                                className="mb-10 shrink-0 basis-8/12 space-y-5 lg:mb-0 lg:pr-10"
                                                loader={
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                                                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                                                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                                                    </div>
                                                }
                                            >
                                                {notificationData?.map((notification, index) => {
                                                    return (
                                                        <div key={index} className="relative flex flex-wrap items-center rounded-2.5xl border border-jacarta-100 bg-white p-8 transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700">
                                                            <Link href={`/nft/${notification?.nft?.NFTAddress}`} className="mr-5 self-start">
                                                                <Image src={notification?.nft?.nft_image} alt="avatar 2" className="rounded-2lg h-[75px] w-[75px] object-cover mb-2" loading="lazy" height={100} width={100} />
                                                            </Link>

                                                            <div>
                                                                <h3 className="mb-1 font-display text-base font-semibold text-jacarta-700 dark:text-white">
                                                                    Sold Successfully🎉
                                                                </h3>
                                                                <span className="flex flex-wrap mb-3 text-sm text-jacarta-500 dark:text-jacarta-200">
                                                                    <Link href={notification?.soldTo} className="text-blue mr-1">
                                                                        {notification?.fromUser ? notification?.fromUser : ((notification?.soldTo).slice(0, 5) + "..." + (notification?.soldTo).slice(63))}
                                                                    </Link>
                                                                    has purchased your listed NFT {notification?.nft?.name} for
                                                                    <Image
                                                                        src={venomLogo}
                                                                        height={100}
                                                                        width={100}
                                                                        style={{
                                                                            height: "14px",
                                                                            width: "15px",
                                                                            marginLeft: "6px",
                                                                            marginRight: "3px",
                                                                            marginTop: "3px",
                                                                        }}
                                                                        alt="VenomLogo"
                                                                    />
                                                                    {notification?.price}
                                                                    <p className="ml-1">about {moment(new Date(notification?.createdAt)).fromNow()}</p>
                                                                </span>
                                                            </div>

                                                            <div className="flex justify-center lg:ml-auto mt-1">
                                                                <a href={`${blockURL}${notification?.hash}`} target="_blank" className="flex justify-center ml-3 align-middle rounded-full font-bold border border-jacarta-100 p-3 dark:border-jacarta-600 dark:hover:bg-jacarta-600 hover:bg-jacarta-100">
                                                                    <svg width="24" height="24" className="fill-jacarta-700 dark:fill-jacarta-100 -rotate-45" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z" /></svg>
                                                                </a>
                                                                <button onClick={() => {
                                                                    if (window.confirm("Are you sure you want to delete this notification?")) {
                                                                        setSkip(0);
                                                                        deleteSeletedNotification();
                                                                    }
                                                                }} className="flex justify-center ml-3 align-middle rounded-full font-bold border border-jacarta-100 p-3 dark:border-jacarta-600 dark:hover:bg-jacarta-600 hover:bg-jacarta-100">
                                                                    {btn_loading ?
                                                                        <svg
                                                                            aria-hidden="true"
                                                                            className="inline w-6 h-6 ml-3 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                                                            viewBox="0 0 100 101"
                                                                            fill="none"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                        >
                                                                            <path
                                                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                                                fill="currentColor"
                                                                            />
                                                                            <path
                                                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                                                fill="currentFill"
                                                                            />
                                                                        </svg>
                                                                        :
                                                                        <AiOutlineDelete className="fill-jacarta-700 dark:fill-jacarta-100 text-[25px]" />
                                                                    }
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </InfiniteScroll>
                                            {notificationData == "" && !loading &&
                                                <h3 className="mb-1 text-[26px] text-center font-semibold text-jacarta-700 dark:text-white">
                                                    No Notifications Yet!
                                                </h3>
                                            }
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="rounded-t-2lg rounded-b-2lg rounded-tl-none border border-jacarta-100 bg-white p-6 dark:border-jacarta-600 dark:bg-jacarta-900 md:p-10">
                                            <div className="mb-10 shrink-0 basis-8/12 space-y-5 lg:mb-0 lg:pr-10">
                                                <h3 className="mb-1 text-[26px] text-center font-semibold text-jacarta-700 dark:text-white">
                                                    No Updates Yet!
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section >
        </div >
    )
}

export default Notifications