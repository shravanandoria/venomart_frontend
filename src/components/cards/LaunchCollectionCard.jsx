import Link from "next/link";
import React from "react";
import Image from "next/image";
import { MdVerified } from "react-icons/md";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import venomLogo from "../../../public/venom.svg"


const LaunchCollectionCard = ({
  Cover,
  Logo,
  Name,
  mintPrice,
  totalItems,
  CollectionAddress,
  customLink
}) => {
  return (
    <div className="relative rounded-2.5xl border border-jacarta-100 bg-white p-[1.1875rem] transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700 h-[370px] w-[280px] overflow-hidden  m-4 sm:m-8">
      <Link
        href={`/launchpad/${customLink ? customLink : CollectionAddress}`}
        className="relative flex space-x-[0.625rem]"
      >
        <span className="w-[100%] h-[150px]">
          <Image
            // src={Cover?.replace("ipfs://", "https://ipfs.io/ipfs/")}
            src={Cover}
            alt="Cover Image"
            className="h-full w-[100%] rounded-[0.625rem] object-cover"
            loading="lazy"
            height={100}
            width={100}
          />
        </span>
        <span className="absolute bottom-[-25px] right-20">
          <Image
            // src={Logo?.replace("ipfs://", "https://ipfs.io/ipfs/")}
            src={Logo}
            alt="Logo"
            className="h-[75px] w-[75px] rounded-[100%] border b-4 border-black shadow-lg"
            loading="lazy"
            height={100}
            width={100}
          />
        </span>
      </Link>

      <div className="flex justify-center align-middle text-center">
        <Link
          href={`/launchpad/${customLink ? customLink : CollectionAddress}`}
          className="mt-8 font-display text-[22px] text-center text-jacarta-700 hover:text-accent dark:text-white "
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden"
          }}
        >
          {Name}
        </Link>
        <MdVerified
          style={{ color: "#4f87ff", marginLeft: "4px", marginTop: "34px" }}
          size={25}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-sm font-medium tracking-tight">
        <div className="flex flex-wrap items-center">
          <span className="textDotStyle mr-1 mt-1 dark:text-jacarta-400">Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente corrupti error qui ab consequatur, optio praesentium repellat quibusdam alias, amet nostrum. Ut, nostrum! Ut, saepe! Error aspernatur corporis molestias necessitatibus vel ipsam eum itaque, repellat obcaecati? Dolorum, ipsum, commodi enim tempore, repudiandae beatae nemo ipsam nulla officiis voluptate nostrum aut?</span>
        </div>
      </div>
      <div className="flex justify-between align-middle my-6 mx-2">
        <button className=" dark:text-jacarta-200 font-bold py-2 px-6 rounded-full text-jacarta-700">
          {totalItems}+ Items
        </button>
        <button className="flex border border-jacarta-100 dark:border-jacarta-600 dark:text-jacarta-200 font-bold py-2 px-6 rounded-full text-jacarta-700">
          {mintPrice}
          <Image
            src={venomLogo}
            height={100}
            width={100}
            style={{
              height: "13px",
              width: "13px",
              marginLeft: "7px",
              marginTop: "5px"
            }}
          />
        </button>
      </div>
    </div >
  );
};

export default LaunchCollectionCard;
