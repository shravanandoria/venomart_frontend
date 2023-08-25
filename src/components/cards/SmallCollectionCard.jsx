import Image from "next/image";
import Link from "next/link";
import React from "react";
import { MdVerified } from "react-icons/md";
import venomLogo from "../../../public/venomBG.webp";
import { BsFillExclamationCircleFill } from "react-icons/bs";

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
  return (
    <Link href={`/collection/${CollectionAddress}`}>
      <div
        className={`flex rounded-2.5xl border ${theme == "dark" ? "border-jacarta:900" : "border-jacarta-100"
          } bg-white py-4 px-7 transition-shadow hover:shadow-lg dark:bg-jacarta-800 h-[100px] w-[300px] m-4 sm:m-6 overflow-hidden`}
      >
        <div className="mr-4 shrink-0">
          <div className="relative block">
            <Image
              src={Logo.replace("ipfs://", "https://ipfs.io/ipfs/")}
              alt="avatar 1"
              className="rounded-2lg h-[60px] w-[auto]"
              height={100}
              width={100}
              loading="lazy"
            />
            <div className="absolute -left-3 top-[10px] flex h-6 w-6 -translate-y-2/4 items-center justify-center rounded-full border-2 border-white bg-jacarta-700 text-xs text-white dark:border-jacarta-600">
              {id}
            </div>
            {isVerified ? (
              <div className="absolute right-[-5px] top-[80%] flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white dark:bg-transparent dark:border-jacarta-600">
                <MdVerified style={{ color: "#4f87ff" }} size={25} />
              </div>
            ) : (
              <div className="absolute right-[-5px] top-[80%] flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white dark:bg-transparent dark:border-jacarta-600">
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
              className="font-display font-semibold text-jacarta-700 hover:text-accent dark:text-white"
              style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {Name}
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
            {Floor ? Floor : "0"}
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
            {Volume ? Volume : "0"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SmallCollectionCard;
