import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import { MdVerified } from "react-icons/md";
import venomLogo from "../../../public/venomBG.webp";

const CollectionRankingCard = ({
  id,
  contractAddress,
  Logo,
  Name,
  Volume,
  isVerified,
  Royalty,
  Floor,
  Sales,
  Listings,
  totalSupply,
}) => {

  return (
    <Link
      href={`/collection/${contractAddress}`}
      className="flex transition-shadow hover:shadow-lg"
      role="row"
    >
      <div
        className="flex w-[28%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
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
          {isVerified ? (
            <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white dark:bg-transparent dark:border-jacarta-600">
              <MdVerified style={{ color: "#4f87ff" }} size={22} />
            </div>
          ) : (
            <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white dark:bg-transparent dark:border-jacarta-600">
              <BsFillExclamationCircleFill
                style={{ color: "#c3c944" }}
                size={20}
              />
            </div>
          )}
        </div>
        <span className="font-display text-sm font-semibold text-jacarta-700 dark:text-white">
          {Name}
        </span>
      </div>
      <div
        className="flex w-[12%] items-center whitespace-nowrap border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
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
          {Volume ? Volume.toFixed(2) : "0"}
        </span>
      </div>

      {/* floor price  */}
      <div className="flex w-[12%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
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
          {Floor ? Floor : "0"}
        </span>
      </div>

      {/* listings  */}
      <div
        className="flex w-[12%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
        role="cell"
      >
        <span className="dark:text-jacarta-200 text-jacarta-700">
          {Listings ? Listings : "0"}
        </span>
      </div>

      {/* sales  */}
      <div
        className="flex w-[12%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
        role="cell"
      >
        <span className="dark:text-jacarta-200 text-jacarta-700">
          {Sales ? Sales : "0"}
        </span>
      </div>

      {/* items  */}
      <div
        className="flex w-[12%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
        role="cell"
      >
        <span className="dark:text-jacarta-200 text-jacarta-700">
          {totalSupply ? totalSupply : "0"}
        </span>
      </div>

      {/* royalty  */}
      <div
        className="flex w-[12%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
        role="cell"
      >
        <span className="dark:text-jacarta-200 text-jacarta-700">
          {Royalty ? Royalty : "0"} %
        </span>
      </div>
    </Link>
  );
};

export default CollectionRankingCard;
