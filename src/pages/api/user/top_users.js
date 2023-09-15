import dbConnect from "../../../lib/dbConnect";
import Activity from "../../../Models/Activity";
import User from "../../../Models/User";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    switch (method) {
        case "GET":
            try {
                const { duration } = req.query;

                const saleResult = await Activity.aggregate([
                    {
                        $match: {
                            type: "sale"
                        }
                    },
                    {
                        $addFields: {
                            priceNumeric: { $toDouble: "$price" }
                        }
                    },
                    {
                        $group: {
                            _id: "$from",
                            totalSaleVolume: { $sum: "$priceNumeric" },
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id",
                            foreignField: "wallet_id",
                            as: "user_info"
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            totalSaleVolume: 1,
                            user_name: { $arrayElemAt: ["$user_info.user_name", 0] },
                            profileImage: { $arrayElemAt: ["$user_info.profileImage", 0] }
                        }
                    },
                    {
                        $sort: {
                            totalSaleVolume: -1
                        }
                    },
                    {
                        $limit: 10
                    }
                ]);

                const ids = saleResult.map(item => item._id);

                const purchaseResult = await Activity.aggregate([
                    {
                        $match: {
                            type: "sale",
                            to: { $in: ids }
                        }
                    },
                    {
                        $addFields: {
                            priceNumeric: { $toDouble: "$price" }
                        }
                    },
                    {
                        $group: {
                            _id: "$to",
                            totalPurchaseVolume: { $sum: "$priceNumeric" },
                        }
                    }
                ]);

                const totalListingsResult = await Activity.aggregate([
                    {
                        $match: {
                            type: "list",
                            from: { $in: ids }
                        }
                    },
                    {
                        $group: {
                            _id: "$from",
                            totalListings: { $sum: 1 }
                        }
                    }
                ]);

                const totalSalesResult = await Activity.aggregate([
                    {
                        $match: {
                            type: "sale",
                            from: { $in: ids }
                        }
                    },
                    {
                        $group: {
                            _id: "$from",
                            totalSales: { $sum: 1 }
                        }
                    }
                ]);

                const totalCancelsResult = await Activity.aggregate([
                    {
                        $match: {
                            type: "cancel",
                            to: { $in: ids }
                        }
                    },
                    {
                        $group: {
                            _id: "$to",
                            totalCancels: { $sum: 1 }
                        }
                    }
                ]);

                const totalListingsMap = {};
                totalListingsResult.forEach(item => {
                    totalListingsMap[item._id] = item.totalListings;
                });

                const totalSalesMap = {};
                totalSalesResult.forEach(item => {
                    totalSalesMap[item._id] = item.totalSales;
                });

                const totalCancelsMap = {};
                totalCancelsResult.forEach(item => {
                    totalCancelsMap[item._id] = item.totalCancels;
                });

                const combinedResult = saleResult.map(purchaseItem => {
                    const matchingSaleItem = purchaseResult.find(saleItem => saleItem._id === purchaseItem._id);
                    const totalListings = totalListingsMap[purchaseItem._id] || 0;
                    const totalSales = totalSalesMap[purchaseItem._id] || 0;
                    const totalCancels = totalCancelsMap[purchaseItem._id] || 0;

                    const activeListings = totalListings - (totalSales + totalCancels);

                    return {
                        _id: purchaseItem._id,
                        totalSaleVolume: purchaseItem.totalSaleVolume,
                        totalPurchaseVolume: matchingSaleItem ? matchingSaleItem.totalPurchaseVolume : 0,
                        totalListings,
                        totalSales,
                        totalCancels,
                        activeListings,
                        user_info: purchaseItem.user_name,
                        profileImage: purchaseItem.profileImage
                    };
                });

                return res.status(200).json({ success: true, data: combinedResult });
            } catch (error) {
                res.status(400).json({ success: false, data: error.message });
            }
            break;
    }
}
