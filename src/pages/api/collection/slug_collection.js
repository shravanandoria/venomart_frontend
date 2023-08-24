import dbConnect from "../../../lib/dbConnect";
import Collection from "../../../Models/Collection";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const { contractAddress } = req.body;

        const collection = await Collection.findOne({ contractAddress }).populate({
          path: "activity",
          options: { limit: 5 },
          populate: { path: "item" },
        });

        if (!collection)
          return res.status(400).json({
            success: false,
            data: "Cannot Find This Collection",
          });

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
