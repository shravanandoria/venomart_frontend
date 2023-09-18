import dbConnect from "../../../lib/dbConnect";
import mongoose from "mongoose";
import Activity from "../../../Models/Activity";
import Collection from "../../../Models/Collection";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    switch (method) {
        case "POST":
            try {
                const { collectionId } = req.body;

                const result = await Activity.aggregate([
                    {
                        $match: {
                            nft_collection: new mongoose.Types.ObjectId(collectionId),
                            $or: [
                                { type: "sale" },
                                { type: "list" },
                                { type: "cancel" },
                            ]
                        }
                    },
                    {
                        $addFields: {
                            priceAsDouble: { $toDouble: "$price" }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            SalesVolume: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", "sale"] },
                                        "$priceAsDouble",
                                        0
                                    ]
                                }
                            },
                            IgnoreOverallListings: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", "list"] },
                                        1,
                                        0
                                    ]
                                }
                            },
                            IgnoreTotalSales: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", "sale"] },
                                        1,
                                        0
                                    ]
                                }
                            },
                            IgnoreTotalCancels: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", "cancel"] },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            TotalListed: {
                                $subtract: ["$IgnoreOverallListings", { $add: ["$IgnoreTotalSales", "$IgnoreTotalCancels"] }]
                            }
                        }
                    }
                ]);
                const totals = result[0];

                return res.status(200).json({ success: true, data: totals });
            } catch (error) {
                res.status(400).json({ success: false, data: error.message });
            }
            break;
    }
}
