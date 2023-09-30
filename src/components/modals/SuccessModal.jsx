import React from 'react'
import venomLogo from "../../../public/venomBG.webp";
import Link from 'next/link';
import Image from 'next/image';
import { MdVerified } from 'react-icons/md';
import { BsExclamationCircleFill, BsFillShareFill } from 'react-icons/bs';
import { GoArrowUpRight } from 'react-icons/go';

const SuccessModal = ({ setSuccessModal, setAnyModalOpen, onCloseFunctionCall, NFTImage, NFTName, NFTCollectionName, NFTAddress, NFTCollectionContract, CollectionVerification, NFTListingPrice, TransactionType = "List" }) => {
    return (
        <div className="afterMintDiv">
            <form className="modal-dialog max-w-2xl">
                <div className="modal-content shadow-2xl dark:bg-jacarta-800">
                    <div className="modal-header">
                        {TransactionType == "Sale" &&
                            <h5 className="modal-title" id="placeBidLabel">
                                Congratulations🎉🎉
                            </h5>
                        }
                        {TransactionType == "List" &&
                            <h5 className="modal-title" id="placeBidLabel">
                                Listed Successfully🎉
                            </h5>
                        }
                        {TransactionType == "Cancel" &&
                            <h5 className="modal-title" id="placeBidLabel">
                                Removed Listing Successfully 😓
                            </h5>
                        }
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => (
                                ((onCloseFunctionCall && TransactionType != "List") && onCloseFunctionCall()), setSuccessModal(false), setAnyModalOpen(false)
                            )}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                className="h-6 w-6 fill-jacarta-700 dark:fill-white"
                            >
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                            </svg>
                        </button>
                    </div>

                    {/* fees and display section  */}
                    <div className="modal-body p-6">
                        <div className="mb-2 flex items-center justify-between">
                            {TransactionType == "Sale" &&
                                <span className="font-display text-jacarta-700 text-sm font-semibold dark:text-white">
                                    You have successfully bought
                                </span>
                            }
                            {TransactionType == "List" &&
                                <span className="font-display text-jacarta-700 text-sm font-semibold dark:text-white">
                                    You have successfully listed
                                </span>
                            }
                            {TransactionType == "Cancel" &&
                                <span className="font-display text-jacarta-700 text-sm font-semibold dark:text-white">
                                    You have successfully removed
                                </span>
                            }
                        </div>
                        <div className="dark:border-jacarta-600 border-jacarta-100 relative flex items-center py-4">
                            <Link href={`/nft/${NFTAddress}`}>
                                <div className="mr-5 self-start">
                                    <Image
                                        src={NFTImage?.replace(
                                            "ipfs://",
                                            "https://ipfs.io/ipfs/"
                                        )}
                                        alt="nftPreview"
                                        width="70"
                                        height="70"
                                        className="rounded-2lg"
                                    />
                                </div>
                            </Link>
                            <div>
                                <Link
                                    href={`/collection/${NFTCollectionContract}`}
                                    className="flex text-accent text-sm mb-2"
                                >
                                    {(NFTCollectionName ? NFTCollectionName : NFTCollectionContract?.slice(0, 8) +
                                        "..." +
                                        NFTCollectionContract?.slice(60))}

                                    {CollectionVerification ?
                                        <MdVerified style={{ color: "#4f87ff", marginLeft: "3px", marginTop: "2px" }}
                                            size={16} />
                                        :
                                        <BsExclamationCircleFill style={{ color: "#c3c944", marginLeft: "3px", marginTop: "2px" }}
                                            size={16} />
                                    }
                                </Link>
                                <Link href={`/nft/${NFTAddress}`}>
                                    <h3 className="font-display text-jacarta-700 mb-1 text-base font-semibold dark:text-white">
                                        {NFTName}
                                    </h3>
                                </Link>
                                {(TransactionType == "Sale" || TransactionType == "List") &&
                                    <div className="feesSectionTarget ml-auto">
                                        <span className="mb-1 flex items-center whitespace-nowrap">
                                            <span className="dark:text-jacarta-100 text-lg font-medium tracking-tight mr-2">
                                                For
                                            </span>
                                            <span>
                                                <Image
                                                    src={venomLogo}
                                                    height={100}
                                                    width={100}
                                                    alt="venomLogo"
                                                    className="h-5 w-5 mr-2"
                                                />
                                            </span>
                                            <span className="dark:text-jacarta-100 text-lg font-medium tracking-tight">
                                                {NFTListingPrice ? NFTListingPrice : "0.00"}
                                            </span>
                                        </span>
                                    </div>}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ flexWrap: "nowrap" }}>
                        <div className="flex items-center justify-center space-x-4 m-2">
                            <button
                                onClick={() => (
                                    ((onCloseFunctionCall && TransactionType != "List") && onCloseFunctionCall()), setSuccessModal(false), setAnyModalOpen(false)
                                )}
                                className="flex justify-center rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                            >
                                Close
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                    className="ml-[5px] mt-[2px] text-[20px] fill-jacarta-700 dark:fill-white"
                                >
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                                </svg>
                            </button>
                        </div>
                        {(TransactionType == "Sale") ?
                            <div className="flex items-center justify-center space-x-4 m-2">
                                <a
                                    href={`https://twitter.com/intent/tweet?text=Hey%20everyone%2C%20just%20purchased%20the%20${NFTName}%20NFT%20for%20${NFTListingPrice} VENOM%2C%20very%20happy%20to%20be%20a%20part%20of%20the%20${NFTCollectionName}%20fam%20%F0%9F%A5%B3%20Great%20experience%20buying%20NFTs%20on%20venomart%20%F0%9F%99%8C%20%23venomart%20%23NFTs%20%23VenomBlockchain`}
                                    target="_blank"
                                    className="flex justify-center rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                >
                                    Share
                                    <BsFillShareFill className="ml-[8px] mt-[6px] text-[14px]" />
                                </a>
                            </div>
                            :
                            <div className="flex items-center justify-center space-x-4 m-2">
                                <Link
                                    href={`/nft/${NFTAddress}`}
                                    className="flex justify-center rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                >
                                    View
                                    <GoArrowUpRight className="ml-[5px] mt-[2px] text-[20px]" />
                                </Link>
                            </div>
                        }
                    </div>
                </div>
            </form >
        </div >
    )
}

export default SuccessModal