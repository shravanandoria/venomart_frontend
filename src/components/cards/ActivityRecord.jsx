import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import moment from 'moment';
import numeral from 'numeral';

const ActivityRecord = ({ NFTImage, NFTName, NFTAddress, Price, ActivityTime, ActivityType, userPurchases, blockURL, ActivityHash, From = "market", FromUser, To = "market", ToUser, signerAddress }) => {

    const dateTimeAgo = moment(new Date(ActivityTime)).fromNow();

    function formatNumberShort(number) {
        if (number >= 1e6) {
            const formatted = numeral(number / 1e6).format('0.00a');
            if (formatted.endsWith('k')) {
                return (formatted.slice(0, -1) + "M");
            }
            else {
                return (formatted + "M");
            }
        } else if (number >= 1e3) {
            return numeral(number / 1e3).format('0.00a') + 'K';
        } else if (number % 1 !== 0) {
            return numeral(number).format('0.00');
        } else {
            return numeral(number).format('0');
        }
    }

    return (
        <div style={{ margin: "12px" }} className="activityCardDiv relative flex flex-wrap justify-between align-middle items-center rounded-2.5xl border border-jacarta-100 bg-white px-6 py-6 transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700">
            <div className='flex justify-center align-middle'>
                <Link href={`/nft/${NFTAddress}`}>
                    <div className="mr-5 mb-4 self-start">
                        <Image src={NFTImage.replace("ipfs://", "https://ipfs.io/ipfs/")} alt="nftImage" height={100} width={100} className="ActivityCardImg rounded-2lg h-[100px] w-[100px]" />
                    </div>
                </Link>

                <div className='flex flex-col justify-center align-middle mb-4'>
                    {/* nft name  */}
                    <Link href={`/nft/${NFTAddress}`}>
                        <h3 className="activityCardTitle mb-1 font-display text-[18px] font-semibold text-jacarta-700 dark:text-jacarta-100"
                            style={{
                                width: "200px",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                            }}
                        >
                            {NFTName}
                        </h3>
                    </Link>

                    {/* value  */}
                    <div className='activityCardSubTitle flex'>
                        {ActivityType == "mint" &&
                            <span className="block text-sm text-jacarta-100 mb-3 font-medium dark:text-jacarta-100">Minted a brand new NFT about {dateTimeAgo}</span>
                        }
                        {ActivityType == "list" &&
                            <span className="block text-sm text-jacarta-100 mb-3 font-medium dark:text-jacarta-100">listed for {formatNumberShort(Price)} VENOM about {dateTimeAgo}</span>
                        }
                        {ActivityType == "cancel" &&
                            <span className="block text-sm text-jacarta-100 mb-3 font-medium dark:text-jacarta-100">removed from listing about {dateTimeAgo}</span>
                        }
                        {ActivityType == "sale" &&
                            (<span className="block text-sm text-jacarta-100 mb-3 font-medium dark:text-jacarta-100">
                                {userPurchases ? "purchased " : "sold "}
                                for {formatNumberShort(Price)} VENOM about {dateTimeAgo}
                            </span>)
                        }
                    </div>

                    {/* from and to  */}
                    <span className="block text-xs text-jacarta-300">
                        Transfer from {" "}
                        <Link href={`/profile/${From}`} className='text-blue'>
                            {ActivityType == "cancel" ? "Market" : (From == signerAddress ? "You" : (FromUser ? FromUser : From.slice(0, 5) + "..." + From.slice(63)))}
                        </Link>
                        {" "}to{" "}
                        <Link href={`/profile/${To}`} className='text-blue'>
                            {ActivityType == "list" ? "Market" : (To == signerAddress ? "You" : (ToUser ? ToUser : To.slice(0, 5) + "..." + To.slice(63)))}
                        </Link>
                    </span>
                </div>
            </div>

            <Link href={`${blockURL}transactions/${ActivityHash}`} target='_blank' className="activityCardLink rounded-full border border-jacarta-100 py-2 px-8 dark:border-jacarta-600 flex align-middle justify-around">
                {ActivityType == "list" &&
                    <div className='flex flex-row' style={{ justifyContent: 'center', alignItems: "center" }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="17"
                            height="17"
                            className="fill-jacarta-700 dark:fill-white"
                        >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                        </svg>
                        <span className="block text-[17px]  text-jacarta-100 dark:text-jacarta-200 font-medium pl-1 pb-1">Listing</span>
                    </div>
                }
                {ActivityType == "cancel" &&
                    <div className='flex flex-row' style={{ justifyContent: 'center', alignItems: "center" }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="17"
                            height="17"
                            className="fill-jacarta-700 dark:fill-white"
                        >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                        </svg>
                        <span className="block text-[17px]  text-jacarta-100 dark:text-jacarta-200 font-medium pl-1 pb-1">Remove Listing</span>
                    </div>
                }
                {ActivityType == "sale" &&
                    <div className='flex flex-row' style={{ justifyContent: 'center', alignItems: "center" }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            className="fill-jacarta-700 dark:fill-white"
                        >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path
                                d="M6.5 2h11a1 1 0 0 1 .8.4L21 6v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6l2.7-3.6a1 1 0 0 1 .8-.4zM19 8H5v12h14V8zm-.5-2L17 4H7L5.5 6h13zM9 10v2a3 3 0 0 0 6 0v-2h2v2a5 5 0 0 1-10 0v-2h2z"
                            />
                        </svg>
                        <span className="block text-[17px] text-jacarta-100 dark:text-jacarta-200 font-medium pl-1">Sale</span>
                    </div>
                }
            </Link>
        </div>
    )
}

export default ActivityRecord