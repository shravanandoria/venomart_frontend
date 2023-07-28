import React from "react";
import { BiLoaderCircle, BiLoaderAlt } from "react-icons/bi";
const Loader = ({ theme }) => {
  return (
    // old loader
    <div className={`absolute h-full w-full flex justify-center items-center ${theme === "dark" ? "bg-jacarta-800" : "bg-white"}`}>
      <BiLoaderAlt className={`h-52 w-[70px] animate-spin ${theme === "dark" ? "text-white" : "text-black"}`} />
    </div>
  );
};

export default Loader;
