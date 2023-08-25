import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import Collection from "../../../Models/Collection";
import Activity from "../../../Models/Activity";
import NFT from "../../../Models/NFT";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { activity_id } = req.query;

        if (activity_id) {
          const activity = await Activity.findById(activity_id);
          return res.status(200).json({ success: true, data: activity });
        }
      } catch (error) {
        res.status(400).json({ success: false });
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

        let user = await User.findOne({ wallet_id });

        let collection;

        collection = await Collection.findOne({
          contractAddress: collection_address,
        });

        if (collection) {
          if (type == "list") {
            collection.TotalListed++;
            if (newFloorPrice != 0 || newFloorPrice != undefined) {
              collection.FloorPrice = newFloorPrice;
            }
            await collection.save();
          }
          if (type == "cancel") {
            if (collection.TotalListed <= 0) return;
            collection.TotalListed--;
            await collection.save();
          }
          if (type == "sale") {
            let floatPrice = parseFloat(price);
            collection.TotalVolume += floatPrice;
            await collection.save();
            if (collection.TotalListed <= 0) return;
            collection.TotalListed--;
            await collection.save();
          }
        }

        if (!collection) {
          return res
            .status(400)
            .json({ success: false, data: "Cannot Find This Collection" });
        }


        let nft = await NFT.findOne({ NFTAddress: nft_address });

        if (!nft) {
          return res
            .status(400)
            .json({ success: false, data: "Cannot Find This NFT" });
        }

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

        nft.activity.push(activity);
        await nft.save();
        user.activity.push(activity);
        await user.save();
        collection.activity.push(activity);
        await collection.save();

        res
          .status(200)
          .json({ success: true, data: "Activity has been created" });
      } catch (error) {
        res.status(400).json({ success: false, data: error.message });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
