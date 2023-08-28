import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import Collection from "../../../Models/Collection";

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

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

        let user = await User.findOne({ wallet_id }).populate({
          path: "nftCollections",
          options: { limit: 15 },
          select: { activity: 0, socials: 0, royalty: 0, updatedAt: 0, createdAt: 0, _id: 0 }
        });

        if (!user) {
          user = await User.create(req.body);
        }

        res.status(201).json({ success: true, data: user });
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
}
