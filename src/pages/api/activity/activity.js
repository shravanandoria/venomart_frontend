import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import Collection from "../../../Models/Collection";
import Activity from "../../../Models/Activity";
import Notification from "../../../Models/Notification";
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

          // Fetch fromUser and ToUser information for each activity
          const activityWithUserInfo = [];
          for (const activity of activities) {
            const fromUser = await User.findOne({ wallet_id: activity.from });
            const toUser = await User.findOne({ wallet_id: activity.to });
            if (fromUser && toUser) {
              activityWithUserInfo.push({
                ...activity.toObject(),
                fromUser: fromUser.user_name,
                toUser: toUser.user_name,
              });
            }
          }

          return res.status(200).json({ success: true, data: activityWithUserInfo });

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
            stampedFloor
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
              chain: "Venom",
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
              isPropsEnabled: false,
              Category: "",
              TotalSupply: 0
            });
          }

          // Find the NFT
          let nft = await NFT.findOne({ NFTAddress: nft_address });
          if (!nft) {
            return res
              .status(400)
              .json({ success: false, data: "Cannot Find This NFT" });
          }

          let stampedFloorUpdated = 0;
          if (newFloorPrice !== "" && newFloorPrice !== undefined) {
            stampedFloorUpdated = stampedFloor;
          }

          // creating activity here 
          let findActivity = await Activity.findOne({ hash });
          if (findActivity) {
            return res
              .status(400)
              .json({ success: false, data: "Activity already exists" });
          }
          else {
            let activity = await Activity.create({
              chain: "Venom",
              hash,
              from,
              to,
              price,
              stampedFloor: stampedFloorUpdated,
              item: nft,
              type,
              owner: user,
              nft_collection: collection,
            });
          }

          // sending notification
          if (type === "sale") {
            let notification = await Notification.create({
              chain: "Venom",
              user: from,
              soldTo: to,
              price,
              hash,
              hasReaded: false,
              nft,
              type
            });
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
