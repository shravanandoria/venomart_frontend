import axios from "axios";
import { useStorage } from "@thirdweb-dev/react";

import { check_user } from "../user/user";

export const create_collection = async (data) => {
  
  const storage = new useStorage();

  const { coverImage, logo, creatorAddress } = data;
  await check_user(creatorAddress);
  const ipfs_logo = await storage.upload(logo);
  const ipfs_coverImage = await storage.upload(coverImage);
  let obj = {
    ...data,
    coverImage: ipfs_coverImage,
    logo: ipfs_logo,
  };
  try {
    const res = await axios({
      url: "/api/collection/collection",
      method: "POST",
      data: { ...obj },
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const get_collection_by_contract = async (contractAddress) => {
  try {
    const res = await axios({
      url: "/api/collection/slug_collection",
      method: "POST",
      data: {
        contractAddress,
      },
    });
    return res.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const get_collections = async () => {
  try {
    const res = await axios({
      url: "/api/collection/collection",
      method: "GET",
    });

    return res.data;
  } catch (error) {
    console.log(error.message);
  }
};
