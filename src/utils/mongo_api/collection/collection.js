import axios from "axios";
import { check_user } from "../user/user";

export const create_collection = async (data) => {
  const { creatorAddress } = data;
  await check_user(creatorAddress);
  let obj = {
    name: data.name,
    contractAddress: data.contractAddress,
    creatorAddress: data.creatorAddress,
    royaltyAddress: data.royaltyAddress,
    logo: data.logo,
    coverImage: data.coverImage,
    royalty: data.royalty,
    socials: [data.website, data.twitter, data.discord, data.telegram],
    isVerified: data.isVerified,
    isPropsEnabled: data.isPropsEnabled,
    description: data.description,
    Category: data.Category ? data.Category : "",
    TotalSupply: data.TotalSupply ? data.TotalSupply : 0
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
      url: `/api/collection/slug_collection?contractAddress=${contractAddress}`,
      method: "GET"
    });
    return res.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const get_collection_props = async (collection_id) => {
  try {
    const res = await axios({
      url: `/api/collection/get_collection_props?collection_id=${collection_id}`,
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
      url: `/api/collection/nft_onchain_collection?contractAddress=${contractAddress}`,
      method: "GET"
    });
    return res.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const admin_collection_refresh = async (collectionId) => {
  try {
    const res = await axios({
      url: "/api/collection/admin_refresh",
      method: "POST",
      data: {
        collectionId,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const update_collection_information = async (contractAddress, TotalListed, FloorPrice, SalesVolume) => {
  try {
    const res = await axios({
      url: "/api/collection/update_supply",
      method: "PUT",
      data: {
        contractAddress,
        TotalListed,
        FloorPrice,
        SalesVolume
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

export const get_user_collections = async (wallet_id, skip) => {
  try {
    const res = await axios({
      url: `/api/collection/user_collections?wallet_id=${wallet_id}&skip=${skip}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const top_collections = async (category, collection_status, duration) => {
  try {
    const res = await axios({
      url: `/api/collection/top_collections?category=${category}&collection_status=${collection_status}&duration=${duration}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};