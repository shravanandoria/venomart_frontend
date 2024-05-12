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
            collection_address
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
              isNSFW: false,
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

          // creating activity here 
          // let findActivity = await Activity.findOne({ hash });
          // if (findActivity) {
          //   return res
          //     .status(400)
          //     .json({ success: false, data: "Activity already exists" });
          // }
          // else {
          let activity = await Activity.create({
            chain: "Venom",
            hash,
            from,
            to,
            price,
            item: nft,
            type,
            owner: user,
            nft_collection: collection,
          });
          // }

          // sending notification
          if ((type == "sale") && (price != "0" || price != 0)) {
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
