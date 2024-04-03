import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BsFillCartPlusFill, BsFillCheckCircleFill, BsFillExclamationCircleFill } from "react-icons/bs";
import { MdVerified } from "react-icons/md";
import venomLogo from "../../../public/venomBG.webp";
import { AiFillPlusCircle } from "react-icons/ai";
import numeral from 'numeral';
import { MARKETPLACE_ADDRESS } from "../../utils/user_nft";


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
  Description,
  rank,
  NFTImagesBaseURI
}) => {
  const [isHovering, SetIsHovering] = useState(false);

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

  const addToCart = () => {
    if (cartNFTs.length < 15 && !cartNFTs.some((item) => item._id === NFTData._id)) {
      setCartNFTs([...cartNFTs, NFTData]);
    } else {
      alert("Cannot add more than 15 NFTs to the cart!");
    }
  };

  const removeFromCart = (itemToRemove) => {
    const updatedCartNFTs = cartNFTs.filter((item) => item._id !== itemToRemove._id);
    setCartNFTs(updatedCartNFTs);
  };

  return (
    <Link href={`/nft/${Address}`} className="cardHoverNFT hover:bg-gray-50 relative block rounded-2.5xl border border-jacarta-100 bg-white p-[1.1875rem] transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700 overflow-hidden m-2 w-[300px]">
      <div className="ImageHoverEffect relative mb-4">
        {ImageSrc?.includes(".mp4") ?
          <video
            autoPlay="autoplay"
            loop={true}
            className="max-h-[220px] w-[100%] object-cover"
          >
            <source src={ImageSrc} type="video/mp4"></source>
          </video>
          :
          <Image
            src={ImageSrc?.replace("https://ipfs.io/ipfs/", NFTImagesBaseURI)}
            height={100}
            width={100}
            placeholder="blur"
            blurDataURL="data:..."
            loading='lazy'
            alt="nftItem"
            className="ImageInEffect h-[220px] w-full rounded-[0.625rem]"
          />
        }

        {(listedBool && signerAddress != Owner && NFTData?.managerAddress != MARKETPLACE_ADDRESS) &&
          (cartNFTs.some((item) => item._id === NFTData._id) ?
            <BsFillCheckCircleFill className="absolute top-[2px] left-0 mx-[6px] my-[2px] text-blue border-[2px] border-white bg-white rounded-full text-[30px] mb-1" onClick={(e) => (e.preventDefault(), removeFromCart(NFTData))} />
            :
            // <AiFillPlusCircle className="cardHoverNFTButton absolute top-[2px] left-0 mx-[6px] my-[2px] text-white text-[30px] mb-1" onClick={(e) => (e.preventDefault(), addToCart())} />)
            <BsFillCartPlusFill className="cardHoverNFTButton absolute top-[2px] left-0 mx-[6px] my-[2px] text-white text-[28px] mb-1" onClick={(e) => (e.preventDefault(), addToCart())} />
          )
        }

        {rank &&
          <p className={`absolute bottom-[-4px] right-0 ${rank < 100 && "bg-[#d1d102]" || ((rank >= 100 && rank < 250) && "bg-[#8402db]") || ((rank >= 250 && rank < 500) && "bg-[#55c902]") || ((rank >= 500) && "bg-[#9e9e9e]")} px-[12px] py-[4px] text-white text-[12px] mb-1`} style={{ borderRadius: "10px" }}>Rank {rank}</p>
        }
        {(NFTCollectionStatus == true) && isHovering &&
          <p className="absolute bottom-[-4px] right-0 bg-blue px-[20px] py-[4px] text-white text-[12px] mb-1" style={{ borderRadius: "10px" }}>Verified</p>
        }
        {(NFTCollectionStatus == false) && isHovering &&
          <p className="absolute bottom-[-4px] right-0 bg-[#c3c944] px-[14px] py-[4px] text-black text-[12px] mb-1" style={{ borderRadius: "10px" }}>Not Verified</p>
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
      <div className="mt-2 text-sm flex justify-between">
        {listedBool ?
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
              {
                listingPrice != 0 || listingPrice != "0" ?
                  <div>
                    {formatNumberShort(listingPrice)}
                  </div>
                  :
                  <div>
                    {formatNumberShort(NFTData?.demandPrice)}
                  </div>
              }
            </span>
          </span>
          :
          !Description &&
          (<span className="text-sm font-medium tracking-tight">
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
              Unlisted
            </span>
          </span>)
        }
        {/* {listedBool &&
          <span className="cardHoverNFTOfferNone text-sm font-medium tracking-tight">
            <span className="flex text-sm font-normal tracking-tight text-gray-400">
              Best Offer
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
              {formatNumberShort(listingPrice)}
            </span>
          </span>
        } */}
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
              ((signerAddress === Owner) ?
                <button className="cardHoverNFTButton absolute right-3 bottom-4 bg-accent hover:bg-accent-dark text-white font-bold py-2 px-8 rounded-[10px]">
                  List
                </button>
                :
                <button className="cardHoverNFTButton absolute right-3 bottom-4 bg-accent hover:bg-accent-dark text-white font-bold py-2 px-8 rounded-[10px]">
                  Make Offer
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
