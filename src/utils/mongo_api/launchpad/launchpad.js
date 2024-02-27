import axios from "axios";

export const create_launchpad_collection = async (data) => {
  console.log({ data })
  let obj = {
    logo: data.logo,
    coverImage: data.coverImage,
    name: data.name,
    description: data.description,
    contractAddress: data.contractAddress,
    creatorAddress: data.creatorAddress,
    royaltyAddress: data.royaltyAddress,
    royalty: data.royalty,
    socials: [data.website, data.twitter, data.discord, data.telegram],
    maxSupply: data.maxSupply,
    jsonURL: data.jsonURL,
    mintPrice: data.mintPrice,
    status: data.status,
    startDate: data.startDate,
    endDate: data.endDate,
    isActive: data.isActive,
    isVerified: data.isVerified,
    isPropsEnabled: data.isPropsEnabled,
    comments: data.comments,
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
