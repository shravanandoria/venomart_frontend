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
          ownerAddress,
          isListed,
          collection_address,
          page,
        } = req.query;

        const skip = skipNFTs && /^\d+$/.test(skipNFTs) ? Number(skipNFTs) : 0;
        const skipCol =
          skipCollectionNFTs && /^\d+$/.test(skipCollectionNFTs)
            ? Number(skipCollectionNFTs)
            : 0;

        // GET USER'S NFTS
        if (ownerAddress) {
          let nfts = await NFT.find({ ownerAddress });
          return res.status(200).json({ success: true, data: nfts });
        }

        // IF NFT ADDRESS IS PROVIDED, SEND THAT NFT
        if (NFTAddress) {
          let nft = await NFT.findOne({ NFTAddress })
            .populate({
              path: "NFTCollection",
              select: { activity: 0, socials: 0, createdAt: 0, updatedAt: 0 },
            })
            .populate({
              path: "activity",
              options: { limit: 15, sort: [{ createdAt: -1 }] },
              select: {
                createdAt: 1,
                from: 1,
                hash: 1,
                price: 1,
                type: 1,
                to: 1,
              },
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
            ])
            .skip(skipCol)
            .limit(20);

          return res.status(200).json({ success: true, data: nfts });
        }

        //SEND ALL NFTS
        let nfts = await NFT.find({ isListed: true }, undefined, {
          skip,
          limit: 20,
        }).populate({
          path: "NFTCollection",
          select: { activity: 0, socials: 0, createdAt: 0, updatedAt: 0 },
        });
        res.status(200).json({ success: true, data: nfts });
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
            isVerified: false,
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
          activity: [],
        });

        // adding the nft to the user wallet
        let nftNew = await NFT.findOne({ NFTAddress });
        let NFTOwner = await User.findOne({ wallet_id: ownerAddress });
        NFTOwner.NFTs.push(nftNew);
        await NFTOwner.save();

        if (!NFTOwner) {
          CreateNFTOwner = await User.create({ wallet_id: ownerAddress });
          NFTOwner = await User.findOne({ wallet_id: ownerAddress });
          NFTOwner.NFTs.push(nftNew);
          await NFTOwner.save();
        }

        res.status(200).json({ success: true, data: nft });
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
          old_owner,
          transaction_type,
        } = req.body;

        let nft = await NFT.findOne({ NFTAddress });
        if (!nft)
          return res
            .status(400)
            .json({ success: false, data: "Cannot Find This NFT" });

        let user = await User.findOne({ wallet_id: new_owner });
        if (!user) {
          user = await User.create({ wallet_id: new_owner });
        }

        nft.isListed = isListed;
        nft.listingPrice = price;
        nft.demandPrice = demandPrice;
        nft.managerAddress = new_manager;
        if (new_owner) {
          nft.ownerAddress = new_owner;
        }
        if (transaction_type == "sale" && old_owner != undefined) {
          user = await User.findOne({ wallet_id: new_owner });
          let old_user = await User.findOne({ wallet_id: old_owner });

          old_user.NFTs.remove(nft);
          await old_user.save();
          user.NFTs.push(nft);
          await user.save();
        }

        await nft.save();

        res.status(200).json({ success: true, data: nft });
      } catch (error) {
        res.status(400).json({ success: false, data: error.message });
      }
    default:
      res.status(400).json({ success: false });
      break;
  }
}
