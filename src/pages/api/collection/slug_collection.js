import dbConnect from "../../../lib/dbConnect";
import Collection from "../../../Models/Collection";
import Activity from "../../../Models/Activity";
import limiter from "../limiter";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  limiter(req, res, async () => {
    switch (method) {
      case "GET":
        try {
          const { contractAddress } = req.query;

          const collection = await Collection.findOne({
            contractAddress,
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
  });
}
