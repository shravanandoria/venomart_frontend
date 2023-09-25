import moment from 'moment';
import Link from 'next/link';
import React from 'react'

const NFTActivityCard = ({ type, price, from, to, MARKETPLACE_ADDRESS, hash, blockURL, createdAt, signerAddress }) => {
    const dateTimeAgo = moment(new Date(createdAt)).fromNow();

    return (
        <div className="flex">
            {/* event  */}
            <div className="flex w-[17%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                {type == "mint" &&
                    <div className="flex items-center text-jacarta-700 dark:text-white">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="mr-2 h-4 w-4 group-hover:fill-white fill-jacarta-700 dark:fill-white"
                        >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                        </svg>
                        Mint
                    </div>
                }
                {type == "list" &&
                    <div className="flex items-center text-jacarta-700 dark:text-white">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="mr-2 h-4 w-4 group-hover:fill-white fill-jacarta-700 dark:fill-white"
                        >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                        </svg>
                        Listing
                    </div>
                }
                {type == "cancel" &&
                    <div className="flex items-center text-jacarta-700 dark:text-white">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="mr-2 h-4 w-4 group-hover:fill-white fill-jacarta-700 dark:fill-white"
                        >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                        </svg>
                        Cancel Listing
                    </div>
                }
                {type == "sale" &&
                    <div className="flex items-center text-jacarta-700 dark:text-white">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="mr-2 h-4 w-4 group-hover:fill-white fill-jacarta-700 dark:fill-white"
                        >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M6.5 2h11a1 1 0 0 1 .8.4L21 6v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6l2.7-3.6a1 1 0 0 1 .8-.4zM19 8H5v12h14V8zm-.5-2L17 4H7L5.5 6h13zM9 10v2a3 3 0 0 0 6 0v-2h2v2a5 5 0 0 1-10 0v-2h2z" />
                        </svg>
                        Sale
                    </div>
                }
            </div>

            {/* price  */}
            <div
                className="flex w-[17%] items-center whitespace-nowrap border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                {type == "list" &&
                    <span className="text-sm font-medium tracking-tight text-green">{price} VENOM</span>
                }
                {type == "cancel" &&
                    <span className="text-sm font-medium tracking-tight text-green">---</span>
                }
                {type == "sale" &&
                    <span className="text-sm font-medium tracking-tight text-green">{price} VENOM</span>
                }
            </div>

            {/* from  */}
            <div className="flex w-[22%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                {MARKETPLACE_ADDRESS === from &&
                    <Link href="#" className="text-accent">Market</Link>
                }
                {signerAddress === from &&
                    <Link href="#" className="text-accent">You</Link>
                }
                {signerAddress != from && MARKETPLACE_ADDRESS != from &&
                    <Link href={`/profile/${from}`} className="text-accent">{from.slice(0, 5) + "..." + from.slice(62)}</Link>
                }
            </div>

            {/* to  */}
            <div className="flex w-[22%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                {MARKETPLACE_ADDRESS === to &&
                    <Link href="#" className="text-accent">Market</Link>
                }
                {signerAddress === to &&
                    <Link href="#" className="text-accent">You</Link>
                }
                {signerAddress != to && MARKETPLACE_ADDRESS != to &&
                    <Link href={`/profile/${to}`} className="text-accent">{to.slice(0, 5) + "..." + to.slice(62)}</Link>
                }
            </div>

            {/* exploerer  */}
            <div className="flex w-[22%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                role="cell">
                <a href={`${blockURL}transactions/${hash}`} className="flex flex-wrap items-center text-accent" target="_blank"
                    rel="nofollow noopener" title="Opens in a new window"
                    data-tippy-content="March 13 2022, 2:32 pm">
                    <span className="mr-1">about {dateTimeAgo}</span>
                    {/* redirect svg  */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                        className="h-4 w-4 fill-current">
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path
                            d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z" />
                    </svg>
                </a>
            </div>
        </div>
    )
}

export default NFTActivityCard