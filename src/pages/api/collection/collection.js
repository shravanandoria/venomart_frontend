import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
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
          const { category, sortby, option, skip } = req.query;

          const currentTime = new Date();
          let timeArray = {};
          let findArray = {};
          let sortArray = {};
          let limit = 20;

          if (category != "" && category != "All") {
            findArray.category = { $eq: category }
          }
          if (sortby != "") {
            if (sortby == "topVolume") {
              sortArray.TotalVolume = -1
            }
            if (sortby == "trending") {
              sortArray.TotalVolume = -1
              currentTime.setDate(currentTime.getDate() - 30);
              timeArray = {
                createdAt: { $gte: currentTime }
              };
              limit = 9;
            }
            if (sortby == "recentlyCreated") {
              sortArray.createdAt = -1
            }

          }
          if (option != "") {
            if (option == "verified") {
              findArray.isVerified = true
            }
          }

          const collections = await Activity.aggregate([
            {
              $match: {
                ...timeArray
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
                ...findArray
              }
            },
            {
              $sort: {
                ...sortArray
              }
            },
            {
              $skip: parseFloat(skip)
            },
            {
              $limit: limit
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
            return nftResult[0]?.minimumListingPrice || null;
          };


          const mergedData = await Promise.all(
            collections.map(async (collection) => {
              const collectionId = collection._id;
              const minimumListingPrice = await getNFTResultForCollection(collectionId);
              const total_listed = await NFT.countDocuments({
                NFTCollection: collection._id,
                isListed: true
              });
              return {
                ...collection,
                FloorPrice: minimumListingPrice,
                TotalListed: total_listed
              };
            })
          );

          return res.status(200).json({ success: true, data: mergedData });

        } catch (error) {
          res.status(400).json({ success: false, data: error.message });
        }
        break;
      case "POST":
        try {
          const {
            contractAddress,
            creatorAddress,
            coverImage,
            logo,
            name,
            royalty,
            royaltyAddress,
            description,
            socials,
            isVerified,
            isPropsEnabled,
            isFeatured,
            isTrading,
            Category,
            TotalSupply
          } = req.body;

          const owner = await User.findOne({ wallet_id: creatorAddress });
          if (!owner)
            return res
              .status(400)
              .json({ success: false, data: "cannot find the user" });

          const existingCollection = await Collection.findOne({ contractAddress });
          if (existingCollection) {
            existingCollection.creatorAddress = creatorAddress;
            existingCollection.coverImage = coverImage;
            existingCollection.logo = logo;
            existingCollection.name = name;
            existingCollection.royalty = royalty;
            existingCollection.royaltyAddress = royaltyAddress;
            existingCollection.description = description;
            existingCollection.socials = socials;
            existingCollection.isVerified = isVerified;
            existingCollection.isPropsEnabled = isPropsEnabled;
            existingCollection.isFeatured = isFeatured;
            existingCollection.isTrading = isTrading;
            existingCollection.Category = Category;
            existingCollection.TotalSupply = TotalSupply;

            await existingCollection.save();
          }
          else {
            let collection = await Collection.create({
              chain: "Venom",
              contractAddress,
              creatorAddress,
              coverImage,
              logo,
              name,
              royalty,
              royaltyAddress,
              description,
              socials,
              isVerified,
              isNSFW: false,
              isPropsEnabled,
              isFeatured,
              isTrading,
              Category: Category ? Category : "",
              TotalSupply: TotalSupply ? TotalSupply : 0
            });
          }

          res.status(200).json({ success: true, data: "collection created" });
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
