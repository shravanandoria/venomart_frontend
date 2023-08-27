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
        if (!user) {
          user = await User.create({ wallet_id });
        }

        let collection;
        collection = await Collection.findOne({
          contractAddress: collection_address,
        });
        // we are creating collection while creating nft so no worry 
        if (!collection) {
          return res
            .status(400)
            .json({ success: false, data: "Cannot Find This Collection" });
        }

        let nft = await NFT.findOne({ NFTAddress: nft_address });
        // we are creating nft while listing nft so no worry again
        if (!nft) {
          return res
            .status(400)
            .json({ success: false, data: "Cannot Find This NFT" });
        }

        // creating activity here 
        user = await User.findOne({ wallet_id });
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

        // doing the collection stats calculation part here 
        if (collection) {
          if (type == "list") {
            // updating totaListed 
            collection.TotalListed++;
            if (newFloorPrice != 0 || newFloorPrice != undefined) {
              // updating FloorPrice
              collection.FloorPrice = newFloorPrice;
            }
            await collection.save();
          }
          if (type == "cancel") {
            // updating totaListed 
            if (collection.TotalListed <= 0) return;
            collection.TotalListed--;
            await collection.save();
          }
          if (type == "sale") {
            // adding volume 
            let floatPrice = parseFloat(price);
            collection.TotalVolume += floatPrice;
            await collection.save();

            // updating FloorPrice
            if (newFloorPrice == 0) {
              const nfts = await NFT.find({ NFTCollection: collection, isListed: true }).sort({ listingPrice: -1 }).select({ listingPrice: 1, isListed: 1 }).limit(25);
              if (nfts.length > 0) {
                let lowestFloorPrice = nfts[0].listingPrice;
                collection.FloorPrice == lowestFloorPrice;
                await collection.save();
              }
            }

            // updating totaListed 
            if (collection.TotalListed <= 0) return;
            collection.TotalListed--;
            await collection.save();
          }
        }

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
