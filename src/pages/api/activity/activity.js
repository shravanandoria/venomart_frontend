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
          const { user_id, user_wallet, collection_id, nft_id, activityType, skip } = req.query;

          let activityQuery = {};

          if (user_id) {
            if (activityType == "user_sale") {
              activityQuery.type = "sale";
              activityQuery.from = user_wallet;
            }
            else {
              activityQuery.owner = user_id;
              activityType && (activityQuery.type = activityType);
            }
          } else if (collection_id) {
            activityQuery.nft_collection = collection_id;
            activityType && (activityQuery.type = activityType);
          } else if (nft_id) {
            activityQuery.item = nft_id;
            activityType && (activityQuery.type = activityType);
          }
          else {
            activityType && (activityQuery.type = activityType);
          }

          if (activityType == "user_sale") {
            const activities = await Activity.find(activityQuery)
              .populate({
                path: "item",
                select: { attributes: 0, createdAt: 0, updatedAt: 0 },
              })
              .skip(skip)
              .limit(15)
              .sort({ createdAt: -1 });

            return res.status(200).json({ success: true, data: activities });
          }

          const activities = await Activity.find(activityQuery)
            .populate({
              path: "item",
              select: { attributes: 0, createdAt: 0, updatedAt: 0 },
            })
            .skip(skip)
            .limit(15)
            .sort({ createdAt: -1 });

          return res.status(200).json({ success: true, data: activities });

        } catch (error) {
          res.status(400).json({ success: false, data: error.message });
        }

        break;
      case "POST":
        try {
          const {
            hash,
            from,
            to,
            price,
            type,
            wallet_id,
            nft_address,
            collection_address,
            newFloorPrice,
          } = req.body;

          // Find or create the user
          let user = await User.findOne({ wallet_id });
          if (!user) {
            user = await User.create({ wallet_id });
          }

          // Find the collection
          let collection = await Collection.findOne({
            contractAddress: collection_address,
          });
          if (!collection) {
            collection = await Collection.create({
              contractAddress: collection_address,
              creatorAddress: "",
              coverImage: "",
              logo: "",
              name: "",
              royalty: "",
              royaltyAddress: "",
              description: "",
              socials: [],
              isVerified: false,
              Category: "",
              TotalSales: 0,
              TotalSupply: 0,
              TotalListed: 0,
              FloorPrice: 100000,
              TotalVolume: 0,
            });
          }

          // Find the NFT
          let nft = await NFT.findOne({ NFTAddress: nft_address });
          if (!nft) {
            return res
              .status(400)
              .json({ success: false, data: "Cannot Find This NFT" });
          }

          // creating activity here 
          let activity = await Activity.create({
            hash,
            from,
            to,
            price,
            item: nft,
            type,
            owner: user,
            nft_collection: collection,
          });

          if (collection) {
            if (type === "list") {
              collection.TotalListed++;

              if (newFloorPrice !== 0 && newFloorPrice !== undefined) {
                collection.FloorPrice = newFloorPrice;
              }
            } else if (type === "cancel") {
              if (collection.TotalListed > 0) {
                collection.TotalListed--;
              }
            } else if (type === "sale") {
              collection.TotalSales++;

              const floatPrice = parseFloat(price);
              collection.TotalVolume += floatPrice;

              if (collection.TotalListed > 0) {
                collection.TotalListed--;
              }

              if (newFloorPrice === 0) {
                const nfts = await NFT.find({
                  NFTCollection: collection,
                  isListed: true,
                })
                  .sort({ demandPrice: 1 })
                  .select({ demandPrice: 1, listingPrice: 1, isListed: 1 })
                  .limit(2);

                if (nfts.length > 0) {
                  const lowestFloorPrice = nfts[0].listingPrice;
                  collection.FloorPrice = lowestFloorPrice;
                }
              }
            }
            await collection.save();
          }


          return res.status(200).json({ success: true, data: "Successfully created activity" });
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
