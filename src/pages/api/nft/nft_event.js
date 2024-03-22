import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import NFT from "../../../Models/NFT";
import Activity from "../../../Models/Activity";
import Collection from "../../../Models/Collection";
import Offer from "../../../Models/Offer";
import limiter from "../limiter";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "PUT":
                try {
                    const {
                        NFTAddress,
                        isListed,
                        price,
                        demandPrice,
                        new_manager,
                        new_owner,
                    } = req.body;

                    let nft = await NFT.findOne({ NFTAddress });

                    if (!nft)
                        return res
                            .status(400)
                            .json({ success: false, data: "Cannot Find This NFT" });

                    if (new_owner !== undefined) {
                        let user = await User.findOne({ wallet_id: new_owner });
                        if (!user) {
                            user = await User.create({ wallet_id: new_owner });
                        }
                    }

                    nft.isListed = isListed;
                    nft.listingPrice = price;
                    nft.demandPrice = demandPrice;
                    nft.managerAddress = new_manager;
                    if (new_owner !== undefined) {
                        nft.ownerAddress = new_owner;
                    }
                    await nft.save();

                    return res.status(200).json({ success: true, data: "Successfully updated NFT" });
                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
            default:
                res.status(400).json({ success: false });
                break;
        }
    });
}
