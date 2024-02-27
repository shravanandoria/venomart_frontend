import dbConnect from "../../../lib/dbConnect";
import Launchpad from "../../../Models/Launchpad";
import limiter from "../limiter";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  limiter(req, res, async () => {
    switch (method) {
      case "GET":
        try {
          res.status(200).json({ success: true, data: "It;s a get requrest" });
        } catch (error) {
          res.status(400).json({ success: false, data: error.message });
        }
        break;
      case "POST":
        try {
          const { contractAddress } = req.body;

          const collection = await Launchpad.findOne({ contractAddress });

          if (!collection) return res.status(400).json({ success: false, data: "Cannot find this address" });
          const { maxSupply, jsonURL, current_tokenId } = collection;

          res.status(200).json({ success: true, data: `${jsonURL}/${current_tokenId}.json` });
          await collection.current_tokenId++;
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
