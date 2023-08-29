import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import NFT from "../../../Models/NFT";
import Collection from "../../../Models/Collection";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    // GET NFT BY NFT ADDRESS
    case "GET":
      try {
        const {
          skipNFTs,
          skipCollectionNFTs,
          NFTAddress,
          owner_address,
          collection_address,
        } = req.query;

        const skip = skipNFTs && /^\d+$/.test(skipNFTs) ? Number(skipNFTs) : 0;
        const skipCol =
          skipCollectionNFTs && /^\d+$/.test(skipCollectionNFTs)
            ? Number(skipCollectionNFTs)
            : 0;

        // GET USER'S NFTS
        if (owner_address) {
          let nfts = await NFT.find({
            ownerAddress: owner_address,
            isListed: true,
          })
            .skip(skipNFTs)
            .limit(15);

          return res.status(200).json({ success: true, data: nfts });
        }

        // IF NFT ADDRESS IS PROVIDED, SEND THAT NFT
        if (NFTAddress) {
          let nft = await NFT.findOne({ NFTAddress }).populate({
            path: "NFTCollection",
            select: { activity: 0, socials: 0, createdAt: 0, updatedAt: 0 },
          });

          if (!nft)
            return res
              .status(400)
              .json({ success: false, data: "Cannot Find This NFT" });

          return res.status(200).json({ success: true, data: nft });
        }

        // IF COLLECTION ADDR IS PROVIDED, SEND ALL NFTS WITH THAT COL ADDRESS
        if (collection_address) {
          const collection = await Collection.findOne({
            contractAddress: collection_address,
          });

          if (!collection) {
            return res
              .status(400)
              .json({ success: false, data: "Cannot find this collection" });
          }

          const nfts = await NFT.find({ NFTCollection: collection })
            .select([
              "-activity",
              "-NFTCollection",
              "-managerAddress",
              "-isLike",
              "-attributes",
            ]).skip(skipCol)
            .limit(20).sort({ isListed: -1, listingPrice: 1 });

          return res.status(200).json({ success: true, data: nfts });
        }

        //SEND ALL NFTS
        let nfts = await NFT.find({}, undefined, {
          skip,
          limit: 20,
        }).populate({
          path: "NFTCollection",
          select: { activity: 0, socials: 0, createdAt: 0, updatedAt: 0 },
        }).sort({ isListed: -1 });
        return res.status(200).json({ success: true, data: nfts });

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
            Category: [],
            TotalSupply: 0,
            TotalListed: 0,
            FloorPrice: 1000,
            TotalVolume: 0,
          });
          res.status(200).json({ success: true, data: collection });
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
}
