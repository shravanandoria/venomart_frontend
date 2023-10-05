import axios from "axios";

export const search = async (query) => {
  try {
    const res = await axios({
      url: `/api/search?query=${query}`,
      method: "GET",
    });

    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const search_user_nfts = async (query, user_address) => {
  try {
    const res = await axios({
      url: `/api/search?query=${query}&type=user&user_address=${user_address}`,
      method: "GET",
    });

    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const search_nfts = async (query, collection_id) => {
  try {
    const res = await axios({
      url: `/api/search?query=${query}&type=nft&collection_id=${collection_id}`,
      method: "GET",
    });

    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const search_collections = async (query) => {
  try {
    const res = await axios({
      url: `/api/search?query=${query}&type=collection`,
      method: "GET",
    });

    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};
