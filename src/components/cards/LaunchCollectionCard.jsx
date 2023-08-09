import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { MdVerified } from "react-icons/md";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import venomLogo from "../../../public/venom.svg"
import { GoDotFill } from "react-icons/go";


const LaunchCollectionCard = ({
  Cover,
  Logo,
  Name,
  Description,
  mintPrice,
  status,
  CollectionAddress,
  customLink,
  verified,
  startDate,
  endDate
}) => {

  const [isHovering, SetIsHovering] = useState(false);
  const [statusNew, setStatusNew] = useState(status);

  const [startdays, setStartDays] = useState(0);
  const [starthours, setStartHours] = useState(0);
  const [startminutes, setStartMinutes] = useState(0);
  const [startseconds, setStartSeconds] = useState(0);

  const [enddays, setEndDays] = useState(0);
  const [endhours, setEndHours] = useState(0);
  const [endminutes, setEndMinutes] = useState(0);
  const [endseconds, setEndSeconds] = useState(0);

  const statusLive = () => {
    if (status == "Upcoming") {
      const target = new Date(
        `${startDate}`
      );

      const interval = setInterval(() => {
        const now = new Date();
        const difference = target.getTime() - now.getTime();

        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        setStartDays(d);

        const h = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        setStartHours(h);

        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setStartMinutes(m);

        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setStartSeconds(s);

        if (d <= 0 && h <= 0 && m <= 0 && s <= 0) {
          setStatusNew("Live");
          const target = new Date(
            `${endDate}`
          );

          const interval = setInterval(() => {
            const now = new Date();
            const difference = target.getTime() - now.getTime();

            const d = Math.floor(difference / (1000 * 60 * 60 * 24));
            setEndDays(d);

            const h = Math.floor(
              (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            setEndHours(h);

            const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            setEndMinutes(m);

            const s = Math.floor((difference % (1000 * 60)) / 1000);
            setEndSeconds(s);

            if (d <= 0 && h <= 0 && m <= 0 && s <= 0) {
              setStatusNew("Sold Out");
            }
          }, 1000);
          return () => clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }

  useEffect(() => {
    statusLive();
  }, [])

  return (
    <Link href={`/launchpad/${customLink ? customLink : CollectionAddress}`}>
      <div className="relative rounded-2.5xl border border-jacarta-100 bg-white p-[1.1875rem] transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700 h-[450px] w-[320px] overflow-hidden  m-4 sm:m-8">

        <div
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
          <span className="absolute bottom-[-25px] right-[100px]">
            <Image
              // src={Logo?.replace("ipfs://", "https://ipfs.io/ipfs/")}
              src={Logo}
              alt="Logo"
              className="h-[80px] w-[80px] rounded-[100%] border b-4 border-black shadow-lg"
              loading="lazy"
              height={100}
              width={100}
            />
          </span>
        </div>

        <div className="relative flex justify-center align-middle text-center">
          <div
            className="mt-8 font-display text-[22px] text-center text-jacarta-700 hover:text-accent dark:text-white "
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

        <div className="mt-2 flex items-center justify-center text-sm font-medium tracking-tight">
          <div className="flex flex-wrap justify-center items-center">
            <span className="textDotStyle mr-1 mt-1 dark:text-jacarta-400">
              {Description}
            </span>
          </div>
        </div>

        {statusNew == "Live" && (
          <div className="px-4 pt-4">
            <h2 className="text-[12px] title-font font-bold text-gray-400 tracking-widest text-center">
              MINT ENDS IN
            </h2>
            <div className="text-[4px] text-jacarta-700 dark:text-white title-font font-medium mb-1">
              <div className="show-counter">
                <div className="countdown-link text-jacarta-400 dark:text-jacarta-200">
                  <div className="countdown">
                    <p style={{ fontSize: "13px" }}>{enddays}</p>
                    <span style={{ fontSize: "9px" }}>Days</span>
                  </div>
                  <p>:</p>
                  <div className="countdown">
                    <p style={{ fontSize: "13px" }}>{endhours}</p>
                    <span style={{ fontSize: "9px" }}>Hours</span>
                  </div>
                  <p>:</p>
                  <div className="countdown">
                    <p style={{ fontSize: "13px" }}>{endminutes}</p>
                    <span style={{ fontSize: "9px" }}>Mins</span>
                  </div>
                  <p>:</p>
                  <div className="countdown">
                    <p style={{ fontSize: "13px" }}>{endseconds}</p>
                    <span style={{ fontSize: "9px" }}>Seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {statusNew == "Upcoming" && (
          <div className="px-4 pt-4">
            <h2 className="text-[12px] title-font font-bold text-gray-400 tracking-wides text-center ">
              MINT STARTS IN
            </h2>
            <div className="text-[4px] text-jacarta-700 dark:text-white title-font font-medium mb-1">
              <div className="show-counter">
                <div className="countdown-link text-jacarta-400 dark:text-jacarta-200">
                  <div className="countdown">
                    <p style={{ fontSize: "13px" }}>{startdays}</p>
                    <span style={{ fontSize: "9px" }}>Days</span>
                  </div>
                  <p>:</p>
                  <div className="countdown">
                    <p style={{ fontSize: "13px" }}>{starthours}</p>
                    <span style={{ fontSize: "9px" }}>Hours</span>
                  </div>
                  <p>:</p>
                  <div className="countdown">
                    <p style={{ fontSize: "13px" }}>{startminutes}</p>
                    <span style={{ fontSize: "9px" }}>Mins</span>
                  </div>
                  <p>:</p>
                  <div className="countdown">
                    <p style={{ fontSize: "13px" }}>{startseconds}</p>
                    <span style={{ fontSize: "9px" }}>Seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* sold out */}
        {statusNew == "Sold Out" && (
          <div className="px-4 py-4">
            <h2 className="text-[12px] title-font text-gray-400 tracking-widest text-center">
              SOLD OUT IN
            </h2>
            <h1 className="text-[18px] py-2 text-jacarta-700 dark:text-white title-font font-medium mb-1" style={{ textAlign: "center" }}>
              FEW HOURS{" "}
            </h1>
          </div>
        )}

        {/* ended */}
        {statusNew == "Ended" && (
          <div className="px-4 py-4">
            <h2 className="text-[12px] title-font text-gray-400 tracking-widest text-center">
              SOLD OUT IN
            </h2>
            <h1 className="text-[18px] py-2 text-jacarta-700 dark:text-white title-font font-medium mb-1" style={{ textAlign: "center" }}>
              FEW HOURS{" "}
            </h1>
          </div>
        )}

        <div className="flex justify-between align-middle mx-2">
          {statusNew == "Live" &&
            <button className="flex align-middle justify-center dark:text-jacarta-200 font-bold py-2 px-6 rounded-full text-jacarta-700">
              <GoDotFill className="h-[19px] w-[19px] mt-1 text-green" />
              <span className="text-green">{statusNew}</span>
            </button>
          }
          {statusNew == "Upcoming" &&
            <button className="flex align-middle justify-center dark:text-jacarta-200 font-bold py-2 px-6 rounded-full text-jacarta-700">
              <GoDotFill className="h-[19px] w-[19px] mt-1 text-[#2fa8b5]" />
              <span className="text-[#2fa8b5]">{statusNew}</span>
            </button>
          }
          {statusNew == "Sold Out" &&
            <button className="flex align-middle justify-center dark:text-jacarta-200 font-bold py-2 px-6 rounded-full text-jacarta-700">
              <GoDotFill className="h-[19px] w-[19px] mt-1 text-jacarta-300" />
              <span className="text-jacarta-300">{statusNew}</span>
            </button>
          }
          {statusNew == "Ended" &&
            <button className="flex align-middle justify-center dark:text-jacarta-200 font-bold py-2 px-6 rounded-full text-jacarta-700">
              <GoDotFill className="h-[19px] w-[19px] mt-1 text-red" />
              <span className="text-red">{statusNew}</span>
            </button>
          }
          <div className="flex border border-jacarta-100 dark:border-jacarta-600 dark:text-jacarta-200 font-bold py-2 px-6 rounded-full text-jacarta-700">
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
              alt="Venomart | NFT Marketplace"
            />
          </div>
        </div>
      </div >
    </Link>
  );
};

export default LaunchCollectionCard;
