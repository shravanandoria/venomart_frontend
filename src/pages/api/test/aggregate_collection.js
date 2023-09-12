import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import Collection from "../../../Models/Collection";
import Activity from "../../../Models/Activity";
import NFT from "../../../Models/NFT";
import mongoose from "mongoose";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    switch (method) {
        case "POST":
            try {
                const collectionId = "64c9fc94dd5e5ad16c41c7f9"; // Replace with the actual collection ID

                const result = await Activity.aggregate([
                    {
                        $match: {
                            nft_collection: new mongoose.Types.ObjectId(collectionId),
                            $or: [
                                { type: "sale" },
                                { type: "list" } // Filter by type: "sale" or "list"
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "collections", // The name of the Collection model's MongoDB collection
                            localField: "nft_collection",
                            foreignField: "_id",
                            as: "collection"
                        }
                    },
                    {
                        $unwind: "$collection"
                    },
                    {
                        $addFields: {
                            priceAsDouble: { $toDouble: "$price" } // Convert price to double
                        }
                    },
                    {
                        $group: {
                            _id: {
                                // daily 
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" },
                                week: { $week: "$createdAt" },
                                day: { $dayOfMonth: "$createdAt" }

                                // weekly 
                                //  year: { $isoWeekYear: "$createdAt" },
                                // week: { $isoWeek: "$createdAt" }
                            },
                            SalesVolume: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", "sale"] }, // Check if type is "sale"
                                        "$priceAsDouble", // Sum the price if type is "sale"
                                        0 // Otherwise, sum 0 for listings
                                    ]
                                }
                            },
                            TotalSales: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", "sale"] }, // Check if type is "list"
                                        1, // Sum 1 for listings
                                        0 // Otherwise, sum 0 for sales
                                    ]
                                }
                            },
                            TotalListings: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", "list"] }, // Check if type is "list"
                                        1, // Sum 1 for listings
                                        0 // Otherwise, sum 0 for sales
                                    ]
                                }
                            }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
                ]);

                return res.status(200).json({ success: true, data: result });
            } catch (error) {
                res.status(400).json({ success: false, data: error.message });
            }
            break;
    }
}