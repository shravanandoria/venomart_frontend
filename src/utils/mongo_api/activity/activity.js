import axios from "axios";

export const addActivity = async (data) => {
    try {
        const res = await axios({
            url: `/api/activity/activity`,
            method: "POST",
            data: {
                hash: data.hash,
                from: data.from,
                to: data.to,
                price: data.price,
                type: data.type,
                wallet_id: data.wallet_id,
                nft_address: data.nft_address,
                collection_address: data.collection_address,
            },
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};
