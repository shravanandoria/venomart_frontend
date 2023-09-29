import axios from "axios";

export const getNotification = async (user, skip) => {
    try {
        const res = await axios({
            url: `/api/notification/notification?user=${user}&skip=${skip}`,
            method: "GET"
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        const res = await axios({
            url: `/api/notification/notification`,
            method: "POST",
            data: {
                notificationId
            }
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};