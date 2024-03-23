import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import { MdVerified } from "react-icons/md";
import venomLogo from "../../../public/venomBG.webp";
import defLogo from "../../../public/deflogo.png";
import numeral from 'numeral';


const CollectionRankingCard = ({
  id,
  contractAddress,
  Logo,
  Name,
  Volume,
  isVerified,
  AveragePrice,
  Floor,
  Sales,
  Listings,
  totalSupply,
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
                ? Logo.replace("ipfs://", OtherImagesBaseURI)
                : defLogo
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
          {Name ? Name : "Unknown Collection"}
        </span>
      </div>
      <div
        className="flex w-[12%] items-center whitespace-nowrap border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
        role="cell"
      >
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
          {Volume ? formatNumberShort(Volume) : "0"}
        </span>
      </div>

      {/* floor price  */}
      <div className="flex w-[12%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
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
          {Floor ? formatNumberShort(Floor) : "0"}
        </span>
      </div>

      {/* avg price  */}
      <div className="flex w-[12%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600">
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

      {/* listings  */}
      <div
        className="flex w-[12%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
        role="cell"
      >
        <span className="dark:text-jacarta-200 text-jacarta-700 uppercase">
          {Listings ? formatNumberShort(Listings) : "0"}
        </span>
      </div>

      {/* sales  */}
      <div
        className="flex w-[12%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
        role="cell"
      >
        <span className="dark:text-jacarta-200 text-jacarta-700 uppercase">
          {Sales ? formatNumberShort(Sales) : "0"}
        </span>
      </div>

      {/* items  */}
      <div
        className="flex w-[12%] items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
        role="cell"
      >
        <span className="dark:text-jacarta-200 text-jacarta-700 uppercase">
          {totalSupply ? formatNumberShort(totalSupply) : "0"}
        </span>
      </div>
    </Link>
  );
};

export default CollectionRankingCard;
