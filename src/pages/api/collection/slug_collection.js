import dbConnect from "../../../lib/dbConnect";
import Collection from "../../../Models/Collection";
import Activity from "../../../Models/Activity";
import NFT from "../../../Models/NFT";
import limiter from "../limiter";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  limiter(req, res, async () => {
    switch (method) {
      case "GET":
        try {
          const { contractAddress } = req.query;

          const find_collection = await Collection.findOne({
            contractAddress,
          }).select({ FloorPrice: 0, keywords: 0, TotalSales: 0, TotalVolume: 0, TotalListed: 0 });

          if (!find_collection)
            return res.status(400).json({
              success: false,
              data: "Cannot Find This Collection",
            });

          const collection_activity = await Activity.aggregate([
            {
              $match: {
                nft_collection: find_collection?._id
              }
            },
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
              $project: {
                _id: 1,
                TotalVolume: 1,
                TotalListed: 1,
                TotalSales: 1
              }
            }
          ]);

          const getFloorPriceForCollection = async (collectionId) => {
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

          const minimumListingPrice = await getFloorPriceForCollection(find_collection?._id);

          const mergedData =
            collection_activity.map((collection) => ({
              ...collection,
              FloorPrice: minimumListingPrice,
              ...find_collection?._doc,
            }))

          const responseData = mergedData[0] || find_collection?._doc;

          res.status(200).json({ success: true, data: responseData });
        } catch (error) {
          res.status(400).json({ success: false, data: error.message });
        }
        break;
      case "PUT":
        try {
          const { data } = req.body;

          let updateInfo = {
            royaltyAddress: data.royaltyAddress,
            name: data.name,
            logo: data.logo,
            coverImage: data.coverImage,
            website: data.website,
            twitter: data.twitter,
            discord: data.discord,
            telegram: data.telegram,
            isNSFW: data.isNSFW,
            isVerified: data.isVerified,
            isPropsEnabled: data.isPropsEnabled,
            isFeatured: data.isFeatured,
            isTrading: data.isTrading,
            Category: data.Category,
            description: data.description,
          };

          const filter = { contractAddress: data.contractAddress };
          const update = { $set: updateInfo };

          const result = await Collection.updateOne(filter, update);

          return res.status(200).json({ success: true, data: result });
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
