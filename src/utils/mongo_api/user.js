import axios from "axios";

export const check_user = async (wallet_id) => {
  const res = await axios({
    url: "/api/user",
    method: "POST",
    data: { wallet_id },
  });

  console.log(res.data);
};
