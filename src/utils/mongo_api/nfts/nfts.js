import axios from "axios";

export const fetch_nfts = async (skip) => {
  try {
    const res = await axios({
      url: `/api/nft/nft?skipNFTs=${skip}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};
export const createNFT = async (data) => {
  try {
    const res = await axios({
      url: `/api/nft/nft`,
      method: "POST",
      data: {
        NFTAddress: data.NFTAddress,
        ownerAddress: data.ownerAddress,
        managerAddress: data.managerAddress,
        imageURL: data.imageURL,
        title: data.title,
        description: data.description,
        properties: data.properties,
        NFTCollection: data.NFTCollection,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const nftInfo = async (nftAddress) => {
  try {
    const res = await axios({
      url: `/api/nft/nft?NFTAddress=${nftAddress}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};
