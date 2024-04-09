import axios from "axios";

export const get_charts = async (collectionId, duration) => {
    try {
        const res = await axios({
            url: `/api/analytics/get_analytics?collectionId=${collectionId}&duration=${duration}`,
            method: "GET",
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};

export const get_holders_data = async (collectionId) => {
    try {
        const res = await axios({
            url: `/api/analytics/get_owners?collection_id=${collectionId}`,
            method: "GET",
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};