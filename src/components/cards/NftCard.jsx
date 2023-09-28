import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BsFillCartPlusFill, BsFillCheckCircleFill, BsFillExclamationCircleFill } from "react-icons/bs";
import { MdVerified } from "react-icons/md";
import venomLogo from "../../../public/venomBG.webp";
import { AiFillPlusCircle } from "react-icons/ai";


const NftCard = ({
  ImageSrc,
  Name,
  Address,
  Owner,
  signerAddress,
  listedBool = false,
  listingPrice,
  NFTCollectionAddress,
  NFTCollectionName,
  NFTCollectionStatus,
  setAnyModalOpen,
  setBuyModal,
  setCancelModal,
  NFTData,
  setSelectedNFT,
  cartNFTs,
  setCartNFTs,
  Description
}) => {
  const [isHovering, SetIsHovering] = useState(false);

  const addToCart = () => {
    if (!cartNFTs.some((item) => item._id === NFTData._id)) {
      setCartNFTs([...cartNFTs, NFTData]);
    }
  };

  const removeFromCart = (itemToRemove) => {
    const updatedCartNFTs = cartNFTs.filter((item) => item._id !== itemToRemove._id);
    setCartNFTs(updatedCartNFTs);
  };

  return (
    <Link href={`/nft/${Address}`} className="cardHoverNFT hover:bg-gray-50 relative block rounded-2.5xl border border-jacarta-100 bg-white p-[1.1875rem] transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700 overflow-hidden m-6 w-[300px]">
      <div className="ImageHoverEffect relative mb-4">
        <Image
          src={ImageSrc}
          height={100}
          width={100}
          alt="nftItem"
          className="ImageInEffect h-[220px] w-full rounded-[0.625rem]"
        />

        {(listedBool && signerAddress != Owner) &&
          (cartNFTs.some((item) => item._id === NFTData._id) ?
            <BsFillCheckCircleFill className="absolute top-[2px] left-0 mx-[6px] my-[2px] text-blue border-[2px] border-white bg-white rounded-full text-[30px] mb-1" onClick={(e) => (e.preventDefault(), removeFromCart(NFTData))} />
            :
            <AiFillPlusCircle className="cardHoverNFTButton absolute top-[2px] left-0 mx-[6px] my-[2px] text-white text-[30px] mb-1" onClick={(e) => (e.preventDefault(), addToCart())} />)
          // <BsFillCartPlusFill className="cardHoverNFTButton absolute top-[2px] left-0 mx-[6px] my-[2px] text-white text-[28px] mb-1" onClick={(e) => (e.preventDefault(), addToCart())} />)
        }

        {(NFTCollectionStatus == true) && isHovering &&
          <p className="absolute bottom-[-3px] right-0 bg-blue px-[6px] py-[2px] text-white text-[12px] mb-1" style={{ borderRadius: "10px" }}>Verified</p>
        }
        {(NFTCollectionStatus == false) && isHovering &&
          <p className="absolute bottom-[-3px] right-0 bg-[#c3c944] px-[6px] py-[2px] text-black text-[12px] mb-1" style={{ borderRadius: "10px" }}>Not Verified</p>
        }
      </div>
      {(NFTCollectionName || NFTCollectionAddress) &&
        <div className="relative flex" >
          <span className="font-display text-[13px] text-jacarta-700 dark:text-white"
            style={{
              width: "240px",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              display: "flex"
            }}>
            {NFTCollectionName ? NFTCollectionName : (NFTCollectionAddress?.slice(0, 5) + "..." + NFTCollectionAddress?.slice(60))}
            {(NFTCollectionStatus == true) &&
              <MdVerified
                style={{ color: "#4f87ff", marginLeft: "4px" }}
                size={17}
                onMouseOver={() => SetIsHovering(true)}
                onMouseOut={() => SetIsHovering(false)}
              />
            }
            {(NFTCollectionStatus == false) &&
              <BsFillExclamationCircleFill style={{ color: "#c3c944", marginLeft: "4px" }}
                size={16}
                onMouseOver={() => SetIsHovering(true)}
                onMouseOut={() => SetIsHovering(false)}
              />
            }
          </span>
        </div>
      }

      <div className="mt-2 flex items-center justify-between text-start">
        <div
          style={{
            width: "270px",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          <span className="font-display text-base text-jacarta-700 dark:text-white">
            {Name}
          </span>
        </div>
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
        {listedBool && (
          <span className="text-sm font-medium tracking-tight">
            <span className="flex text-sm font-normal tracking-tight text-gray-400">
              Price
            </span>
            <span className="flex text-sm font-medium tracking-tight text-green">
              <Image
                src={venomLogo}
                height={100}
                width={100}
                style={{
                  height: "14px",
                  width: "15px",
                  marginRight: "5px",
                  marginTop: "3px",
                }}
                alt="VenomLogo"
              />
              {listingPrice}
            </span>
          </span>
        )}
        {(signerAddress && Owner) &&
          (listedBool ?
            (((signerAddress === Owner) ?
              <button onClick={(e) => (e.preventDefault(), setSelectedNFT(NFTData), setAnyModalOpen(true), setCancelModal(true))} className="cardHoverNFTButton absolute right-3 bottom-4 bg-[#ea6e39] hover:bg-[#995031] text-white font-bold py-2 px-8 rounded-[10px]">
                Cancel
              </button>
              :
              <button onClick={(e) => (e.preventDefault(), setSelectedNFT(NFTData), setAnyModalOpen(true), setBuyModal(true))} className="cardHoverNFTButton absolute right-3 bottom-4 bg-accent hover:bg-accent-dark text-white font-bold py-2 px-8 rounded-[10px]">
                Buy
              </button>
            ))
            :
            (!listedBool &&
              ((signerAddress === Owner) &&
                <button className="cardHoverNFTButton absolute right-3 bottom-4 bg-accent hover:bg-accent-dark text-white font-bold py-2 px-8 rounded-[10px]">
                  List
                </button>
              )))
        }
        {Description &&
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
        }
      </div>
    </Link>
  );
};

export default NftCard;
