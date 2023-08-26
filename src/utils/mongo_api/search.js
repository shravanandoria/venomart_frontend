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

export const search_nfts = async (query, page) => {
  try {
    const res = await axios({
      url: `/api/search?query=${query}&type=nft&page=${page}`,
      method: "GET",
    });

    return res.data.data;
  } catch (error) {}
};

export const search_collections = async (query, page) => {
  try {
    const res = await axios({
      url: `/api/search?query=${query}&type=collection&page=${page}`,
      method: "GET",
    });

    return res.data.data;
  } catch (error) {}
};
