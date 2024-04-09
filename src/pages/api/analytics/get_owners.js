import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import Collection from "../../../Models/Collection";
import NFT from "../../../Models/NFT";
import limiter from "../limiter";
import mongoose from "mongoose";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "GET":
                try {
                    const { collection_id } = req.query;

                    const collection = await Collection.find({ _id: collection_id })
                        .limit(1);

                    try {
                        const nftResult = await NFT.aggregate([
                            {
                                $match: {
                                    NFTCollection: new mongoose.Types.ObjectId(collection_id)
                                }
                            },
                            {
                                $group: {
                                    _id: "$ownerAddress",
                                    count: { $sum: 1 }
                                }
                            },
                            {
                                $sort: { count: -1 }
                            },
                            {
                                $lookup: {
                                    from: "users",
                                    localField: "_id",
                                    foreignField: "wallet_id",
                                    as: "userData"
                                }
                            },
                            {
                                $unwind: {
                                    path: "$userData",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    count: 1,
                                    holdingPercent: { $multiply: [{ $divide: ["$count", collection[0].TotalSupply] }, 100] },
                                    user_name: { $ifNull: ["$userData.user_name", ""] },
                                    profileImage: { $ifNull: ["$userData.profileImage", ""] }
                                }
                            },
                            {
                                $limit: 100
                            }
                        ]);

                        return res.status(200).json({ success: true, data: nftResult });
                    } catch (error) {
                        res.status(400).json({ success: false, data: error.message });
                    }

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
