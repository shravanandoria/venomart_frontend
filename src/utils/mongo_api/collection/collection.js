import axios from "axios";

import { check_user } from "../user/user";

export const create_collection = async (data) => {
  const { creatorAddress } = data;
  await check_user(creatorAddress);
  let obj = {
    name: data.name,
    contractAddress: data.contractAddress,
    creatorAddress: data.creatorAddress,
    logo: data.logo,
    coverImage: data.coverImage,
    royalty: data.royalty,
    socials: [data.website, data.twitter, data.discord, data.telegram],
    isVerified: data.isVerified,
    description: data.description,
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

export const get_collection_by_contract = async (contractAddress, skipActivity) => {
  try {
    const res = await axios({
      url: `/api/collection/slug_collection?contractAddress=${contractAddress}&skipActivity=${skipActivity}`,
      method: "GET"
    });
    return res.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const get_collection_if_nft_onchain = async (contractAddress) => {
  try {
    const res = await axios({
      url: "/api/collection/nft_onchain_collection",
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

export const update_collection_supply = async (contractAddress, TotalSupply) => {
  try {
    const res = await axios({
      url: "/api/collection/update_supply",
      method: "POST",
      data: {
        contractAddress,
        TotalSupply
      },
    });
    return res.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const get_collections = async (category, sortby, option, skip) => {
  try {
    const res = await axios({
      url: `/api/collection/collection?category=${category}&sortby=${sortby}&option=${option}&skip=${skip}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};