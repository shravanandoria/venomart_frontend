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

    console.log({ user: res.data });

    return res.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const update_profile = async (data) => {
  let coverImg;
  let profileImg;

  if (typeof data.coverImage === "object") {
    coverImg = await storage?.upload(data.coverImage);
  }
  if (typeof data.profileImage === "object") {
    profileImg = await storage?.upload(data.profileImage);
  }

  const res = await axios({
    url: "/api/user/user",
    method: "PUT",
    data: {
      wallet_id: data.wallet_id,
      user_name: data.user_name,
      email: data.email,
      bio: data.bio,
      profileImage: profileImg ? profileImg : data.profileImage,
      coverImage: coverImg ? coverImg : data.coverImage,
      isArtist: data.isArtist,
      socials: [data.twitter, data.discord, data.customLink],
    },
  });

  return res.data;
};

export const user_info = async (wallet_id) => {
  try {
    const { data } = await axios({
      url: "/api/user/user_info",
      method: "POST",
      data: { wallet_id },
    });
    console.log(data);
    return data;
  } catch (error) {
    console.log(error.message);
  }
};
