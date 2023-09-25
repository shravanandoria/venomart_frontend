import dbConnect from "../../../lib/dbConnect";
import Collection from "../../../Models/Collection";
import Activity from "../../../Models/Activity";
import mongoose from "mongoose";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    switch (method) {
        case "GET":
            try {
                const { collectionId, duration } = req.query;

                let _id = {};
                let limit = 2;

                if (duration) {
                    if (duration == "1day") {
                        _id.year = { $year: "$createdAt" }
                        _id.month = { $month: "$createdAt" }
                        _id.day = { $dayOfMonth: "$createdAt" }
                        _id.interval = {
                            $floor: {
                                $divide: [
                                    { $hour: "$createdAt" },
                                    3
                                ]
                            }
                        }
                        limit = 8
                    }
                    if (duration == "7days") {
                        _id.year = { $year: "$createdAt" }
                        _id.month = { $month: "$createdAt" }
                        _id.week = { $week: "$createdAt" }
                        _id.day = { $dayOfMonth: "$createdAt" }
                        limit = 7
                    }
                    if (duration == "30days") {
                        _id.year = { $year: "$createdAt" }
                        _id.month = { $month: "$createdAt" }
                        _id.week = { $week: "$createdAt" }
                        _id.day = { $dayOfMonth: "$createdAt" }
                        limit = 30
                    }
                    if (duration == "6months") {
                        _id.year = { $isoWeekYear: "$createdAt" }
                        _id.week = { $isoWeek: "$createdAt" }
                        limit = 6
                    }
                    if (duration == "1year") {
                        _id.year = { $year: "$createdAt" }
                        _id.week = { $isoWeek: "$createdAt" }
                        limit = 53
                    }
                    if (duration == "alltime") {
                        _id.year = { $year: "$createdAt" }
                        _id.month = { $month: "$createdAt" }
                        limit = 25
                    }
                }

                const result = await Activity.aggregate([
                    {
                        $match: {
                            nft_collection: new mongoose.Types.ObjectId(collectionId),
                            $or: [
                                { type: "sale" },
                                { type: "list" }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "collections",
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
                            priceAsDouble: { $toDouble: "$price" },
                            totalSupply: "$collection.TotalSupply",
                            timestamp: { $toDate: "$createdAt" }
                        }
                    },
                    {
                        $group: {
                            _id,
                            SalesVolume: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", "sale"] },
                                        "$priceAsDouble",
                                        0
                                    ]
                                }
                            },
                            TotalSales: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", "sale"] },
                                        1,
                                        0
                                    ]
                                }
                            },
                            TotalListings: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", "list"] },
                                        1,
                                        0
                                    ]
                                }
                            },
                            floorPrice: { $min: "$priceAsDouble" },
                            // floorPrice: { $min: "$stampedFloor" },
                            TotalSupply: { $sum: "$totalSupply" },
                            Time: { $max: "$timestamp" }
                        }
                    },
                    {
                        $set: {
                            marketCap: {
                                $multiply: ["$TotalSupply", "$floorPrice"]
                            }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": -1, "_id.week": -1, "_id.day": -1, "_id.interval": -1 } },
                    {
                        $limit: limit
                    }
                ]);


                return res.status(200).json({ success: true, data: result });
            } catch (error) {
                res.status(400).json({ success: false, data: error.message });
            }
            break;
    }
}