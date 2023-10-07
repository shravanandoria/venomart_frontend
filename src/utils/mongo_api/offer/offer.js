import axios from "axios";

export const getOffers = async (nftId, skip) => {
    try {
        const res = await axios({
            url: `/api/offer/offer?nftId=${nftId}&skip=${skip}`,
            method: "GET"
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};

export const addOffer = async (signer_address, offerPrice, OfferExpiration, nftAddress) => {
    try {
        const res = await axios({
            url: `/api/offer/offer`,
            method: "POST",
            data: {
                from: signer_address,
                offerPrice,
                expiration: OfferExpiration,
                nftAddress
            }
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};

export const updateOffer = async (actionType, offerId) => {
    try {
        const res = await axios({
            url: `/api/offer/offer`,
            method: "PUT",
            data: {
                actionType,
                offerId
            }
        });
        return res.data.data;
    } catch (error) {
        console.log(error.message);
    }
};