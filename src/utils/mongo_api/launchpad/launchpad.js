import axios from "axios";

export const create_launchpad_collection = async (data) => {
  let obj = {
    logo: data.logo,
    coverImage: data.coverImage,
    name: data.name,
    pageName: data.pageName,
    description: data.description,
    contractAddress: data.contractAddress,
    creatorAddress: data.creatorAddress,
    royaltyAddress: data.royaltyAddress,
    royalty: data.royalty,
    socials: [data.website, data.twitter, data.discord, data.telegram],
    isVerified: data.isVerified,
    isTrading: data.isTrading,
    isPropsEnabled: data.isPropsEnabled,
    isFeatured: data.isFeatured,
    maxSupply: data.maxSupply,
    Category: data.Category,
    phases: data.phases
  };

  try {
    const res = await axios({
      url: "/api/launchpad/launchpad",
      method: "POST",
      data: { ...obj },
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const update_launchpad_collection = async (data) => {
  let obj = {
    logo: data.logo,
    coverImage: data.coverImage,
    name: data.name,
    pageName: data.pageName,
    description: data.description,
    contractAddress: data.contractAddress,
    creatorAddress: data.creatorAddress,
    socials: [data.website, data.twitter, data.discord, data.telegram],
    status: data.status,
    phases: data.phases
  };

  try {
    const res = await axios({
      url: "/api/launchpad/launchpad",
      method: "PUT",
      data: { ...obj },
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const get_launchpad_by_name = async (name) => {
  try {
    const res = await axios({
      url: `/api/launchpad/slug_launchpad?name=${name}`,
      method: "GET"
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const get_launchpad_events = async (sortby, skip) => {
  try {
    const res = await axios({
      url: `/api/launchpad/launchpad?sortby=${sortby}&skip=${skip}`,
      method: "GET"
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const get_user_mints = async (contractAddress, signer_address) => {
  try {
    const res = await axios({
      url: `/api/launchpad/user_launch_mints?contractAddress=${contractAddress}&signer_address=${signer_address}`,
      method: "GET"
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const updateLaunchpadStatus = async (pageName, status) => {
  try {
    const res = await axios({
      url: `/api/launchpad/slug_launchpad`,
      method: "PUT",
      data: {
        pageName,
        status
      }
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};
