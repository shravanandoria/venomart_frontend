import axios from "axios";

export const search = async (query) => {
  try {
    const res = await axios({
      url: `/api/search?query=${query}`,
      method: "GET",
    });

    return res.data.data;
  } catch (error) {}
};

export const search_nfts = async (query) => {
  try {
    const res = await axios({
      url: `/api/search?query=${query}&type=nft`,
      method: "GET",
    });

    return res.data.data;
  } catch (error) {}
};
