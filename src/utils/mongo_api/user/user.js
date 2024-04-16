import axios from "axios";

export const check_user = async (wallet_id) => {
  try {
    const res = await axios({
      url: "/api/user/user",
      method: "POST",
      data: {
        wallet_id,
        user_name: "",
        bio: "",
        email: "",
        profileImage: "",
        coverImage: "",
        isArtist: false,
      },
    });
    return res.data;
  } catch (error) {
    console.log(error.message)
  }
};

export const update_profile = async (data) => {
  try {
    const res = await axios({
      url: "/api/user/user",
      method: "PUT",
      data: {
        wallet_id: data.wallet_id,
        user_name: data.user_name,
        email: data.email,
        bio: data.bio,
        profileImage: data.profileImage,
        coverImage: data.coverImage,
        isArtist: data.isArtist,
        socials: [data.twitter, data.discord, data.customLink],
      },
    });
    return res.data;
  } catch (error) {
    console.log(error.message)
  }
};

export const top_users = async (duration, wallet_id, skip, limit) => {
  try {
    const res = await axios({
      url: `/api/user/top_users`,
      method: "PUT",
      data: {
        duration: duration,
        wallet_id: wallet_id,
        skip: skip,
        limit: limit
      }
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message)
  }
};