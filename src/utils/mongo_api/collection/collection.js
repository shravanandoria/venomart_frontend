import axios from "axios";

import { check_user } from "../user/user";

export const create_collection = async (data) => {
  const { creatorAddress } = data;
  await check_user(creatorAddress);

  try {
    const res = await axios({
      url: "/api/collection/collection",
      method: "POST",
      data: {
        ...data,
        socials: [data.website, data.twitter, data.discord, data.telegram],
      },
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
