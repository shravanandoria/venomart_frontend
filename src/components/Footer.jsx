import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import darkPng from "../../public/darkpng.png";
import whitePng from "../../public/whitepng.png";
import venomLogo from "../../public/venomBG.webp";
import { BsDiscord, BsExclamationCircleFill, BsTelegram, BsTwitter, BsYoutube } from "react-icons/bs";
import { MdVerified } from "react-icons/md";
import { useRouter } from "next/router";
import numeral from "numeral";

const Footer = ({
  theme,
  adminAccount,
  signer_address,
  MintNFTStatus,
  MintCollectionStatus,
  onDisconnect,
  cartNFTs,
  setCartNFTs,
  setAnyModalOpen
}) => {
  const router = useRouter();
  const [actionLoad, setActionLoad] = useState(false);
  const [itemsModal, setItemsModal] = useState(false);

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

  const buyCartNFTs = (e) => {
    e.preventDefault()
    alert("This feature will be available soon..");
    return;
  }

  const totalListingPrice = cartNFTs.reduce((total, nft) => {
    const amount = parseFloat(nft?.listingPrice);
    return total + amount;
  }, 0);

  const removeFromCart = (itemToRemoveId) => {
    const updatedCartNFTs = cartNFTs.filter((item) => item._id !== itemToRemoveId);
    setCartNFTs(updatedCartNFTs);
  };

  useEffect(() => {
    setItemsModal(false);
  }, [router.pathname]);

  return (
    <div className={`${theme}`}>

      {itemsModal && (
        <div className="backgroundModelBlur backdrop-blur-lg"></div>
      )}

      {/* cart */}
      {cartNFTs != "" &&
        <div onClick={() => (setAnyModalOpen(true), setItemsModal(true))} className="fixed bottom-[3%] right-[1%] bg-blue py-4 px-4 rounded-[100px] cursor-pointer hover:bg-blue-900 z-20">
          <div className="relative flex flex-row justify-center align-middle">
            {cartNFTs?.map((nft, index) => {
              return (
                index < 3 &&
                (<Image key={nft._id} src={nft?.nft_image} alt="items" height={100} width={100} className={`rounded-full h-[40px] w-[40px] border-[2px] border-black ${index === 1 || index === 2 ? 'ml-[-16px]' : ''}`} />)
              )
            })}
            {cartNFTs?.length > 3 &&
              <h2 className="absolute top-[-20px] right-[-20px] bg-blue-800 px-2 text-[14px] text-white rounded-[100px]">+{(cartNFTs?.length) - 3}</h2>
            }
          </div>
        </div>
      }

      {/* cart modal  */}
      {itemsModal &&
        <div className="afterMintDiv">
          <form onSubmit={buyCartNFTs} className="modal-dialog max-w-2xl">
            <div className="modal-content shadow-2xl dark:bg-jacarta-800">
              <div className="modal-header">
                <h5 className="modal-title" id="placeBidLabel">
                  Buy Items
                </h5>
                {!actionLoad && (
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => (
                      setItemsModal(false), setAnyModalOpen(false)
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

              {/* fees and display section  */}
              <div className="modal-body p-6">
                <div className="mb-2 flex items-center justify-between px-2">
                  <span className="font-display text-jacarta-700 text-sm font-semibold dark:text-white">
                    {cartNFTs?.length ? cartNFTs?.length : "0"} Items
                  </span>
                  <span className="feesSectionTarget font-display text-jacarta-700 text-sm font-semibold dark:text-white">
                    Subtotal
                  </span>
                </div>

                <div className="customCheckoutBar max-h-[275px] overflow-y-auto px-2">
                  {cartNFTs.map((nft, index) => {
                    return (
                      <div key={index} className="dark:border-jacarta-600 relative flex items-center py-2">
                        {/* nft image  */}
                        <div className="relative mr-5 self-start">
                          <Image
                            src={nft?.nft_image?.replace(
                              "ipfs://",
                              "https://ipfs.io/ipfs/"
                            )}
                            alt="nftPreview"
                            width={100}
                            height={100}
                            className="rounded-2lg h-[65px] w-[65px] object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-[-4px] right-[-4px] bg-red rounded-xl"
                            onClick={() => (removeFromCart(nft?._id))}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              className="h-4 w-4 fill-white"
                            >
                              <path fill="none" d="M0 0h24v24H0z" />
                              <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                            </svg>
                          </button>
                        </div>

                        {/* main nft info  */}
                        <div>
                          <div className="flex text-accent text-[13px] mb-2" >
                            {(nft?.NFTCollection?.name ? nft?.NFTCollection?.name : nft?.NFTCollection?.contractAddress?.slice(0, 8) +
                              "..." +
                              nft?.NFTCollection?.contractAddress?.slice(60))}

                            {nft?.NFTCollection?.isVerified ?
                              <MdVerified style={{ color: "#4f87ff", marginLeft: "3px", marginTop: "3px" }}
                                size={13} />
                              :
                              <BsExclamationCircleFill style={{ color: "#c3c944", marginLeft: "3px", marginTop: "3px" }}
                                size={13} />
                            }
                          </div>
                          <h3 className="font-display text-jacarta-700 mb-1 text-base font-semibold dark:text-white">
                            {nft?.name}
                          </h3>
                        </div>

                        {/* fees amounts  */}
                        <div className="feesSectionTarget ml-auto">
                          <span className="mb-4 flex items-center whitespace-nowrap">
                            <span>
                              <Image
                                src={venomLogo}
                                height={100}
                                width={100}
                                alt="logo"
                                className="h-4 w-4 mr-2"
                              />
                            </span>
                            <span className="dark:text-jacarta-100 text-[18px] font-medium tracking-tight">
                              {nft?.listingPrice ? formatNumberShort(nft?.listingPrice) : "0.00"}
                            </span>
                          </span>
                          <span className="mb-1 flex items-center whitespace-nowrap"></span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {cartNFTs.length <= 0 &&
                  <h3 className="font-display text-jacarta-700 mb-1 text-[20px] font-semibold dark:text-white text-center py-12">
                    Your cart is empty!
                  </h3>
                }

                {/* total amount */}
                <div className="dark:border-jacarta-600 border-jacarta-100 mb-2 flex items-center justify-between pt-3 pb-2 border-t mt-4 px-2">
                  <span className="font-display text-jacarta-700 hover:text-accent font-semibold dark:text-white">
                    Your Total
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
                      <span className="text-green font-medium text-lg tracking-tight">
                        {totalListingPrice ? formatNumberShort(totalListingPrice) : "0"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* terms  */}
                <div className="mt-4 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="buyNowTerms"
                    className="checked:bg-accent dark:bg-jacarta-600 text-accent border-jacarta-200 focus:ring-accent/20 dark:border-jacarta-500 h-5 w-5 self-start rounded focus:ring-offset-0"
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

              {/* purchase btns  */}
              <div className="modal-footer">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => (setCartNFTs([]), setAnyModalOpen(false), setItemsModal(false))}
                    type="button"
                    className="flex w-38 rounded-xl bg-white py-3 px-8 text-center font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume"
                  >
                    Clear
                  </button>

                  {actionLoad ? (
                    <button
                      disabled
                      type="button"
                      className="rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                    >
                      Buying{" "}
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
                      className="rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark whitespace-nowrap"
                    >
                      Confirm Buy
                    </button>
                  )}
                </div>
              </div>

              {actionLoad && (
                <h3 className="px-12 mb-6 text-[14px] dark:text-white text-jacarta-700 text-center">
                  Please do not refresh or leave this page, you will get
                  redirected after your purchase is processed, hold tight!
                </h3>
              )}
            </div>
          </form>
        </div>
      }

      {/* main footer  */}
      <div className="w-full page-footer dark:bg-jacarta-900 bottom-0 left-0 block">
        <div className="container">
          <div className="grid grid-cols-6 gap-x-7 gap-y-14 pt-24 pb-12 md:grid-cols-12">
            <div className="col-span-full sm:col-span-3 md:col-span-4">
              {theme === "dark" ? (
                <Link href="/" className="mb-4 inline-block">
                  <Image
                    src={darkPng}
                    height={170}
                    width={190}
                    alt="Venomart | NFT Marketplace"
                  />
                </Link>
              ) : (
                <Link href="/" className="mb-4 inline-block">
                  <Image
                    src={whitePng}
                    height={170}
                    width={190}
                    alt="Venomart | NFT Marketplace"
                  />
                </Link>
              )}
              <p className="mb-6 dark:text-jacarta-300">
                Create, sell and collect NFTs on Venomart. Powered by venom
                blockchain.
              </p>
              <div className="flex space-x-5">
                <a
                  href="https://twitter.com/venomart23"
                  target="_blank"
                  className="group"
                >
                  <BsTwitter className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                </a>
                <a
                  href="https://discord.gg/wQbBr6Xean"
                  target="_blank"
                  className="group"
                >
                  <BsDiscord className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                </a>
                <a
                  href="https://t.me/venomart_space"
                  target="_blank"
                  className="group"
                >
                  <BsTelegram className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                </a>
                <a
                  href="https://www.youtube.com/@Venomart-marketplace"
                  target="_blank"
                  className="group"
                >
                  <BsYoutube className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                </a>
              </div>
            </div>

            <div className="col-span-full sm:col-span-3 md:col-span-2 md:col-start-7">
              <h3 className="mb-6 font-display text-sm text-jacarta-700 dark:text-white">
                Marketplace
              </h3>
              <ul className="flex flex-col space-y-1 dark:text-jacarta-300">
                <li>
                  <Link
                    href="/explore/NFTs"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    Explore NFTs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/explore/Collections"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    Explore Collections
                  </Link>
                </li>
                <li>
                  <Link
                    href="/explore/rankings/Collections"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    Rankings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/explore/Activity"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    Live Activity
                  </Link>
                </li>
                <li>
                  <Link
                    href="/explore/Launchpad"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    Launchpad
                  </Link>
                </li>
              </ul>
            </div>

            {signer_address &&
              <div className="col-span-full sm:col-span-3 md:col-span-2">
                <h3 className="mb-6 font-display text-sm text-jacarta-700 dark:text-white">
                  My Account
                </h3>
                <ul className="flex flex-col space-y-1 dark:text-jacarta-300">
                  <li>
                    <Link
                      href={`/profile/${signer_address}`}
                      className="hover:text-accent dark:hover:text-white"
                    >
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/profile/EditProfile"
                      className="hover:text-accent dark:hover:text-white"
                    >
                      Edit Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/profile/Notifications"
                      className="hover:text-accent dark:hover:text-white"
                    >
                      Notifications
                    </Link>
                  </li>
                  {MintNFTStatus && (
                    <li>
                      <Link
                        href="/mint/CreateNFT"
                        className="hover:text-accent dark:hover:text-white"
                      >
                        Create NFT
                      </Link>
                    </li>
                  )}
                  {MintCollectionStatus && (
                    <li>
                      <Link
                        href="/mint/CreateNFTCollection"
                        className="hover:text-accent dark:hover:text-white"
                      >
                        Create Collection
                      </Link>
                    </li>
                  )}
                  {signer_address && (
                    <li>
                      <div
                        onClick={onDisconnect}
                        className="hover:text-accent dark:hover:text-white cursor-pointer"
                      >
                        Sign Out
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            }

            <div className="col-span-full sm:col-span-3 md:col-span-2">
              <h3 className="mb-6 font-display text-sm text-jacarta-700 dark:text-white">
                Other Links
              </h3>
              <ul className="flex flex-col space-y-1 dark:text-jacarta-300">
                {/* <li>
                  <Link
                    href="https://forms.gle/98VPnY7FSTuHCvaTA"
                    target="_blank"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    Apply For Launchpad
                  </Link>
                </li> */}
                {/* <li>
                  <Link
                    href="https://forms.gle/UtYWWkhsBYG9ZUjD8"
                    target="_blank"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    Verify Your Collection
                  </Link>
                </li> */}
                <li>
                  <Link
                    href="https://forms.gle/DvYFih5vwvzJdwRL6"
                    target="_blank"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    Feedback Form
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://zealy.io/c/venomart/questboard"
                    target="_blank"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    OG Quests
                  </Link>
                </li>
                <li>
                  <Link
                    href="/Help"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/Contact"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* admin links  */}
            {adminAccount.includes(signer_address) && (
              <div className="col-span-full sm:col-span-3 md:col-span-2">
                <h3 className="mb-6 font-display text-sm text-jacarta-700 dark:text-white">
                  Admin Links
                </h3>
                <ul className="flex flex-col space-y-1 dark:text-jacarta-300">
                  <li>
                    <Link
                      href="/admin/AddCollection"
                      className="hover:text-accent dark:hover:text-white"
                    >
                      Add Collection
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/CreateLaunch"
                      className="hover:text-accent dark:hover:text-white"
                    >
                      Create A Launch
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-between space-y-2 py-8 sm:flex-row sm:space-y-0">
            <span className="text-sm dark:text-jacarta-400">
              &copy; 2023 Venomart All rights reserved
            </span>
            <ul className="flex flex-wrap space-x-4 text-sm dark:text-jacarta-400">
              <li>
                <Link
                  href="/legal/Terms&Conditions"
                  className="hover:text-accent"
                >
                  Terms and conditions
                </Link>
              </li>
              <li>
                <Link href="/legal/PrivacyPolicy" className="hover:text-accent">
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Footer;
