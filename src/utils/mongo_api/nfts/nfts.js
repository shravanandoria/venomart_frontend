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
        nft_image: data.imageURL,
        name: data.name,
        description: data.description,
        attributes: JSON.stringify(data.properties),
        NFTCollection: data.NFTCollection,
        signer_address: data.signer_address
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const updateNFTListing = async (data) => {
  try {
    const res = await axios({
      url: `/api/nft/nft`,
      method: "PUT",
      data: {
        NFTAddress: data.NFTAddress,
        isListed: data.isListed,
        price: data.price,
        demandPrice: data.demandPrice,
        new_manager: data.new_manager
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const cancelNFTListing = async (data) => {
  try {
    const res = await axios({
      url: `/api/nft/nft`,
      method: "PUT",
      data: {
        NFTAddress: data.NFTAddress,
        isListed: data.isListed,
        price: data.price,
        demandPrice: data.demandPrice,
        new_manager: data.new_manager,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};


export const updateNFTsale = async (data) => {
  try {
    const res = await axios({
      url: `/api/nft/nft`,
      method: "PUT",
      data: {
        NFTAddress: data.NFTAddress,
        isListed: data.isListed,
        price: data.price,
        demandPrice: data.demandPrice,
        new_owner: data.new_owner,
        new_manager: data.new_manager,
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
