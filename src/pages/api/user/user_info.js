import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import Activity from "../../../Models/Activity";
import NFT from "../../../Models/NFT";
import Collection from "../../../Models/Collection";

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "POST":
      try {
        const { wallet_id } = req.body;
        if (!wallet_id) return;

        const skip =
          req.query.activitySkip && /^\d+$/.test(req.query.activitySkip)
            ? Number(req.query.activitySkip)
            : 0;

        let user;
        user = await User.findOne({ wallet_id })
          .populate({
            path: "nftCollections",
            options: { limit: 15 },
            select: { activity: 0, socials: 0, royalty: 0, updatedAt: 0, createdAt: 0, _id: 0 }
          });

        if (user) return res.status(201).json({ success: true, data: user });

        user = await User.create(req.body);

        res.status(201).json({ success: true, data: user });

      } catch (error) {
        res.status(400).json({ success: false, data: error.message });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
