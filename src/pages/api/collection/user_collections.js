import dbConnect from "../../../lib/dbConnect";
import Collection from "../../../Models/Collection";
import NFT from "../../../Models/NFT";
import Activity from "../../../Models/Activity";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    switch (method) {
        case "GET":
            try {
                const { wallet_id, skip } = req.query;

                const collections = await Activity.aggregate([
                    {
                        $addFields: {
                            priceNumeric: { $toDouble: "$price" }
                        }
                    },
                    {
                        $group: {
                            _id: "$nft_collection",
                            TotalVolume: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", "sale"] },
                                        "$priceNumeric",
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
                            IgnoreOverallListings: {
                                $sum: {
                                    $cond: [
                                        { $eq: ["$type", "list"] },
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
                                $subtract: ["$IgnoreOverallListings", { $add: ["$TotalSales", "$IgnoreTotalCancels"] }]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "collections",
                            localField: "_id",
                            foreignField: "_id",
                            as: "collection_info"
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            TotalVolume: 1,
                            TotalListed: 1,
                            TotalSales: 1,
                            logo: { $arrayElemAt: ["$collection_info.logo", 0] },
                            description: { $arrayElemAt: ["$collection_info.description", 0] },
                            coverImage: { $arrayElemAt: ["$collection_info.coverImage", 0] },
                            name: { $arrayElemAt: ["$collection_info.name", 0] },
                            contractAddress: { $arrayElemAt: ["$collection_info.contractAddress", 0] },
                            creatorAddress: { $arrayElemAt: ["$collection_info.creatorAddress", 0] },
                            isVerified: { $arrayElemAt: ["$collection_info.isVerified", 0] },
                            category: { $arrayElemAt: ["$collection_info.Category", 0] },
                            TotalSupply: { $arrayElemAt: ["$collection_info.TotalSupply", 0] }
                        }
                    },
                    {
                        $match: {
                            name: {
                                $ne: undefined,
                                $ne: ""
                            },
                            logo: {
                                $ne: undefined,
                                $ne: ""
                            },
                            creatorAddress: {
                                $eq: wallet_id
                            }
                        }
                    },
                    {
                        $sort: {
                            TotalVolume: -1
                        }
                    },
                    {
                        $skip: parseFloat(skip)
                    },
                    {
                        $limit: 10
                    }
                ]);

                const getNFTResultForCollection = async (collectionId) => {
                    const nftResult = await NFT.aggregate([
                        {
                            $match: {
                                NFTCollection: collectionId,
                                isListed: true
                            }
                        },
                        {
                            $addFields: {
                                priceAsDouble: { $toDouble: "$demandPrice" }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                minimumListingPrice: {
                                    $min: "$priceAsDouble"
                                }
                            }
                        },
                        {
                            $limit: 1
                        },
                        {
                            $sort: {
                                minimumListingPrice: -1
                            }
                        }
                    ]);
                    return nftResult[0]?.minimumListingPrice || 0;
                };

                const mergedData = await Promise.all(
                    collections.map(async (collection) => {
                        const collectionId = collection?._id;
                        const minimumListingPrice = await getNFTResultForCollection(collectionId);
                        return {
                            ...collection,
                            FloorPrice: minimumListingPrice
                        };
                    })
                );

                return res.status(200).json({ success: true, data: mergedData });
            } catch (error) {
                res.status(400).json({ success: false, data: error.message });
            }
            break;
    }
}