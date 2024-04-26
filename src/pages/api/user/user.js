import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import NFT from "../../../Models/NFT";
import Collection from "../../../Models/Collection";
import limiter from "../limiter";

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  limiter(req, res, async () => {
    switch (method) {
      case "GET":
        try {
          const users = await User.find({});
          res.status(200).json({ success: true, data: users });
        } catch (error) {
          res.status(500).json({ success: false, message: "An error occurred" });
        }
        break;
      case "POST":
        try {
          const { wallet_id } = req.body;
          if (!wallet_id) {
            return res.status(400).json({ success: false, message: "wallet_id is required" });
          }

          let user = await User.findOne({ wallet_id });

          if (!user) {
            user = await User.create(req.body);
          }

          const nftResult = await NFT.aggregate([
            {
              $match: {
                ownerAddress: user?.wallet_id
              }
            },
            {
              $group: {
                _id: "$NFTCollection",
                totalNFTs: { $sum: 1 }
              }
            },
            {
              $group: {
                _id: null,
                totalNFTsByCollection: { $push: { collection: "$_id", count: "$totalNFTs" } }
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

          // Fetch floor prices for all collections
          const floorPrices = await Promise.all(nftResult[0]?.totalNFTsByCollection.map(async (collection) => {
            const floorPrice = await getFloorPriceForCollection(collection.collection);
            return { collection: collection.collection, floorPrice: floorPrice };
          })) || [];

          // Calculate total value for each collection and sum up for portfolioValue
          let portfolioValue = 0;
          const totalNFTsByCollection = nftResult[0]?.totalNFTsByCollection || [];
          totalNFTsByCollection.forEach((collection) => {
            const floorPriceObject = floorPrices.find((item) => item.collection === collection.collection);
            collection.totalValue = floorPriceObject ? collection.count * floorPriceObject.floorPrice : 0;
            portfolioValue += collection.totalValue;
          });

          // Merge nftResult into user object
          const finalData = {
            ...user.toObject(),
            portfolioValue
          };

          res.status(201).json({ success: true, data: finalData });
        } catch (error) {
          res.status(500).json({ success: false, message: "An error occurred" });
        }
        break;
      case "PUT":
        try {
          const {
            wallet_id,
            user_name,
            email,
            bio,
            profileImage,
            coverImage,
            socials,
            isArtist,
          } = req.body;

          let user = await User.findOne({ wallet_id });
          if (!user)
            return res
              .status(404)
              .json({ success: false, data: "Cannot Find The User" });

          const update_user = await User.findOneAndUpdate(
            { wallet_id },
            {
              user_name,
              email,
              bio,
              profileImage,
              coverImage,
              socials,
              isArtist,
            },
            { new: true }
          );

          return res.status(201).json({ success: true, data: update_user });
        } catch (error) {
          res.status(500).json({ success: false, message: "An error occurred" });
        }
      default:
        res.status(400).json({ success: false });
        break;
    }
  });
}
