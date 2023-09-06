import axios from "axios";

export const fetch_nfts = async (filterCollection, collectionCategory, minPrice, maxPrice, sortby, option, skip) => {
  try {
    const res = await axios({
      url: `/api/nft/get_all_nfts?filterCollection=${filterCollection}&collectionCategory=${collectionCategory}&minPrice=${minPrice}&maxPrice=${maxPrice}&sortby=${sortby}&option=${option}&skip=${skip}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetch_user_listed_nfts = async (owner_address, skip) => {
  try {
    const res = await axios({
      url: `/api/nft/get_owner_nfts?owner_address=${owner_address}&skip=${skip}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetch_collection_nfts = async (
  collection_address,
  sortby,
  minprice,
  maxprice,
  skip
) => {
  try {
    const res = await axios({
      url: `/api/nft/get_collection_nfts?collection_address=${collection_address}&sortby=${sortby}&minprice=${minprice}&maxprice=${maxprice}&skip=${skip}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const nftInfo = async (nftAddress) => {
  try {
    const res = await axios({
      url: `/api/nft/nft?nft_address=${nftAddress}`,
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
        signer_address: data.signer_address,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const update_verified_nft_data = async (
  OnChainOwner,
  OnChainManager,
  NFTAddress
) => {
  try {
    const res = await axios({
      url: `/api/nft/verify_nft`,
      method: "PUT",
      data: {
        ownerAddress: OnChainOwner,
        managerAddress: OnChainManager,
        NFTAddress: NFTAddress,
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
        new_manager: data.new_manager,
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
    console.log(res.data.data);
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
