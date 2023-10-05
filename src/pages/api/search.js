import dbConnect from "../../lib/dbConnect";
import Launchpad from "../../Models/Launchpad";
import NFT from "../../Models/NFT";
import Collection from "../../Models/Collection";
import limiter from "./limiter";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  limiter(req, res, async () => {
    switch (method) {
      case "GET":
        try {
          const { query, type, collection_id, user_address } = req.query;
          let results = {};

          if (type == "user") {
            if (user_address) {
              const nfts_search = await NFT.find({
                $or: [
                  { name: { $regex: query, $options: "i" } },
                  { NFTAddress: { $regex: query, $options: "i" } },
                ],
                $and: [{ ownerAddress: user_address }],
              })
                .select([
                  "-attributes"
                ]).limit(10);

              results.nfts = nfts_search;
            }
          }

          if (type == "collection") {
            const col_search = await Collection.find({
              $or: [{ name: { $regex: query, $options: "i" } }],
            })
              .select([
                "-socials"
              ])
              .limit(10)
              .sort({ isVerified: -1 });
            results.collections = col_search;
          }

          if (type == "nft") {
            if (collection_id) {
              const nfts_search = await NFT.find({
                $or: [
                  { name: { $regex: query, $options: "i" } },
                  { NFTAddress: { $regex: query, $options: "i" } },
                ],
                $and: [{ NFTCollection: collection_id }],
              })
                .select([
                  "-attributes"
                ])
                .populate({
                  path: "NFTCollection",
                  select: { isVerified: 1, contractAddress: 1 },
                })
                .limit(10);

              results.nfts = nfts_search;
            }
            else {
              const nfts_search = await NFT.find({
                $or: [
                  { name: { $regex: query, $options: "i" } },
                  { NFTAddress: { $regex: query, $options: "i" } },
                ],
              })
                .select([
                  "name",
                  "NFTAddress",
                  "description",
                  "nft_image",
                  "NFTCollection",
                ])
                .populate({
                  path: "NFTCollection",
                  select: { isVerified: 1, contractAddress: 1 },
                })
                .limit(10);

              results.nfts = nfts_search;
            }
          }

          res.status(200).json({ success: true, data: results });
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
