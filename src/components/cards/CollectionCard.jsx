import Link from "next/link";
import React from "react";
import Image from "next/image";
import { MdVerified } from "react-icons/md";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import venomLogo from "../../../public/venom.svg"

const CollectionCard = ({
    Cover,
    Logo,
    Name,
    OwnerAddress,
    CollectionAddress
}) => {
    return (
        <div className="relative rounded-2.5xl border border-jacarta-100 bg-white p-[1.1875rem] transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700 h-[400px] w-[300px] overflow-hidden m-4 sm:m-8">
            <Link
                href={`/collection/${CollectionAddress}`}
                className="relative flex space-x-[0.625rem]"
            >
                <span className="w-[100%] h-[150px]">
                    <Image
                        // src={Cover?.replace("ipfs://", "https://ipfs.io/ipfs/")}
                        src={Cover}
                        alt="Cover Image"
                        className="h-full w-[100%] rounded-[0.625rem] object-cover"
                        loading="lazy"
                        height={100}
                        width={100}
                    />
                </span>
                <span className="absolute bottom-[-25px] right-24">
                    <Image
                        // src={Logo?.replace("ipfs://", "https://ipfs.io/ipfs/")}
                        src={Logo}
                        alt="Logo"
                        className="h-[75px] w-[75px] rounded-[100%] border b-4 border-black shadow-lg"
                        loading="lazy"
                        height={100}
                        width={100}
                    />
                </span>
            </Link>

            <div className="flex justify-center align-middle text-center">
                <Link
                    href={`/collection/${CollectionAddress}`}
                    className=" mt-8 font-display text-[22px] text-center text-jacarta-700 hover:text-accent dark:text-white "
                    style={{
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden"
                    }}
                >
                    {Name}
                </Link>
                <MdVerified
                    style={{ color: "#4f87ff", marginLeft: "4px", marginTop: "34px" }}
                    size={25}
                />
            </div>
            <div className="flex">
                <span className="w-[100%] font-display text-[13px] text-center text-jacarta-700 hover:text-accent dark:text-jacarta-200">
                    1000+ Items
                </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm font-medium tracking-tight">
                <div className="flex flex-wrap items-center">
                    <span className="textDotStyle mr-1 mt-1 dark:text-jacarta-400">Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente corrupti error qui ab consequatur, optio praesentium repellat quibusdam alias, amet nostrum. Ut, nostrum! Ut, saepe! Error aspernatur corporis molestias necessitatibus vel ipsam eum itaque, repellat obcaecati? Dolorum, ipsum, commodi enim tempore, repudiandae beatae nemo ipsam nulla officiis voluptate nostrum aut?</span>
                </div>
            </div>
            <div className="flex justify-between align-middle my-6">
                <button className=" dark:text-jacarta-200 font-bold py-2 px-4 rounded-full text-jacarta-700">
                    <span className="text-jacarta-400">Owners</span> 50+
                </button>
                <button className=" dark:text-jacarta-200 font-bold py-2 px-4 rounded-full text-jacarta-700">
                    <span className="text-jacarta-400">Floor</span>
                    <span className="flex justify-center">
                        0
                        <Image
                            src={venomLogo}
                            height={100}
                            width={100}
                            style={{
                                height: "12px",
                                width: "12px",
                                marginLeft: "8px",
                                marginTop: "6px"
                            }}
                        />
                    </span>
                </button>
                <button className=" dark:text-jacarta-200 font-bold py-2 px-4 rounded-full text-jacarta-700">
                    <span className="text-jacarta-400">Volume</span>
                    <span className="flex justify-center">
                        0
                        <Image
                            src={venomLogo}
                            height={100}
                            width={100}
                            style={{
                                height: "12px",
                                width: "12px",
                                marginLeft: "8px",
                                marginTop: "6px"
                            }}
                        />
                    </span>
                </button>
            </div>
        </div >
    );
};

export default CollectionCard;
