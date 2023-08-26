import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import { MdVerified } from "react-icons/md";

const NftCard = ({
  ImageSrc,
  Name,
  Description,
  Address,
  listedBool = false,
  listingPrice,
  NFTCollectionAddress,
  NFTCollectionName,
  NFTCollectionStatus,
  currency
}) => {
  const [isHovering, SetIsHovering] = useState(false);


  return (
    <Link href={`/nft/${Address}`} className="relative block rounded-2.5xl border border-jacarta-100 bg-white p-[1.1875rem] transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700 overflow-hidden m-6 w-[300px] ">
      <div className="relative mb-4">
        <Image
          src={ImageSrc}
          height={100}
          width={100}
          alt="item 5"
          className="h-[220px] w-full rounded-[0.625rem]"
          loading="lazy"
        />
      </div>
      {NFTCollectionName &&
        <div className="relative flex" href={`/nft/${NFTCollectionAddress}`} >
          <span className="font-display text-[13px] text-jacarta-700 hover:text-accent dark:text-white"
            style={{
              width: "170px",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              display: "flex"
            }}>
            {NFTCollectionName}
            {NFTCollectionStatus ?
              <MdVerified
                style={{ color: "#4f87ff", marginLeft: "4px" }}
                size={17}
                onMouseOver={() => SetIsHovering(true)}
                onMouseOut={() => SetIsHovering(false)}
              />
              :
              <BsFillExclamationCircleFill style={{ color: "#c3c944", marginLeft: "4px" }}
                size={16}
                onMouseOver={() => SetIsHovering(true)}
                onMouseOut={() => SetIsHovering(false)}
              />
            }
            {NFTCollectionStatus && isHovering &&
              <p className="absolute right-[30px] bg-blue px-[6px] py-[2px] text-white text-[10px] mb-1" style={{ borderRadius: "10px" }}>Verified</p>
            }
            {!NFTCollectionStatus && isHovering &&
              <p className="absolute right-[30px] bg-[#c3c944] px-[6px] py-[2px] text-black text-[10px] mb-1" style={{ borderRadius: "10px" }}>Not Verified</p>
            }
          </span>
        </div>
      }
      <div className="mt-2 flex items-center justify-between">
        <div
          style={{
            width: "170px",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          <span className="font-display text-base text-jacarta-700 dark:text-white">
            {Name}
          </span>
        </div>
        {listedBool && (
          <span className="flex items-center whitespace-nowrap rounded-md border border-jacarta-100 py-1 px-2 dark:border-jacarta-600">
            <span className=" text-sm font-medium tracking-tight text-green">
              {listingPrice} {currency}
            </span>
          </span>
        )}
      </div>
      <div
        className="mt-2 text-sm"
        style={{
          width: "220px",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        <span className="mr-1 text-jacarta-700 dark:text-jacarta-200">
          {Description}
        </span>
      </div>
    </Link>
  );
};

export default NftCard;
