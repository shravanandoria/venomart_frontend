import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import Collection from "../../../Models/Collection";
import NFT from "../../../Models/NFT";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const skip =
          req.query.skip && /^\d+$/.test(req.query.skip)
            ? Number(req.query.skip)
            : 0;

        const collections = await Collection.find(
          { name: { $ne: "" } },
          { activity: 0, socials: 0 },
          {
            skip,
            limit: 20,
          }
        ).sort({ TotalVolume: -1, TotalListed: -1, isVerified: -1, });
        res.status(200).json({ success: true, data: collections });
      } catch (error) {
        res.status(400).json({ success: false, data: error.message });
      }
      break;
    case "POST":
      try {
        let collection;
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
        } = req.body;

        const check_col = await Collection.findOne({ contractAddress });
        if (check_col)
          return res.status(400).json({
            success: false,
            data: "A collection with this contractAddress already exists",
          });

        const owner = await User.findOne({ wallet_id: creatorAddress });
        if (!owner)
          return res
            .status(400)
            .json({ success: false, data: "cannot find the user" });

        collection = await Collection.create({
          contractAddress,
          creatorAddress,
          coverImage,
          logo,
          name,
          royalty,
          royaltyAddress: "",
          description,
          socials,
          isVerified,
          Category: ["Collectible"],
          TotalSupply: 0,
          TotalListed: 0,
          FloorPrice: 1000,
          TotalVolume: 0,
        });

        await owner.nftCollections.push(collection);
        await owner.save();
        res.status(200).json({ success: true, data: collection });
      } catch (error) {
        res.status(400).json({ success: false, data: error.message });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
