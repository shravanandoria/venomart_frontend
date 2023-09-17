import axios from "axios";

export const create_launchpad = async (data) => {
  try {
    const { data } = await axios({
      url: "/api/launchpad",
      method: "POST",
      data,
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const get_launchpad_by_id = async (data) => {
  try {
    const { data } = await axios({
      url: "/api/launchpad",
      method: "GET",
      data,
    });
  } catch (error) {
    console.log(error.message);
  }
};
