import dbConnect from "@/lib/dbConnect";
import User from "../../../Models/User";
import Collection from "../../../Models/Collection";

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "POST":
      try {
        const { wallet_id } = req.body;
        if (!wallet_id) return;

        let user;
        user = await User.findOne({ wallet_id }).populate("nftCollections");

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
