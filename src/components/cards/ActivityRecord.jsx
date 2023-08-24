import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ActivityRecord = ({ NFTImage, NFTName, NFTAddress, Price, ActivityTime, ActivityType, blockURL, ActivityHash, From = "12", To = "12" }) => {
    return (
        <div style={{ margin: "12px", width: "90%" }}
            className="relative flex flex-wrap justify-center align-middle items-center rounded-2.5xl border border-jacarta-100 bg-white p-8 transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700">
            {/* nft image url  */}
            <Link href={`/nft/${NFTAddress}`}>
                <div className="mr-5 mb-4 self-start">
                    <Image src={NFTImage} alt="nftImage" height={100} width={100} className="rounded-2lg" loading="lazy" />
                </div>
            </Link>

            <div className='mb-4'>
                {/* nft name  */}
                <Link href={`/nft/${NFTAddress}`}>
                    <h3 className="mb-1 font-display text-base font-semibold text-jacarta-700 dark:text-white">
                        {NFTName}
                    </h3>
                </Link>

                {/* value  */}
                <span className="mb-3 block text-sm text-jacarta-500">sold for {Price} VENOM</span>

                {/* from and to  */}
                <span className="block text-xs text-jacarta-300">Transfer from  <a href={`${blockURL}accounts/${From}`} target='_blank' className='text-blue'>{From.slice(0, 5) + "..." + From.slice(63)}</a> to <a href={`${blockURL}accounts/${To}`} target='_blank' className='text-blue'>{To.slice(0, 5) + "..." + To.slice(63)}</a></span>

                {/* time  */}
                <span className="block text-xs text-jacarta-200 mt-2 font-medium">{ActivityTime}</span>
            </div>

            {/* activity type  */}
            {ActivityType == "list" &&
                <div className="ml-auto rounded-full border border-jacarta-100 p-3 dark:border-jacarta-600 flex align-middle justify-around">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="fill-jacarta-700 dark:fill-white"
                    >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                    </svg>
                    <span className="block text-[17px] text-jacarta-400 font-medium pl-1 pb-1">Listing</span>
                </div>
            }
            {ActivityType == "cancel" &&
                <div className="ml-auto rounded-full border border-jacarta-100 p-3 dark:border-jacarta-600 flex align-middle justify-around">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="fill-jacarta-700 dark:fill-white"
                    >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                    </svg>
                    <span className="block text-[17px] text-jacarta-400 font-medium pl-1 pb-1">Cancel Listing</span>
                </div>
            }
            {ActivityType == "sale" &&
                <div className="ml-auto rounded-full border border-jacarta-100 p-3 dark:border-jacarta-600 flex align-middle justify-around">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="fill-jacarta-700 dark:fill-white"
                    >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path
                            d="M6.5 2h11a1 1 0 0 1 .8.4L21 6v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6l2.7-3.6a1 1 0 0 1 .8-.4zM19 8H5v12h14V8zm-.5-2L17 4H7L5.5 6h13zM9 10v2a3 3 0 0 0 6 0v-2h2v2a5 5 0 0 1-10 0v-2h2z"
                        />
                    </svg>
                    <span className="block text-[17px] text-jacarta-400 font-medium pl-1">Sale</span>
                </div>
            }
        </div>
    )
}

export default ActivityRecord