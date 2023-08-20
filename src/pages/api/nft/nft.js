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
        const { page, NFTAddress, ownerAddress } = req.query;
        let contentPerPage = 9;

        // GET USER'S NFTS
        if (ownerAddress) {
          let nfts = await NFT.find({ ownerAddress })
            .skip(page * contentPerPage)
            .limit(contentPerPage);
          return res.status(200).json({ success: false, data: nfts });
        }

        // IF NFT ADDRESS IS PROVIDED, SEND THAT NFT
        if (NFTAddress) {
          let nft = await NFT.findOne({ NFTAddress })
            .skip(page * contentPerPage)
            .limit(contentPerPage);

          if (!nft)
            return res
              .status(400)
              .json({ success: false, data: "Cannot Find This NFT" });

          return res.status(200).json({ success: false, data: nft });
        }

        //SEND ALL NFTS
        let nfts = await NFT.find()
          .skip(page * contentPerPage)
          .limit(contentPerPage);
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
          imageURL,
          title,
          description,
          properties,
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
          imageURL,
          title,
          description,
          isListed: false,
          isLike: false,
          listingPrice: 0,
          properties,
          NFTCollection,
          transactions: [],
        });

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
