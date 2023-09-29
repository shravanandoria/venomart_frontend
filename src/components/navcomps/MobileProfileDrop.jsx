import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const MobileProfileDrop = ({ signer_address, venomLogo, vnmBalance, MintNFTStatus, MintCollectionStatus, onDisconnect, setMobieProfileDrop }) => {
    return (
        <div className="!-right-4 !top-[85%] !left-auto z-10 min-w-[14rem] whitespace-nowrap rounded-xl bg-white transition-all will-change-transform before:absolute before:-top-3 before:h-3 before:w-full group-dropdown-hover:opacity-100 dark:bg-jacarta-800 lg:absolute lg:grid lg:!translate-y-4 lg:py-4 lg:px-2 lg:shadow-2xl py-6">
            <button className="js-copy-clipboard my-4 flex select-none items-center whitespace-nowrap px-5 font-display leading-none text-jacarta-700 dark:text-white">
                <span className="max-w-[10rem] overflow-hidden text-ellipsis">
                    {signer_address}
                </span>
                <svg
                    onClick={() => (
                        navigator.clipboard.writeText(
                            `${signer_address}`
                        ),
                        alert("copied wallet address to clipboard")
                    )}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="ml-1 mb-px h-4 w-4 fill-jacarta-500 dark:fill-jacarta-300"
                >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M7 7V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4v3.993c0 .556-.449 1.007-1.007 1.007H3.007A1.006 1.006 0 0 1 2 20.993l.003-12.986C2.003 7.451 2.452 7 3.01 7H7zm2 0h6.993C16.549 7 17 7.449 17 8.007V15h3V4H9v3zM4.003 9L4 20h11V9H4.003z" />
                </svg>
            </button>

            <div className="mx-5 mb-6 rounded-lg border border-jacarta-100 p-4 dark:border-jacarta-600">
                <span className="text-sm font-medium tracking-tight dark:text-jacarta-200">
                    Balance
                </span>
                <div className="flex items-center">
                    <span className="flex justify-center align-middle text-lg font-bold text-green">
                        <Image
                            src={venomLogo}
                            height={100}
                            width={100}
                            style={{
                                height: "17px",
                                width: "17px",
                                marginRight: "7px",
                                marginTop: "6px"
                            }}
                            alt="VenomLogo"
                        />
                        {vnmBalance}
                    </span>
                </div>
            </div>
            <Link
                href={`/profile/${signer_address}`}
                className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white"
                >
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path d="M11 14.062V20h2v-5.938c3.946.492 7 3.858 7 7.938H4a8.001 8.001 0 0 1 7-7.938zM12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z"></path>
                </svg>
                <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                    My Profile
                </span>
            </Link>
            <Link
                href="/profile/EditProfile"
                className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white"
                >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M9.954 2.21a9.99 9.99 0 0 1 4.091-.002A3.993 3.993 0 0 0 16 5.07a3.993 3.993 0 0 0 3.457.261A9.99 9.99 0 0 1 21.5 8.876 3.993 3.993 0 0 0 20 12c0 1.264.586 2.391 1.502 3.124a10.043 10.043 0 0 1-2.046 3.543 3.993 3.993 0 0 0-3.456.261 3.993 3.993 0 0 0-1.954 2.86 9.99 9.99 0 0 1-4.091.004A3.993 3.993 0 0 0 8 18.927a3.993 3.993 0 0 0-3.457-.26A9.99 9.99 0 0 1 2.5 15.121 3.993 3.993 0 0 0 4 11.999a3.993 3.993 0 0 0-1.502-3.124 10.043 10.043 0 0 1 2.046-3.543A3.993 3.993 0 0 0 8 5.071a3.993 3.993 0 0 0 1.954-2.86zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                </svg>
                <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                    Edit Profile
                </span>
            </Link>
            <Link
                href="/profile/Notifications"
                className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
            >
                <svg
                    className="h-5 w-5 fill-jacarta-700 transition-colors dark:fill-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9" />
                </svg>
                <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                    Notifications
                </span>
            </Link>
            {MintNFTStatus &&
                <Link
                    href="/mint/CreateNFT"
                    className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white rotate-180"
                    >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 11V8l-5 4 5 4v-3h8v-2H7z" />
                    </svg>
                    <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                        Create NFT
                    </span>
                </Link>
            }
            {MintCollectionStatus &&
                <Link
                    href="/mint/CreateNFTCollection"
                    className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white rotate-180"
                    >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 11V8l-5 4 5 4v-3h8v-2H7z" />
                    </svg>
                    <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                        Create Collection
                    </span>
                </Link>
            }
            <a
                onClick={() => (onDisconnect(), setMobieProfileDrop(false))}
                className="cursor-pointer flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white"
                >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 11V8l-5 4 5 4v-3h8v-2H7z" />
                </svg>
                <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                    Sign out
                </span>
            </a>
        </div>
    )
}

export default MobileProfileDrop