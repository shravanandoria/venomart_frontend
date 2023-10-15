import dbConnect from "../../lib/dbConnect";
import Activity from "../../Models/Activity";
import Launchpad from "../../Models/Launchpad";
import NFT from "../../Models/NFT";
import Collection from "../../Models/Collection";
import limiter from "./limiter";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  limiter(req, res, async () => {
    switch (method) {
      case "GET":
        try {
          const { query, type, collection_id, user_address } = req.query;
          let results = {};

          if (type == "user") {
            if (user_address) {
              const nfts_search = await NFT.find({
                $or: [
                  { name: { $regex: query, $options: "i" } },
                  { NFTAddress: { $regex: query, $options: "i" } },
                ],
                $and: [{ ownerAddress: user_address }],
              })
                .select([
                  "-attributes"
                ]).limit(10);

              results.nfts = nfts_search;
            }
          }

          if (type == "collection") {
            const col_search = await Activity.aggregate([
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
                  TotalListed: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "list"] },
                        1,
                        0
                      ]
                    }
                  },
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
                  isVerified: { $arrayElemAt: ["$collection_info.isVerified", 0] },
                  category: { $arrayElemAt: ["$collection_info.Category", 0] },
                  TotalSupply: { $arrayElemAt: ["$collection_info.TotalSupply", 0] },

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
                  $or: [{ name: { $regex: query, $options: "i" } }]
                }
              },
              {
                $sort: {
                  isVerified: -1
                }
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
                    priceAsDouble: { $toDouble: "$listingPrice" }
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
              return nftResult[0]?.minimumListingPrice || null;
            };

            const mergedData = await Promise.all(
              col_search.map(async (collection) => {
                const collectionId = collection._id;
                const minimumListingPrice = await getNFTResultForCollection(collectionId);
                return {
                  ...collection,
                  FloorPrice: minimumListingPrice
                };
              })
            );

            results.collections = mergedData;
          }

          if (type == "nft") {
            if (collection_id) {
              const nfts_search = await NFT.find({
                $or: [
                  { name: { $regex: query, $options: "i" } },
                  { NFTAddress: { $regex: query, $options: "i" } },
                ],
                $and: [{ NFTCollection: collection_id }],
              })
                .select([
                  "-attributes"
                ])
                .populate({
                  path: "NFTCollection",
                  select: { isVerified: 1, contractAddress: 1 },
                })
                .limit(10);

              results.nfts = nfts_search;
            }
          }

          if (type == undefined) {
            const col_search = await Collection.find({
              $or: [{ name: { $regex: query, $options: "i" } }],
            })
              .select([
                "-socials"
              ])
              .limit(10)
              .sort({ isVerified: -1 });
            results.collections = col_search;

            const nfts_search = await NFT.find({
              $or: [
                { name: { $regex: query, $options: "i" } },
                { NFTAddress: { $regex: query, $options: "i" } },
              ],
            })
              .select([
                "name",
                "NFTAddress",
                "description",
                "nft_image",
                "NFTCollection",
              ])
              .populate({
                path: "NFTCollection",
                select: { isVerified: 1, contractAddress: 1 },
              })
              .limit(10);

            results.nfts = nfts_search;
          }

          res.status(200).json({ success: true, data: results });
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
