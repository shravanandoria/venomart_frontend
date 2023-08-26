import dbConnect from "../../lib/dbConnect";
import Launchpad from "../../Models/Launchpad";
import NFT from "../../Models/NFT";
import Collection from "../../Models/Collection";
export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { query, type, page } = req.query;
        let results = {};
        if (type !== "nft") {
          const col_search = await Collection.find({
            $or: [
              { name: { $regex: query, $options: "i" } },
              { contractAddress: { $regex: query, $options: "i" } },
            ],
          })
            .select(["contractAddress", "name", "logo", "isVerified"])
            .limit(10)
            .sort({ isVerified: 1 });
          results.collections = col_search;
        }

        if (type !== "collection") {
          const nfts_search = await NFT.find({
            $or: [
              { name: { $regex: query, $options: "i" } },
              { NFTAddress: { $regex: query, $options: "i" } },
            ],
          })
            .select(["name", "NFTAddress", "nft_image", "NFTCollection"])
            .populate({
              path: "NFTCollection",
              select: { isVerified: 1, contractAddress: 1 },
            })
            .limit(10);

          results.nfts = nfts_search;
        }

        res.status(200).json({ success: true, data: results });
      } catch (error) {
        res.status(400).json({ success: false, data: error.message });
      }
      break;
    case "POST":
      try {
      } catch (error) {
        res.status(400).json({ success: false, data: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
