import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import NFT from "../../../Models/NFT";
import Offer from "../../../Models/Offer";
import Notification from "../../../Models/Notification";
import limiter from "../limiter";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "GET":
                try {
                    const { nftId, skip } = req.query;

                    const offers = await Offer.find({ nft: nftId }).skip(skip)
                        .limit(15)
                        .sort({ createdAt: -1 });

                    const offersWithUserInfo = [];
                    for (const offer of offers) {
                        const fromUser = await User.findOne({ wallet_id: offer.from });
                        if (fromUser) {
                            offersWithUserInfo.push({
                                ...offer.toObject(),
                                fromUser: fromUser.user_name,
                            });
                        }
                    }

                    return res.status(200).json({ success: true, data: offersWithUserInfo });
                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
                break;
            case "POST":
                try {
                    const { from, offerPrice, offerContract, expiration, nftAddress } = req.body;

                    let nft = await NFT.findOne({ NFTAddress: nftAddress });
                    if (!nft)
                        return res
                            .status(400)
                            .json({ success: false, data: "Cannot Find the NFT" });

                    const find_offer = await Offer.findOne({ offerContract });
                    if (find_offer) {
                        return res.status(200).json({ success: true, data: "an offer with the contract address already exists!" });
                    }

                    let makeOffer = await Offer.create({
                        chain: "Venom",
                        from,
                        offerContract,
                        offerPrice,
                        nft,
                        status: "active",
                        expiration
                    })

                    // sending notification
                    let notification = await Notification.create({
                        chain: "Venom",
                        user: from,
                        soldTo: nft?.ownerAddress,
                        price: offerPrice,
                        hash: "undefined",
                        hasReaded: false,
                        nft,
                        type: "offer"
                    });

                    return res.status(200).json({ success: true, data: "Successfully created an offer" });
                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
                break;
            case "PUT":
                try {
                    const { actionType, offerId } = req.body;

                    let offer;
                    if (actionType == "cancelled") {
                        offer = await Offer.findOne({ _id: offerId });
                        if (!offer)
                            return res
                                .status(400)
                                .json({ success: false, data: "Cannot Find This Offer" });

                        offer.status = "cancelled";
                        await offer.save();
                    }

                    if (actionType == "accepted") {
                        offer = await Offer.findOne({ _id: offerId });
                        if (!offer)
                            return res
                                .status(400)
                                .json({ success: false, data: "Cannot Find This Offer" });

                        offer.status = "accepted";
                        await offer.save();
                    }

                    if (actionType == "outbidded") {
                        offer = await Offer.findOne({ _id: offerId });
                        if (!offer)
                            return res
                                .status(400)
                                .json({ success: false, data: "Cannot Find This Offer" });

                        offer.status = "outbidded";
                        await offer.save();
                    }

                    return res.status(200).json({ success: true, data: "Successfully updated Offer" });
                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
                break;
            default:
                res.status(400).json({ success: false });
                break;
        }
    });
}
