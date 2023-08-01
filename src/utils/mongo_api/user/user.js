import axios from "axios";
import { ThirdwebStorage } from "@thirdweb-dev/storage";
const storage = new ThirdwebStorage();

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

    console.log(res.data);

    return res.data;
  } catch (error) {
    console.log(error.message);
    alert(error.message);
  }
};

export const update_profile = async (data) => {
  const profile_img = data?.profileImage
    ? await storage.upload(data.profileImage)
    : data.profileImage;

  const cover_img = data?.coverImage
    ? await storage.upload(data.coverImage)
    : data.coverImage;

  const res = await axios({
    url: "/api/user/user",
    method: "PUT",
    data: {
      wallet_id: data.wallet_id,
      user_name: data.user_name,
      email: data.email,
      bio: data.bio,
      profileImage: profile_img,
      coverImage: cover_img,
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
