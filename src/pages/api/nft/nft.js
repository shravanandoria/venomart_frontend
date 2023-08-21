import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import NFT from "../../../Models/NFT";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    // GET NFT BY NFT ADDRESS
    case "GET":
      try {
        const { skipNFTs, NFTAddress, ownerAddress, isListed } = req.query;

        const skip =
          skipNFTs && /^\d+$/.test(skipNFTs)
            ? Number(skipNFTs)
            : 0;

        // GET USER'S NFTS
        if (ownerAddress) {
          let nfts = await NFT.find({ ownerAddress });
          return res.status(200).json({ success: false, data: nfts });
        }

        // IF NFT ADDRESS IS PROVIDED, SEND THAT NFT
        if (NFTAddress) {
          let nft = await NFT.findOne({ NFTAddress }).populate("NFTCollection");

          if (!nft)
            return res
              .status(400)
              .json({ success: false, data: "Cannot Find This NFT" });

          return res.status(200).json({ success: false, data: nft });
        }

        //SEND ALL NFTS
        let nfts = await NFT.find({}, undefined, {
          skip,
          limit: 9,
        });;
        res.status(200).json({ success: false, data: nfts });
      } catch (error) {
        res.status(400).json({ success: false, data: error.message });
      }
      break;

    //CREATE NEW NFT
    case "POST":
      try {
        const {
          NFTAddress,
          ownerAddress,
          managerAddress,
          nft_image,
          name,
          description,
          attributes,
          NFTCollection,
        } = req.body;

        let nft = await NFT.findOne({ NFTAddress });
        if (nft)
          return res
            .status(400)
            .json({ success: false, data: "This nft already exists" });

        nft = await NFT.create({
          NFTAddress,
          ownerAddress,
          managerAddress,
          nft_image,
          name,
          description,
          isListed: false,
          isLike: false,
          listingPrice: 0,
          attributes,
          NFTCollection,
          transactions: [],
        });

        res.status(200).json({ success: true, data: nft });
      } catch (error) {
        res.status(400).json({ success: false, data: error.message });
      }
      break;

    case "PUT":
      try {
        const { NFTAddress, price, new_manager } = req.body;
        let nft = await NFT.findOne({ NFTAddress });
        if (!nft)
          return res
            .status(400)
            .json({ success: false, data: "Cannot Find This NFT" });

        nft.isListed = true;
        nft.listingPrice = price;
        nft.managerAddress = new_manager;

        await nft.save();

        res.status(200).json({ success: false, data: nft });
      } catch (error) {
        res.status(400).json({ success: false, data: error.message });
      }
    default:
      res.status(400).json({ success: false });
      break;
  }
}
