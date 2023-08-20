import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import NFT from "../../../Models/NFT";
// import Collection from
export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    // GET NFT BY NFT ADDRESS
    case "GET":
      try {
        const { NFTAddress } = req.query;
        let nft = await NFT.findOne({ NFTAddress });
        if (!nft)
          return res
            .status(400)
            .json({ success: false, data: "Cannot Find This NFT" });

        res.status(200).json({ success: false, data: nft });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    //CREATE NEW NFT
    case "POST":
      try {
        let nft = await NFT.findOne({ NFTAddress: req.body.NFTAddress });
        if (nft)
          return res
            .status(400)
            .json({ success: false, data: "This nft already exists" });

        nft = await NFT.create({ ...req.body });

        res.status(200).json({ success: true, data: nft });
      } catch (error) {
        res.status(400).json({ success: false, data: error.message });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
