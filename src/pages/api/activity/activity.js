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
          const { user_id, collection_id, nft_id, skip } = req.query;

          let activityQuery = {};

          if (user_id) {
            activityQuery.owner = user_id;
          } else if (collection_id) {
            activityQuery.nft_collection = collection_id;
          } else if (nft_id) {
            activityQuery.item = nft_id;
          }

          const activities = await Activity.find(activityQuery)
            .populate({
              path: "item",
              select: { activity: 0, attributes: 0, createdAt: 0, updatedAt: 0 },
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
              Category: [],
              TotalSupply: 0,
              TotalListed: 0,
              FloorPrice: 1000,
              TotalVolume: 0,
            });
            res.status(200).json({ success: true, data: collection });
          }

          // Find the NFT
          let nft = await NFT.findOne({ NFTAddress: nft_address });
          if (!nft) {
            return res
              .status(400)
              .json({ success: false, data: "Cannot Find This NFT" });
          }

          // creating activity here 
          if (hash != undefined) {
            const activity = await Activity.create({
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
                const floatPrice = parseFloat(price);
                collection.TotalVolume += floatPrice;

                if (newFloorPrice === 0) {
                  const nfts = await NFT.find({
                    NFTCollection: collection,
                    isListed: true,
                  })
                    .sort({ listingPrice: -1 })
                    .select({ listingPrice: 1, isListed: 1 })
                    .limit(25);

                  if (nfts.length > 0) {
                    const lowestFloorPrice = nfts[0].listingPrice;
                    collection.FloorPrice = lowestFloorPrice;
                  }
                }

                if (collection.TotalListed > 0) {
                  collection.TotalListed--;
                }
              }
              await collection.save();
            }
          }

          return res.status(200).json({ success: true, data: "Activity has been created" });
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
