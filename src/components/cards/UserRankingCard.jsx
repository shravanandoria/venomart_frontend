import Image from "next/image";
import Link from "next/link";
import React from "react";
import venomLogo from "../../../public/venomBG.webp";

const UserRankingCard = ({
    id,
    Logo,
    Name,
    walletAddress,
    totalPurchaseVolume,
    totalSalesVolume,
    totalSales,
    activeListings,
    AveragePrice
}) => {

    return (
        <Link
            href={`/profile/${walletAddress}`}
            className="flex transition-shadow hover:shadow-lg"
            role="row"
        >
            <div className="flex w-[25%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                <span className="mr-2 lg:mr-4">{id}</span>
                <div className="relative mr-2 w-8 shrink-0 self-start lg:mr-5 lg:w-12">
                    <Image
                        src={
                            Logo
                                ? Logo.replace("ipfs://", "https://ipfs.io/ipfs/")
                                : venomLogo
                        }
                        height={100}
                        width={100}
                        alt="collectionlogo"
                        className="rounded-2lg"

                    />
                </div>
                <span className="font-display text-sm font-semibold text-jacarta-700 dark:text-white">
                    {Name ? Name : (walletAddress.slice(0, 5) + "..." + walletAddress.slice(62))}
                </span>
            </div>

            {/* totalSalesVolume */}
            <div className="flex w-[16%] items-center whitespace-nowrap border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                <span className="text-sm font-medium dark:text-jacarta-200 text-jacarta-700 flex">
                    <Image
                        src={venomLogo}
                        height={100}
                        width={100}
                        style={{
                            height: "13px",
                            width: "13px",
                            marginRight: "6px",
                            marginTop: "4px",
                        }}
                        alt="VenomLogo"
                    />
                    {totalSalesVolume ? totalSalesVolume.toFixed(2) : "0"}
                </span>
            </div>

            {/* totalPurchaseVolume  */}
            <div className="flex w-[15%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                <span className="text-sm font-medium dark:text-jacarta-200 text-jacarta-700 flex">
                    <Image
                        src={venomLogo}
                        height={100}
                        width={100}
                        style={{
                            height: "13px",
                            width: "13px",
                            marginRight: "6px",
                            marginTop: "4px",
                        }}
                        alt="VenomLogo"
                    />
                    {totalPurchaseVolume ? totalPurchaseVolume.toFixed(2) : "0"}
                </span>
            </div>

            {/* Avg Sale  */}
            <div className="flex w-[17%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                <span className="text-sm dark:text-jacarta-200 text-jacarta-700 flex">
                    <Image
                        src={venomLogo}
                        height={100}
                        width={100}
                        style={{
                            height: "13px",
                            width: "13px",
                            marginRight: "6px",
                            marginTop: "4px",
                        }}
                        alt="VenomLogo"
                    />
                    {AveragePrice ? AveragePrice.toFixed(2) : "0"}
                </span>
            </div>

            {/*total sales  */}
            <div className="flex w-[15%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                <span className="dark:text-jacarta-200 text-jacarta-700">
                    {totalSales ? Math.abs(totalSales) : "0"}
                </span>
            </div>

            {/* active listings  */}
            <div className="flex w-[14%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                <span className="dark:text-jacarta-200 text-jacarta-700">
                    {activeListings ? Math.abs(activeListings) : "0"}
                </span>
            </div>
        </Link>
    );
};

export default UserRankingCard;
