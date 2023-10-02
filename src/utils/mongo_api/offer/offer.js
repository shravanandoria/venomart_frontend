import axios from "axios";

export const getOffers = async (nft, skip) => {
    try {
        const res = await axios({
            url: `/api/offer/offer?nft=${nft}&skip=${skip}`,
            method: "GET"
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};

export const addOffer = async (offerId) => {
    try {
        const res = await axios({
            url: `/api/offer/offer`,
            method: "POST",
            data: {
                offerId
            }
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};

export const updateOffer = async (offerId) => {
    try {
        const res = await axios({
            url: `/api/offer/offer`,
            method: "PUT",
            data: {
                offerId
            }
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};