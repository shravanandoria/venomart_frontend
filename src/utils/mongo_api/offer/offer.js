import axios from "axios";

export const getOffers = async (nftId, skip) => {
  try {
    const res = await axios({
      url: `/api/offer/offer?nftId=${nftId}&skip=${skip}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const getOfferWithOfferContract = async offerContract => {
  try {
    const res = await axios({
      url: `/api/offer/offer?offerContract=${offerContract}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const getActiveOffer = async nftId => {
  try {
    const res = await axios({
      url: `/api/offer/get_active_offer?nftId=${nftId}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const existingOffer = async (nftId, signer_address) => {
  try {
    const res = await axios({
      url: `/api/offer/check_offer?nftId=${nftId}&signer_address=${signer_address}`,
      method: "GET",
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};

export const addOffer = async (signer_address, offerPrice, offerContract, OfferExpiration, nftAddress) => {
  try {
    const res = await axios({
      url: `/api/offer/offer`,
      method: "POST",
      data: {
        from: signer_address,
        offerPrice,
        offerContract,
        expiration: OfferExpiration,
        nftAddress,
      },
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
        offerId,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error.message);
  }
};
