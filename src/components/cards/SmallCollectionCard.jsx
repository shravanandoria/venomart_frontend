import Image from "next/image";
import Link from "next/link";
import React from "react";
import { MdVerified } from "react-icons/md";
import venomLogo from "../../../public/venomBG.webp";
import defLogo from "../../../public/deflogo.png";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import numeral from 'numeral';

const SmallCollectionCard = ({
  Logo,
  theme,
  id,
  Name,
  CollectionAddress,
  Volume,
  Floor,
  isVerified,
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
    <Link href={`/collection/${CollectionAddress}`}>
      <div
        className={`flex rounded-2.5xl border ${theme == "dark" ? "border-jacarta:900" : "border-jacarta-100"
          } bg-white py-4 px-7 transition-shadow hover:shadow-lg dark:bg-jacarta-800 h-[100px] w-[300px] m-4 sm:m-6 overflow-hidden`}
      >
        <div className="mr-4 shrink-0">
          <div className="relative block">
            <Image
              src={
                Logo
                  ? Logo.replace("ipfs://", "https://ipfs.io/ipfs/")
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
            {isVerified ? (
              <div className="absolute right-[-5px] top-[75%] flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white dark:bg-transparent dark:border-jacarta-600">
                <MdVerified style={{ color: "#4f87ff" }} size={25} />
              </div>
            ) : (
              <div className="absolute right-[-5px] top-[75%] flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white dark:bg-transparent dark:border-jacarta-600">
                <BsFillExclamationCircleFill
                  style={{ color: "#c3c944" }}
                  size={20}
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="block relative">
            <span
              className="font-display font-semibold text-jacarta-700 dark:text-white"
              style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {Name ? Name : "Unknown Collection"}
            </span>
          </div>
          <span className="text-sm dark:text-jacarta-300 flex">
            Floor price :{" "}
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
            {Floor ? formatNumberShort(Floor) : "0"}
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
            {Volume ? formatNumberShort(Volume) : "0"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SmallCollectionCard;
