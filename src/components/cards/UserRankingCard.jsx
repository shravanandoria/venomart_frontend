import Image from "next/image";
import Link from "next/link";
import React from "react";
import venomLogo from "../../../public/venomBG.webp";
import defLogo from "../../../public/deflogo.png";
import numeral from 'numeral';

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

    function formatNumberShort(number) {
        if (number >= 1e6) {
            return numeral(number / 1e6).format('0.00a') + 'M';
        } else if (number >= 1e3) {
            return numeral(number / 1e3).format('0.00a') + 'K';
        } else if (number % 1 !== 0) {
            return numeral(number).format('0.00');
        } else {
            return numeral(number).format('0');
        }
    }

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
                                : defLogo
                        }
                        height={100}
                        width={100}
                        alt="collectionlogo"
                        className="rounded-2lg h-[50px] w-[50px] object-cover"

                    />
                </div>
                <span className="font-display text-sm font-semibold text-jacarta-700 dark:text-white">
                    {Name ? Name : (walletAddress.slice(0, 5) + "..." + walletAddress.slice(62))}
                </span>
            </div>

            {/* totalSalesVolume */}
            <div className="flex w-[16%] items-center whitespace-nowrap border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                <span className="text-sm font-medium dark:text-jacarta-200 text-jacarta-700 flex uppercase">
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
                    {totalSalesVolume ? formatNumberShort(totalSalesVolume) : "0"}
                </span>
            </div>

            {/* totalPurchaseVolume  */}
            <div className="flex w-[15%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                <span className="text-sm font-medium dark:text-jacarta-200 text-jacarta-700 flex uppercase">
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
                    {totalPurchaseVolume ? formatNumberShort(totalPurchaseVolume) : "0"}
                </span>
            </div>

            {/* Avg Sale  */}
            <div className="flex w-[17%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                <span className="text-sm dark:text-jacarta-200 text-jacarta-700 flex uppercase">
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
                    {AveragePrice ? formatNumberShort(AveragePrice) : "0"}
                </span>
            </div>

            {/*total sales  */}
            <div className="flex w-[15%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                <span className="dark:text-jacarta-200 text-jacarta-700 uppercase">
                    {totalSales ? Math.abs(formatNumberShort(totalSales)) : "0"}
                </span>
            </div>

            {/* active listings  */}
            <div className="flex w-[14%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
                <span className="dark:text-jacarta-200 text-jacarta-700 uppercase">
                    {activeListings ? Math.abs(formatNumberShort(activeListings)) : "0"}
                </span>
            </div>
        </Link>
    );
};

export default UserRankingCard;
