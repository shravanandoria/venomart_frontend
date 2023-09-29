import { React, useState, useEffect } from "react";
import Image from "next/image";
import Head from "next/head";


const Notifications = ({ theme }) => {
    const [notificationData, setNotificationData] = useState();
    const [propShow, setPropShow] = useState(true);
    return (
        <div className={`${theme}`}>
            <Head>
                <title>Notifications - Venomart Marketplace</title>
                <meta
                    name="description"
                    content="All your activity notifications on venomart marketplace"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.png" />
            </Head>

            <section className="relative py-24 dark:bg-jacarta-900">
                <div className="container">
                    <h1 className="mt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">Notifications</h1>
                    <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                        Stay updated with all your important activities on venomart
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
                                            Unread Notifications
                                        </span>
                                    </button>
                                </li>

                                {/* <!-- Details --> */}
                                <li
                                    className="nav-item"
                                    role="presentation"
                                    onClick={() => setPropShow(false)}
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
                                            All Notification
                                        </span>
                                    </button>
                                </li>
                            </ul>

                            {/* <!-- Tab Contents --> */}
                            <div className="tab-content">
                                {propShow ? (
                                    <div>
                                        <div className="rounded-t-2lg rounded-b-2lg rounded-tl-none border border-jacarta-100 bg-white p-6 dark:border-jacarta-600 dark:bg-jacarta-700 md:p-10">
                                            <div className="mb-10 shrink-0 basis-8/12 space-y-5 lg:mb-0 lg:pr-10">
                                                {notificationData?.map((e) => {
                                                    return (
                                                        e.app === "RarX Marketplace" && (
                                                            <div key={e.sid}>
                                                                <a
                                                                    href={e.cta}
                                                                    className="relative flex items-center rounded-2.5xl border border-jacarta-100 bg-white p-8 transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700"
                                                                >
                                                                    <div className="mr-5 self-start">
                                                                        <Image src={e.icon} alt="avatar 2" className="rounded-2lg" loading="lazy" height={100} width={100} />
                                                                    </div>

                                                                    <div>
                                                                        <h3 className="mb-1 font-display text-base font-semibold text-jacarta-700 dark:text-white">
                                                                            {e.notification.title}
                                                                        </h3>
                                                                        <span className="mb-3 block text-sm text-jacarta-500 dark:text-jacarta-200">{e.notification.body}</span>
                                                                        <span className="block text-xs text-jacarta-300">Via : {e.app} {" "} | {" "} Chain : {e.blockchain} </span>
                                                                    </div>

                                                                    <div className="ml-auto rounded-full font-bold border border-jacarta-100 p-3 dark:border-jacarta-600">
                                                                        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z" /></svg>
                                                                    </div>
                                                                </a>
                                                            </div>
                                                        )
                                                    );
                                                })}
                                                <h3 className="mb-1 text-[26px] text-center font-semibold text-jacarta-700 dark:text-white">
                                                    No Notifications!
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="rounded-t-2lg rounded-b-2lg rounded-tl-none border border-jacarta-100 bg-white p-6 dark:border-jacarta-600 dark:bg-jacarta-700 md:p-10">
                                            <div className="mb-10 shrink-0 basis-8/12 space-y-5 lg:mb-0 lg:pr-10">
                                                {notificationData?.map((e) => {
                                                    return (
                                                        (
                                                            <div key={e.sid}>
                                                                <a
                                                                    href={e.cta}
                                                                    className="relative flex items-center rounded-2.5xl border border-jacarta-100 bg-white p-8 transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700"
                                                                >
                                                                    <div className="mr-5 self-start">
                                                                        <Image src={e.icon} alt="avatar 2" className="rounded-2lg" loading="lazy" height={100} width={100} />
                                                                    </div>

                                                                    <div>
                                                                        <h3 className="mb-1 font-display text-base font-semibold text-jacarta-700 dark:text-white">
                                                                            {e.notification.title}
                                                                        </h3>
                                                                        <span className="mb-3 block text-sm text-jacarta-500 dark:text-jacarta-200">{e.notification.body}</span>
                                                                        <span className="block text-xs text-jacarta-300">Via : {e.app}</span>
                                                                    </div>

                                                                    <div className="ml-auto rounded-full font-bold border border-jacarta-100 p-3 dark:border-jacarta-600">
                                                                        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z" /></svg>
                                                                    </div>
                                                                </a>
                                                            </div>
                                                        )
                                                    );
                                                })}
                                                <h3 className="mb-1 text-[26px] text-center font-semibold text-jacarta-700 dark:text-white">
                                                    No Notifications!
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Notifications