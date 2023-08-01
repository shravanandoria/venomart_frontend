import axios from "axios";
import { ThirdwebStorage } from "@thirdweb-dev/storage";
const storage = new ThirdwebStorage();

export const check_user = async (wallet_id) => {
  const res = await axios({
    url: "/api/user",
    method: "POST",
    data: { wallet_id },
  });

  return res.data;
};

export const update_profile = async (data) => {
  const profile_img = data?.profileImage
    ? await storage.upload(data.profileImage)
    : data.profileImage;

  const cover_img = data?.coverImage
    ? await storage.upload(data.coverImage)
    : data.coverImage;

  const res = await axios({
    url: `/api/user`,
    method: "PUT",
    data: {
      wallet_id: data.walletAddress,
      user_name: data.user_name,
      email: data.email,
      bio: data.bio,
      profileImage: profile_img,
      coverImage: cover_img,
      isArtist: data.isArtist,
      socials: [data.twitter, data.discord, data.customLink],
    },
  });
  console.log(res.data);
};
