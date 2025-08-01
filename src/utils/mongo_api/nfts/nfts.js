import axios from "axios";

export const fetch_nfts = async (
  filterCollection,
  signer_address,
  collectionCategory,
  minPrice,
  maxPrice,
  sortby,
  option,
  NSFW,
  skip
) => {
  try {
    const res = await axios({
      url: `/api/nft/get_all_nfts?filterCollection=${filterCollection}&ownerAddress=${signer_address}&collectionCategory=${collectionCategory}&minPrice=${minPrice}&maxPrice=${maxPrice}&sortby=${sortby}&option=${option}&NSFW=${NSFW}&skip=${skip}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetch_only_collection_nfts = async (
  collection_id
) => {
  try {
    const res = await axios({
      url: `/api/nft/get_collection_nfts_count?collection_id=${collection_id}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetch_user_listed_nfts = async (filterCollection, owner_address, saleType, sortby, minprice, maxprice, skip) => {
  try {
    const res = await axios({
      url: `/api/nft/get_owner_nfts?filterCollection=${filterCollection}&owner_address=${owner_address}&saleType=${saleType}&sortby=${sortby}&minprice=${minprice}&maxprice=${maxprice}&skip=${skip}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const no_limit_fetch_nfts = async (owner_address) => {
  try {
    const res = await axios({
      url: `/api/nft/no_limit_fetch?owner_address=${owner_address}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetch_collection_nfts = async (
  collection_address,
  signer_address,
  saleType,
  sortby,
  propsFilter,
  minprice,
  maxprice,
  skip
) => {
  const encodedPropsFilter = encodeURIComponent(JSON.stringify(propsFilter));
  try {
    const res = await axios({
      url: `/api/nft/get_collection_nfts?collection_address=${collection_address}&owner_address=${signer_address}&saleType=${saleType}&sortby=${sortby}&propsFilter=${encodedPropsFilter}&minprice=${minprice}&maxprice=${maxprice}&skip=${skip}`,
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
        nft_metadata: data.metadata,
        name: data.name,
        description: data.description,
        attributes: data.properties,
        NFTCollection: data.NFTCollection,
        signer_address: data.signer_address,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const addNFTViaOnchainRoll = async (data, attributes, signer_address, NFTCollection) => {
  try {
    const res = await axios({
      url: `/api/nft/nft`,
      method: "POST",
      data: {
        NFTAddress: data.nftAddress,
        ownerAddress: data.owner,
        managerAddress: data.manager,
        nft_image: data?.preview?.source,
        nft_metadata: data?.files[0]?.source,
        name: data.name,
        description: data.description,
        attributes: attributes ? attributes : data.attributes,
        NFTCollection: NFTCollection,
        signer_address: signer_address,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const updateNFTViaOnchainRoll = async (data, attributes) => {
  try {
    const res = await axios({
      url: `/api/nft/update_nft_roll`,
      method: "PUT",
      data: {
        NFTAddress: data.nftAddress,
        ownerAddress: data.owner,
        managerAddress: data.manager,
        nft_image: data?.preview?.source,
        nft_metadata: data?.files[0]?.source,
        name: data.name,
        description: data.description,
        attributes: attributes ? attributes : data.attributes
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const refreshNFTsViaOnchainRollProfile = async (NFTAddress, ownerAddress, managerAddress, onChainDemandPrice) => {
  try {
    const res = await axios({
      url: `/api/nft/no_limit_fetch`,
      method: "PUT",
      data: {
        NFTAddress: NFTAddress,
        ownerAddress: ownerAddress,
        managerAddress: managerAddress,
        onChainDemandPrice: onChainDemandPrice
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const addNFTViaOnchainLaunchpad = async (data, attributes, signer_address, NFTCollection) => {
  try {
    const res = await axios({
      url: `/api/nft/nft`,
      method: "POST",
      data: {
        NFTAddress: data.nft._address,
        ownerAddress: data.owner._address,
        managerAddress: data.manager._address,
        nft_image: data?.preview?.source,
        nft_metadata: data?.files[0]?.source,
        name: data.name,
        description: data.description,
        attributes: attributes,
        NFTCollection: NFTCollection,
        signer_address: signer_address,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const refreshUserNFTs = async (data, nftName, nftDesc, nftImage, jsonURL, attributes, signer_address) => {
  try {
    const res = await axios({
      url: `/api/nft/nft`,
      method: "POST",
      data: {
        NFTAddress: data.nft._address,
        ownerAddress: data.owner._address,
        managerAddress: data.manager._address,
        nft_image: nftImage,
        nft_metadata: jsonURL,
        name: nftName,
        description: nftDesc,
        attributes: attributes,
        NFTCollection: data.collection._address,
        signer_address: signer_address,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const update_verified_nft_image = async (
  onChainImage,
  NFTAddress
) => {
  try {
    const res = await axios({
      url: `/api/nft/update_nft_image`,
      method: "PUT",
      data: {
        nft_image: onChainImage,
        NFTAddress: NFTAddress,
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

export const update_verified_nft_props = async (
  extractedProps,
  NFTAddress
) => {
  try {
    const res = await axios({
      url: `/api/nft/update_nft_props`,
      method: "PUT",
      data: {
        attributes: extractedProps,
        NFTAddress: NFTAddress,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const update_verified_nft_listing = async (
  demandPrice,
  listingPrice,
  NFTAddress
) => {
  try {
    const res = await axios({
      url: `/api/nft/update_nft_listing`,
      method: "PUT",
      data: {
        demandPrice: parseFloat(demandPrice),
        listingPrice: listingPrice,
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
    const res2 = await axios({
      url: `/api/activity/activity`,
      method: "POST",
      data: {
        hash: data.hash,
        from: data.from,
        to: data.to,
        price: data.price,
        type: data.type,
        wallet_id: data.wallet_id,
        nft_address: data.nft_address,
        collection_address: data.collection_address
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

    const res2 = await axios({
      url: `/api/activity/activity`,
      method: "POST",
      data: {
        hash: data.hash,
        from: data.from,
        to: data.to,
        price: data.saleprice,
        type: data.type,
        wallet_id: data.wallet_id,
        nft_address: data.nft_address,
        collection_address: data.collection_address
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

    const res2 = await axios({
      url: `/api/activity/activity`,
      method: "POST",
      data: {
        hash: data.hash,
        from: data.from,
        to: data.to,
        price: data.saleprice,
        type: data.type,
        wallet_id: data.wallet_id,
        nft_address: data.nft_address,
        collection_address: data.collection_address
      },
    });

    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const updateNFTSaleBulk = async (data) => {
  try {
    const res = await axios({
      url: `/api/nft/cart_nfts`,
      method: "PUT",
      data: {
        NFTAddresses: data.NFTAddresses,
        NFTCollections: data.NFTCollections,
        NFTPrices: data.NFTPrices,
        ownerAddresses: data.ownerAddresses,
        managerAddresses: data.managerAddresses,
        signer_address: data.signer_address,
        hash: data.hash,
      },
    });

    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};
