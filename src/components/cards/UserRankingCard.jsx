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
    activeListings
}) => {

    return (
        <Link
            href={`/profile/${walletAddress}`}
            className="flex transition-shadow hover:shadow-lg"
            role="row"
        >
            <div
                className="flex w-[26%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                role="cell"
            >
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
            <div
                className="flex w-[16%] items-center whitespace-nowrap border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                role="cell"
            >
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
            <div className="flex w-[16%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
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

            {/*total sales  */}
            <div
                className="flex w-[14%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                role="cell"
            >
                <span className="dark:text-jacarta-200 text-jacarta-700">
                    {totalSales ? Math.abs(totalSales) : "0"}
                </span>
            </div>

            {/* active listings  */}
            <div
                className="flex w-[14%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                role="cell"
            >
                <span className="dark:text-jacarta-200 text-jacarta-700">
                    {activeListings ? Math.abs(activeListings) : "0"}
                </span>
            </div>

            {/* status  */}
            <div
                className="flex w-[14%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                role="cell"
            >
                <span className="dark:text-jacarta-200 text-jacarta-700">
                    <div className="flex justify-center align-middle">
                        Active
                    </div>
                </span>
            </div>
        </Link>
    );
};

export default UserRankingCard;
