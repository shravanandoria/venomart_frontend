import dbConnect from "../../../lib/dbConnect";
import Activity from "../../../Models/Activity";
import User from "../../../Models/User";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    switch (method) {
        case "PUT":
            try {
                const { duration, wallet_id, skip, limit } = req.body;

                let timeFilter = {};
                let walletFilter = {};

                if (wallet_id) {
                    if (wallet_id != "none" && wallet_id != "") {
                        walletFilter = {
                            to: wallet_id
                        };
                    }
                }

                if (duration) {
                    const currentTime = new Date();

                    if (duration === "1day") {
                        currentTime.setDate(currentTime.getDate() - 1);
                    } else if (duration === "7days") {
                        currentTime.setDate(currentTime.getDate() - 7);
                    } else if (duration === "30days") {
                        currentTime.setDate(currentTime.getDate() - 30);
                    } else if (duration === "1year") {
                        currentTime.setDate(currentTime.getDate() - 365);
                    }

                    if (duration != "alltime") {
                        timeFilter = {
                            createdAt: { $gte: currentTime }
                        };
                    }
                }

                // Convert skip to a number
                const skipNumber = parseInt(skip);
                const setLimit = parseInt(limit);

                const saleResult = await Activity.aggregate([
                    {
                        $match: {
                            type: "sale",
                            ...timeFilter,
                            ...walletFilter
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
                            totalBuyVolume: { $sum: "$priceNumeric" },
                            AveragePrice: { $avg: "$priceNumeric" }
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
                            totalBuyVolume: 1,
                            AveragePrice: 1,
                            user_name: { $arrayElemAt: ["$user_info.user_name", 0] },
                            profileImage: { $arrayElemAt: ["$user_info.profileImage", 0] }
                        }
                    },
                    {
                        $sort: {
                            totalBuyVolume: -1
                        }
                    },
                    {
                        $skip: skipNumber
                    },
                    {
                        $limit: setLimit
                    }
                ]);

                const ids = saleResult.map(item => item._id);


                // total buy volume 
                const purchaseResult = await Activity.aggregate([
                    {
                        $match: {
                            type: "sale",
                            to: { $in: ids },
                            ...timeFilter
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

                // total listing count 
                const totalListingsResult = await Activity.aggregate([
                    {
                        $match: {
                            type: "list",
                            from: { $in: ids },
                            ...timeFilter
                        }
                    },
                    {
                        $group: {
                            _id: "$from",
                            totalListings: { $sum: 1 }
                        }
                    }
                ]);

                // total sale count 
                const totalSalesResult = await Activity.aggregate([
                    {
                        $match: {
                            type: "sale",
                            from: { $in: ids },
                            ...timeFilter
                        }
                    },
                    {
                        $group: {
                            _id: "$from",
                            totalSales: { $sum: 1 }
                        }
                    }
                ]);

                // total buys count 
                const totalBuyResult = await Activity.aggregate([
                    {
                        $match: {
                            type: "sale",
                            to: { $in: ids },
                            ...timeFilter
                        }
                    },
                    {
                        $group: {
                            _id: "$to",
                            totalBuys: { $sum: 1 }
                        }
                    }
                ]);

                // total cancel count 
                const totalCancelsResult = await Activity.aggregate([
                    {
                        $match: {
                            type: "cancel",
                            to: { $in: ids },
                            ...timeFilter
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

                const totalBuysMap = {};
                totalBuyResult.forEach(item => {
                    totalBuysMap[item._id] = item.totalBuys;
                });

                const totalCancelsMap = {};
                totalCancelsResult.forEach(item => {
                    totalCancelsMap[item._id] = item.totalCancels;
                });

                const combinedResult = saleResult.map(purchaseItem => {
                    const matchingSaleItem = purchaseResult.find(saleItem => saleItem._id === purchaseItem._id);
                    const totalListings = totalListingsMap[purchaseItem._id] || 0;
                    const totalSales = totalSalesMap[purchaseItem._id] || 0;
                    const totalBuys = totalBuysMap[purchaseItem._id] || 0;
                    const totalCancels = totalCancelsMap[purchaseItem._id] || 0;

                    const activeListings = totalListings - (totalSales + totalCancels);
                    return {
                        _id: purchaseItem._id,
                        totalSaleVolume: purchaseItem.totalSaleVolume,
                        AveragePrice: purchaseItem.AveragePrice,
                        totalPurchaseVolume: matchingSaleItem ? matchingSaleItem.totalPurchaseVolume : 0,
                        totalListings,
                        totalSales,
                        totalBuys,
                        totalCancels,
                        activeListings,
                        smartPoints: (Math.abs(matchingSaleItem ? matchingSaleItem.totalPurchaseVolume : 0) + Math.abs(totalBuys * 3) + Math.abs(totalSales) + Math.abs(activeListings * 5)),
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
