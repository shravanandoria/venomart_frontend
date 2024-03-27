import Image from "next/image";
import Link from "next/link";
import React from "react";
import { MdVerified } from "react-icons/md";
import venomLogo from "../../../public/venomBG.webp";
import defLogo from "../../../public/deflogo.png";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import numeral from 'numeral';

const SmallUserCard = ({
    theme,
    Logo,
    id,
    Name,
    wallet_address,
    totalPurchaseVolume,
    totalBuys,
    OtherImagesBaseURI
}) => {

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
        <Link href={`/profile/${wallet_address}`}>
            <div
                className={`flex rounded-2.5xl border ${theme == "dark" ? "border-jacarta:900" : "border-jacarta-100"
                    } bg-white py-4 px-7 transition-shadow hover:shadow-lg dark:bg-jacarta-800 h-[100px] w-[300px] m-2 sm:m-4 overflow-hidden`}
            >
                <div className="mr-4 shrink-0">
                    <div className="relative block">
                        <Image
                            src={
                                Logo
                                    ? Logo.replace("ipfs://", OtherImagesBaseURI)
                                    : defLogo
                            }
                            alt="avatar 1"
                            className="rounded-2lg h-[65px] w-[65px]"
                            height={100}
                            width={100}

                        />
                        <div className="absolute -left-3 top-[10px] flex h-6 w-6 -translate-y-2/4 items-center justify-center rounded-full border-2 border-white bg-jacarta-700 text-xs text-white dark:border-jacarta-600">
                            {id}
                        </div>
                    </div>
                </div>
                <div>
                    <div className="block relative">
                        <span
                            className="font-display font-semibold text-jacarta-700 dark:text-white"
                            style={{
                                width: "160px",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                display: "block"
                            }}
                        >
                            {Name ? Name : wallet_address}
                        </span>
                    </div>
                    <span className="text-sm dark:text-jacarta-300 flex">
                        NFTs Bought :{" "}
                        {totalBuys ? formatNumberShort(totalBuys) : "0"}
                    </span>
                    <span className="text-sm mt-[5px] dark:text-jacarta-300 flex">
                        Volume :{" "}
                        <Image
                            src={venomLogo}
                            height={100}
                            width={100}
                            style={{
                                height: "12px",
                                width: "12px",
                                marginRight: "3px",
                                marginLeft: "3px",
                                marginTop: "3px",
                            }}
                            alt="VenomLogo"
                        />
                        {totalPurchaseVolume ? formatNumberShort(totalPurchaseVolume) : "0"}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default SmallUserCard;
