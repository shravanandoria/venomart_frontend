import axios from "axios";

export const getActivity = async (user_id, user_wallet, collection_id, nft_id, activityType, skip) => {
    try {
        const res = await axios({
            url: `/api/activity/activity?user_id=${user_id}&user_wallet=${user_wallet}&collection_id=${collection_id}&nft_id=${nft_id}&activityType=${activityType}&skip=${skip}`,
            method: "GET"
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};

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
                stampedFloor: data.stampedFloor,
                type: data.type,
                wallet_id: data.wallet_id,
                nft_address: data.nft_address,
                collection_address: data.collection_address,
                newFloorPrice: data.newFloorPrice
            },
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};
