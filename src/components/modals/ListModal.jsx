import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { BsFillExclamationCircleFill } from 'react-icons/bs'
import { MdVerified } from 'react-icons/md'
import venomLogo from "../../../public/venomBG.webp";
import { platform_fees } from '../../utils/user_nft'

const ListModal = ({ formSubmit, setListSale, setAnyModalOpen, listing_fees, listingPrice, set_listing_price, creatorRoyalty, setCreatorRoyalty, platformFees, setPlatformFees, finalListingPrice, setFinalListingPrice, nft, collectionData, onchainNFTData, loading, currency, confirmChecked, setConfirmChecked }) => {
    return (
        <div className="afterMintDiv">
            <form onSubmit={formSubmit} className="modal-dialog max-w-2xl">
                <div className="modal-content shadow-2xl dark:bg-jacarta-800">
                    <div className="modal-header">
                        <h5 className="modal-title" id="placeBidLabel">
                            List For Sale
                        </h5>
                        {!loading && (
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={() => (
                                    setListSale(false), setAnyModalOpen(false)
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
                        )}
                    </div>

                    {/* listing price  */}
                    <div className="modal-body p-6">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="font-display text-sm font-semibold text-jacarta-700 dark:text-white">
                                Listing price
                            </span>
                        </div>

                        <div className="relative mb-2 flex items-center overflow-hidden rounded-lg border border-jacarta-100 dark:border-jacarta-600">
                            <div className="flex flex-1 items-center self-stretch border-r border-jacarta-100 bg-jacarta-50 px-2">
                                <span className="font-display text-sm text-jacarta-700">
                                    {currency}
                                </span>
                            </div>
                            {loading ? (
                                <input
                                    disabled
                                    required
                                    type="text"
                                    className="h-12 w-full flex-[3] border-0 focus:ring-inset focus:ring-accent"
                                    placeholder="Enter price"
                                />
                            ) : (
                                <input
                                    required
                                    type="text"
                                    onChange={(e) => (
                                        set_listing_price(e.target.value),
                                        setCreatorRoyalty(
                                            (parseFloat(
                                                nft?.NFTCollection?.royalty
                                                    ? nft?.NFTCollection?.royalty
                                                    : collectionData?.data?.royalty
                                                        ? collectionData?.data?.royalty
                                                        : 0
                                            ) *
                                                e.target.value) /
                                            100
                                        ),
                                        setPlatformFees(
                                            (platform_fees * e.target.value) / 100
                                        ),
                                        setFinalListingPrice(
                                            (
                                                parseFloat(e.target.value) +
                                                parseFloat(
                                                    (parseFloat(
                                                        nft?.NFTCollection?.royalty
                                                            ? nft?.NFTCollection?.royalty
                                                            : collectionData?.data?.royalty
                                                                ? collectionData?.data?.royalty
                                                                : 0
                                                    ) *
                                                        e.target.value) /
                                                    100
                                                ) +
                                                parseFloat(
                                                    (platform_fees * e.target.value) / 100
                                                )
                                            ).toFixed(2)
                                        )
                                    )}
                                    className="h-12 w-full flex-[3] border-0 focus:ring-inset focus:ring-accent"
                                    placeholder="Enter price"
                                />
                            )}
                        </div>
                    </div>

                    {/* fees and display section  */}
                    <div className="modal-body p-6">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="font-display text-jacarta-700 text-sm font-semibold dark:text-white">
                                You are listing Item
                            </span>
                            <span className="feesSectionTarget font-display text-jacarta-700 text-sm font-semibold dark:text-white">
                                Subtotal
                            </span>
                        </div>
                        <div className="dark:border-jacarta-600 border-jacarta-100 relative flex items-center border-b py-4">
                            <div className="mr-5 self-start">
                                <Image
                                    src={
                                        onchainNFTData
                                            ? nft?.preview?.source
                                            : nft?.nft_image?.replace(
                                                "ipfs://",
                                                "https://ipfs.io/ipfs/"
                                            )
                                    }
                                    alt="nftPreview"
                                    width="80"
                                    height="80"
                                    className="rounded-2lg"
                                />
                            </div>
                            <div>
                                <div className="text-accent text-sm">
                                    {!onchainNFTData ? (
                                        <div className="flex align-middle mb-2">
                                            {nft?.NFTCollection?.name
                                                ? nft?.NFTCollection?.name
                                                : nft?.NFTCollection?.contractAddress?.slice(
                                                    0,
                                                    8
                                                ) +
                                                "..." +
                                                nft?.NFTCollection?.contractAddress?.slice(
                                                    60
                                                )}
                                            {nft?.NFTCollection?.isVerified ? (
                                                <MdVerified
                                                    style={{
                                                        color: "#4f87ff",
                                                        marginLeft: "4px",
                                                        marginTop: "3px",
                                                    }}
                                                    size={16}
                                                />
                                            ) : (
                                                <BsFillExclamationCircleFill
                                                    style={{
                                                        color: "#c3c944",
                                                        marginLeft: "4px",
                                                        marginTop: "4px",
                                                    }}
                                                    size={15}
                                                />
                                            )}
                                        </div>
                                    ) : collectionData ? (
                                        <div className="flex align-middle mb-2">
                                            {collectionData?.data?.name
                                                ? collectionData?.data?.name
                                                : collectionData?.data?.contractAddress?.slice(
                                                    0,
                                                    8
                                                ) +
                                                "..." +
                                                collectionData?.data?.contractAddress?.slice(
                                                    60
                                                )}

                                            {collectionData?.data?.isVerified ? (
                                                <MdVerified
                                                    style={{
                                                        color: "#4f87ff",
                                                        marginLeft: "4px",
                                                        marginTop: "3px",
                                                    }}
                                                    size={16}
                                                />
                                            ) : (
                                                <BsFillExclamationCircleFill
                                                    style={{
                                                        color: "#c3c944",
                                                        marginLeft: "4px",
                                                        marginTop: "4px",
                                                    }}
                                                    size={15}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        nft?.collection?._address?.slice(0, 8) +
                                        "..." +
                                        nft?.collection?._address?.slice(60)
                                    )}
                                </div>
                                <h3 className="font-display text-jacarta-700 mb-1 text-base font-semibold dark:text-white">
                                    {nft?.name}
                                </h3>

                                {/* fees title  */}
                                <div className="">
                                    <div className="flex flex-wrap items-center mt-2">
                                        <span className="dark:text-jacarta-300 text-jacarta-500 mr-1 block text-sm">
                                            Creator Royalty:{" "}
                                            {nft?.NFTCollection?.royalty
                                                ? nft?.NFTCollection?.royalty
                                                : collectionData?.data?.royalty
                                                    ? collectionData?.data?.royalty
                                                    : 0}
                                            %
                                        </span>
                                        <span data-tippy-content="The creator of this collection will receive 5% of the sale total from future sales of this item.">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                width="24"
                                                height="24"
                                                className="dark:fill-jacarta-300 fill-jacarta-700 h-4 w-4"
                                            >
                                                <path fill="none" d="M0 0h24v24H0z"></path>
                                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"></path>
                                            </svg>
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center mt-1">
                                        <span className="dark:text-jacarta-300 text-jacarta-500 mr-1 block text-sm">
                                            Platform Fees: {platform_fees}%
                                        </span>
                                        <span data-tippy-content="The creator of this collection will receive 5% of the sale total from future sales of this item.">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                width="24"
                                                height="24"
                                                className="dark:fill-jacarta-300 fill-jacarta-700 h-4 w-4"
                                            >
                                                <path fill="none" d="M0 0h24v24H0z"></path>
                                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"></path>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* fees amounts  */}
                            <div className="feesSectionTarget ml-auto">
                                <span className="mb-8 flex items-center whitespace-nowrap">
                                    <span>
                                        <Image
                                            src={venomLogo}
                                            height={100}
                                            width={100}
                                            alt="logo"
                                            className="h-4 w-4 mr-2"
                                        />
                                    </span>
                                    <span className="dark:text-jacarta-100 text-sm font-medium tracking-tight">
                                        {listingPrice}
                                    </span>
                                </span>
                                <span className="mb-1 flex items-center whitespace-nowrap">
                                    <span>
                                        <Image
                                            src={venomLogo}
                                            height={100}
                                            width={100}
                                            alt="logo"
                                            className="h-4 w-4 mr-2"
                                        />
                                    </span>
                                    <span className="dark:text-jacarta-100 text-sm font-medium tracking-tight">
                                        {creatorRoyalty}
                                    </span>
                                </span>
                                <span className="mb-1 flex items-center whitespace-nowrap">
                                    <span>
                                        <Image
                                            src={venomLogo}
                                            height={100}
                                            width={100}
                                            alt="logo"
                                            className="h-4 w-4 mr-2"
                                        />
                                    </span>
                                    <span className="dark:text-jacarta-100 text-sm font-medium tracking-tight">
                                        {platformFees}
                                    </span>
                                </span>
                                <span className="mb-1 flex items-center whitespace-nowrap"></span>
                            </div>
                        </div>

                        <div className="dark:border-jacarta-600 border-jacarta-100 mb-2 flex items-center justify-between py-2.5">
                            <span className="font-display text-jacarta-700 hover:text-accent font-semibold dark:text-white">
                                Total listing price
                            </span>
                            <div className="ml-auto">
                                <span className="flex items-center whitespace-nowrap">
                                    <span>
                                        <Image
                                            src={venomLogo}
                                            height={100}
                                            width={100}
                                            alt="logo"
                                            className="h-4 w-4 mr-2"
                                        />
                                    </span>
                                    <span className="text-green font-medium tracking-tight">
                                        {finalListingPrice}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="buyNowTerms"
                                className="checked:bg-accent dark:bg-jacarta-600 text-accent border-jacarta-200 focus:ring-accent/20 dark:border-jacarta-500 h-5 w-5 self-start rounded focus:ring-offset-0"
                                onClick={() => setConfirmChecked(!confirmChecked)}
                                required
                            />
                            <label
                                htmlFor="buyNowTerms"
                                className="dark:text-jacarta-200 text-sm"
                            >
                                By checking this box, I agree to{" "}
                                <Link
                                    className="text-accent"
                                    target="_blank"
                                    href="/legal/Terms&Conditions"
                                >
                                    Terms of Service
                                </Link>
                            </label>
                        </div>
                    </div>

                    <div className="modal-footer">
                        {finalListingPrice <
                            (nft?.NFTCollection?.FloorPrice
                                ? nft?.NFTCollection?.FloorPrice
                                : collectionData?.data?.FloorPrice) &&
                            confirmChecked && (
                                <h3 className=" mb-6 text-[14px] text-red text-center">
                                    Please confirm you are listing your item below
                                    collection floor price, the current floor price is{" "}
                                    {nft?.NFTCollection?.FloorPrice
                                        ? nft?.NFTCollection?.FloorPrice
                                        : collectionData?.data?.FloorPrice}{" "}
                                    VENOM
                                </h3>
                            )}
                        <div className="flex items-center justify-center space-x-4">
                            {loading ? (
                                <button
                                    disabled
                                    type="button"
                                    className="rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                >
                                    Listing{" "}
                                    <svg
                                        aria-hidden="true"
                                        className="inline w-6 h-6 ml-3 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                        viewBox="0 0 100 101"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill"
                                        />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                >
                                    List Now
                                </button>
                            )}
                        </div>
                    </div>
                    {loading && (
                        <h3 className="px-12 mb-6 text-[14px] dark:text-white text-jacarta-700 text-center">
                            Please do not refresh or leave this page, you will get
                            redirected once NFT listing is completed, hold tight!
                        </h3>
                    )}
                </div>
            </form>
        </div>
    )
}

export default ListModal