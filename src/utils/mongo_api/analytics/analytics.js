import axios from "axios";

export const get_charts = async (collectionId, duration) => {
    try {
        const res = await axios({
            url: `/api/analytics/getAnalytics?collectionId=${collectionId}&duration=${duration}`,
            method: "GET",
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};