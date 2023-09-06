import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import NFT from "../../../Models/NFT";
import Collection from "../../../Models/Collection";
import limiter from "../limiter";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  limiter(req, res, async () => {
    switch (method) {
      case "GET":
        try {
          const { nft_address } = req.query;

          let nft = await NFT.findOne({ NFTAddress: nft_address }).populate({
            path: "NFTCollection",
            select: { socials: 0, createdAt: 0, updatedAt: 0 },
          });

          if (!nft)
            return res
              .status(400)
              .json({ success: false, data: "Cannot Find This NFT" });

          return res.status(200).json({ success: true, data: nft });

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
            signer_address,
          } = req.body;

          let user = await User.findOne({ wallet_id: signer_address });
          if (!user) {
            user = await User.create({ wallet_id: signer_address });
          }

          let nft = await NFT.findOne({ NFTAddress });
          if (nft)
            return res
              .status(400)
              .json({ success: false, data: "This nft already exists" });

          let collection;
          collection = await Collection.findOne({
            contractAddress: NFTCollection,
          });

          if (!collection) {
            collection = await Collection.create({
              contractAddress: NFTCollection,
              creatorAddress: "",
              coverImage: "",
              logo: "",
              name: "",
              royalty: "",
              royaltyAddress: "",
              description: "",
              socials: [],
              isVerified: false,
              Category: "",
              TotalSales: 0,
              TotalSupply: 0,
              TotalListed: 0,
              FloorPrice: 100000,
              TotalVolume: 0,
            });
          }

          // creating the nft
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
            demandPrice: 0,
            attributes,
            NFTCollection: collection,
          });

          return res.status(200).json({ success: true, data: nft });
        } catch (error) {
          res.status(400).json({ success: false, data: error.message });
        }
        break;

      case "PUT":
        try {
          const {
            NFTAddress,
            isListed,
            price,
            demandPrice,
            new_manager,
            new_owner,
          } = req.body;

          let nft = await NFT.findOne({ NFTAddress });
          if (!nft)
            return res
              .status(400)
              .json({ success: false, data: "Cannot Find This NFT" });

          if (new_owner !== undefined) {
            let user = await User.findOne({ wallet_id: new_owner });
            if (!user) {
              user = await User.create({ wallet_id: new_owner });
            }
          }

          nft.isListed = isListed;
          nft.listingPrice = price;
          nft.demandPrice = demandPrice;
          nft.managerAddress = new_manager;
          if (new_owner !== undefined) {
            nft.ownerAddress = new_owner;
          }

          await nft.save();

          return res.status(200).json({ success: true, data: nft });
        } catch (error) {
          res.status(400).json({ success: false, data: error.message });
        }
      default:
        res.status(400).json({ success: false });
        break;
    }
  });
}
