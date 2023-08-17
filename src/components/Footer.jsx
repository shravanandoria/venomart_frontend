import React from "react";
import Image from "next/image";
import Link from "next/link";
import darkPng from "../../public/darkpng.png";
import whitePng from "../../public/whitepng.png";
import { BsDiscord, BsTelegram, BsTwitter, BsYoutube } from "react-icons/bs";

const Footer = ({
  theme,
  adminAccount,
  signer_address,
  MintNFTStatus,
  MintCollectionStatus,
  onDisconnect,
}) => {
  return (
    <div className={`${theme}`}>
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
                {/* <li>
                  <Link
                    href="/explore/NFTs"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    Explore NFTs
                  </Link>
                </li> */}
                <li>
                  <Link
                    href="/explore/Collections"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    Top Collections
                  </Link>
                </li>
                <li>
                  <Link
                    href="/explore/Rankings"
                    className="hover:text-accent dark:hover:text-white"
                  >
                    Rankings
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
                {/* <li>
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
                </li> */}
              </ul>
            </div>

            {/* admin links  */}
            {adminAccount === signer_address && (
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
    </div>
  );
};

export default Footer;
