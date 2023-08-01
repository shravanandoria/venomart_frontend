import axios from "axios";

export const create_collection = async (data) => {
  console.log(data);
  // try {
  //   const { data } = await axios({
  //     url: "/api/collection",
  //     method: "POST",
  //     data,
  //   });
  //   console.log(data);
  // } catch (error) {
  //   console.log(error.message);
  // }
};

export const get_collection_by_id = async (data) => {
  try {
    const { data } = await axios({
      url: "/api/collection",
      method: "POST",
      data: {
        id: data,
      },
    });
    console.log(data);
  } catch (error) {
    console.log(error.message);
  }
};

export const get_users_collection = async (data) => {
  try {
    const { data } = await axios({
      url: "/api/collection",
      method: "POST",
      data: {
        address: data,
      },
    });
    console.log(data);
  } catch (error) {
    console.log(error.message);
  }
};
