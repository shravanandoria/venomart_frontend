import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { MdVerified } from "react-icons/md";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import venomLogo from "../../../public/venomBG.webp";

const CollectionCard = ({
  Cover,
  Logo,
  Name,
  Description,
  OwnerAddress,
  CollectionAddress,
  verified,
  Listing,
  Volume,
  FloorPrice,
  TotalSupply,
}) => {
  const [isHovering, SetIsHovering] = useState(false);

  return (
    <Link href={`/collection/${CollectionAddress}`}>
      <div className="relative rounded-2.5xl border border-jacarta-100 bg-white p-[1.1875rem] transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700 h-[400px] w-[300px] overflow-hidden m-4 sm:m-8">
        <div className="relative flex space-x-[0.625rem]">
          <span className="w-[100%] h-[150px]">
            <Image
              src={Cover?.replace("ipfs://", "https://ipfs.io/ipfs/")}
              alt="Cover Image"
              className="h-full w-[100%] rounded-[0.625rem] object-cover"

              height={100}
              width={100}
            />
          </span>
          <span className="absolute bottom-[-25px] right-24">
            <Image
              src={Logo?.replace("ipfs://", "https://ipfs.io/ipfs/")}
              alt="Logo"
              className="h-[75px] w-[75px] rounded-[100%] border b-4 border-black shadow-lg bg-gray-800"

              height={100}
              width={100}
            />
          </span>
        </div>

        <div className="relative flex justify-center align-middle text-center">
          <div
            className="mt-8 font-display text-[22px] text-center text-jacarta-700 hover:text-accent dark:text-white"
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {Name}
          </div>
          {verified}
          {verified ? (
            <MdVerified
              style={{ color: "#4f87ff", marginLeft: "4px", marginTop: "34px" }}
              size={25}
              onMouseOver={() => SetIsHovering(true)}
              onMouseOut={() => SetIsHovering(false)}
            />
          ) : (
            <BsFillExclamationCircleFill
              style={{ color: "#c3c944", marginLeft: "6px", marginTop: "35px" }}
              size={20}
              onMouseOver={() => SetIsHovering(true)}
              onMouseOut={() => SetIsHovering(false)}
            />
          )}
          {verified && isHovering && (
            <p
              className="absolute right-[0px] top-[5px] bg-blue px-[10px] py-[3px] text-white text-[12px]"
              style={{ borderRadius: "10px" }}
            >
              Verified
            </p>
          )}
          {!verified && isHovering && (
            <p
              className="absolute right-[0px] top-[5px] bg-[#c3c944] px-[10px] py-[3px] text-black text-[12px]"
              style={{ borderRadius: "10px" }}
            >
              Not Verified
            </p>
          )}
        </div>
        <div className="flex">
          <span className="w-[100%] font-display text-[13px] text-center text-jacarta-700 hover:text-accent dark:text-jacarta-200">
            {TotalSupply ? TotalSupply : "0"} Items
          </span>
        </div>

        <div className="mt-2 flex items-center justify-center text-sm font-medium tracking-tight">
          <div className="flex justify-center flex-wrap items-center">
            <span className="textDotStyle mr-1 mt-1 dark:text-jacarta-400">
              {Description}
            </span>
          </div>
        </div>
        <div className="flex justify-between align-middle my-6">
          <button className=" dark:text-jacarta-200 font-bold py-2 px-4 rounded-full text-jacarta-700">
            <span className="text-jacarta-400">Listings</span>{" "}
            {Listing ? Listing : "0"}
          </button>
          <button className=" dark:text-jacarta-200 font-bold py-2 px-4 rounded-full text-jacarta-700">
            <span className="text-jacarta-400">Floor</span>
            <span className="flex justify-center">
              <Image
                src={venomLogo}
                height={100}
                width={100}
                style={{
                  height: "14px",
                  width: "14px",
                  marginRight: "8px",
                  marginTop: "6px",
                }}
                alt="VenomLogo"
              />
              {FloorPrice ? FloorPrice : "0"}
            </span>
          </button>
          <button className=" dark:text-jacarta-200 font-bold py-2 px-4 rounded-full text-jacarta-700">
            <span className="text-jacarta-400">Volume</span>
            <span className="flex justify-center">
              <Image
                src={venomLogo}
                height={100}
                width={100}
                style={{
                  height: "14px",
                  width: "14px",
                  marginRight: "8px",
                  marginTop: "6px",
                }}
                alt="VenomLogo"
              />
              {Volume ? Volume.toFixed(2) : "0"}
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CollectionCard;
