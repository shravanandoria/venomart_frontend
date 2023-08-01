import axios from "axios";
import { ThirdwebStorage } from "@thirdweb-dev/storage";
const storage = new ThirdwebStorage();

export const create_collection = async (data) => {
  const { coverImage, logo } = data;

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
