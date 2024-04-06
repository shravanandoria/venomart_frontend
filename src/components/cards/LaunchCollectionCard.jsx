import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { MdVerified } from "react-icons/md";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import venomLogo from "../../../public/venomBG.webp"
import { GoDotFill } from "react-icons/go";
import { Timer } from "../Timer";


const LaunchCollectionCard = ({
  Cover,
  Logo,
  Name,
  Description,
  mintPrice,
  supply,
  mintedSupply,
  status,
  CollectionAddress,
  pageName,
  verified,
  startDate,
  endDate,
  OtherImagesBaseURI
}) => {

  const [isHovering, SetIsHovering] = useState(false);

  return (
    <Link href={`/launchpad/${pageName ? pageName : CollectionAddress}`}>
      <div className={`relative rounded-2.5xl ${status == "live" ? "border border-purple-800 dark:border-green-800" : "border border-jacarta-100 dark:border-jacarta-700"} bg-white p-[1.1875rem] transition-shadow hover:shadow-lg dark:bg-jacarta-700 h-[420px] w-[320px] overflow-hidden m-2 sm:m-4`}>

        <div
          className="relative flex space-x-[0.625rem]"
        >
          <span className="w-[100%] h-[150px]">
            <Image
              src={Cover.replace("ipfs://", OtherImagesBaseURI)}
              alt="Cover Image"
              className="h-full w-[100%] rounded-[0.625rem] object-cover"

              height={100}
              width={100}
            />
            <div className="px-2 py-1 flex items-center justify-center text-[12px] font-medium tracking-tight absolute top-0 right-0 bg-neutral-200 rounded-lg">
              <div className="flex flex-wrap justify-center items-center">
                <span className="textDotStyle">
                  {supply ? (supply <= 0 ? "∞" : supply) : 0} ITEMS
                </span>
              </div>
            </div>
          </span>
          <span className="absolute bottom-[-25px] right-[100px]">
            {Logo?.includes(".mp4") ?
              <video
                autoPlay="autoplay"
                loop={true}
                className="h-[80px] w-[80px] rounded-[100%] border b-4 border-black shadow-lg"
              >
                <source src={Logo} type="video/mp4"></source>
              </video>
              :
              <Image
                src={Logo.replace("ipfs://", OtherImagesBaseURI)}
                alt="Logo"
                className="h-[80px] w-[80px] rounded-[100%] border b-4 border-black shadow-lg"
                height={100}
                width={100}
              />
            }
          </span>
        </div>

        <div className="relative flex justify-center align-middle text-center">
          <div
            className="mt-8 font-display text-[22px] text-center text-jacarta-700 dark:text-white"
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden"
            }}
          >
            {Name}
          </div>
          {verified ?
            <MdVerified
              style={{ color: "#4f87ff", marginLeft: "4px", marginTop: "34px" }}
              size={25}
              onMouseOver={() => SetIsHovering(true)}
              onMouseOut={() => SetIsHovering(false)}
            />
            :
            <BsFillExclamationCircleFill style={{ color: "#c3c944", marginLeft: "6px", marginTop: "35px" }}
              size={20}
              onMouseOver={() => SetIsHovering(true)}
              onMouseOut={() => SetIsHovering(false)}
            />
          }
          {verified && isHovering &&
            <p className="absolute right-[0px] top-[5px] bg-blue px-[10px] py-[3px] text-white text-[12px]" style={{ borderRadius: "10px" }}>Verified</p>
          }
          {!verified && isHovering &&
            <p className="absolute right-[0px] top-[5px] bg-[#c3c944] px-[10px] py-[3px] text-black text-[12px]" style={{ borderRadius: "10px" }}>Not Verified</p>
          }
        </div>

        <div className="mb-2 flex items-center justify-center text-sm font-medium tracking-tight">
          <div className="flex flex-wrap justify-center items-center">
            <span className="textDotStyle mr-1 mt-1 dark:text-jacarta-400">
              {Description}
            </span>
          </div>
        </div>

        {status == "upcoming" && (
          <div className="pt-2">
            <h2 className="text-[10px] title-font font-bold text-jacarta-600 dark:text-jacarta-200 tracking-widest text-center">
              MINT STARTS IN
            </h2>
            <div className="text-[4px] text-jacarta-700 dark:text-white font-mono font-medium mb-1 mt-[-8px]">
              <div className="show-counter">
                <div className="countdown-link text-jacarta-600 dark:text-jacarta-200">
                  <Timer date={startDate} />
                </div>
              </div>
            </div>
          </div>
        )}
        {status == "live" && (
          <div className="pt-2">
            <h2 className="text-[10px] title-font font-bold text-jacarta-600 dark:text-jacarta-200 tracking-widest text-center">
              MINT ENDS IN
            </h2>
            <div className="text-[4px] text-jacarta-700 dark:text-white font-mono font-medium mb-1 mt-[-8px]">
              <div className="show-counter">
                <div className="countdown-link text-jacarta-600 dark:text-jacarta-200">
                  <Timer date={endDate} />
                </div>
              </div>
            </div>
          </div>
        )}
        {status == "ended" && (
          <div className="pt-2">
            <h2 className="text-[10px] title-font font-bold text-jacarta-600 dark:text-jacarta-200 tracking-widest text-center">
              MINTED NFTS
            </h2>
            <div className="text-[4px] text-jacarta-700 dark:text-white font-mono font-medium mb-1 mt-[-8px]">
              <div className="show-counter">
                <div className="countdown-link text-jacarta-600 dark:text-jacarta-200">
                  {mintedSupply}/{supply}
                </div>
              </div>
            </div>
          </div>
        )}
        {status == "sold out" && (
          <div className="pt-2">
            <h2 className="text-[10px] title-font font-bold text-jacarta-600 dark:text-jacarta-200 tracking-widest text-center">
              MINTED NFTS
            </h2>
            <div className="text-[4px] text-jacarta-700 dark:text-white font-mono font-medium mb-1 mt-[-8px]">
              <div className="show-counter">
                <div className="countdown-link text-jacarta-600 dark:text-jacarta-200">
                  {supply}/{supply}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between align-middle mx-2">
          {(status == "live" || status == "upcoming") &&
            <button className="flex align-middle justify-center self-center dark:text-jacarta-200 font-bold py-2 px-6 rounded-full text-jacarta-700">
              {status == "live" ?
                <span className="relative flex justify-center align-middle h-2.5 w-2.5 mr-[5px] mt-[5px]">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                :
                <GoDotFill className="h-[19px] w-[19px] text-green" />
              }
              <span className="text-jacarta-500 dark:text-jacarta-200 uppercase text-[15px]">{status}</span>
            </button>
          }
          {(status == "sold out" || status == "ended") &&
            <button className="flex align-middle justify-center self-center dark:text-jacarta-200 font-bold py-2 px-6 rounded-full text-jacarta-700">
              {status == "sold out" ?
                <p className="text-[14px] pr-[4px]">🔥</p>
                :
                <GoDotFill className="h-[19px] w-[19px] mt-[2px] text-jacarta-300" />
              }
              <span className="text-jacarta-500 dark:text-jacarta-200 uppercase text-[15px]">{status}</span>
            </button>
          }
          <div className="flex self-center border border-jacarta-100 dark:border-jacarta-600 dark:text-jacarta-200 font-bold py-1.5 px-8 rounded-full text-jacarta-700">
            <Image
              src={venomLogo}
              height={100}
              width={100}
              style={{
                height: "16px",
                width: "16px",
                marginRight: "7px",
                marginTop: "5px"
              }}
              alt="VenomLogo"
            />
            {mintPrice}
          </div>
        </div>
      </div >
    </Link>
  );
};

export default LaunchCollectionCard;
