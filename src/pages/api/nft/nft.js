import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import NFT from "../../../Models/NFT";
import Activity from "../../../Models/Activity";
import Collection from "../../../Models/Collection";
import Offer from "../../../Models/Offer";
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

          // getting floor price 
          const getFloorPrice = async (collectionId) => {
            const nftResult = await NFT.aggregate([
              {
                $match: {
                  NFTCollection: collectionId,
                  isListed: true
                }
              },
              {
                $addFields: {
                  priceAsDouble: { $toDouble: "$listingPrice" }
                }
              },
              {
                $group: {
                  _id: null,
                  minimumListingPrice: {
                    $min: "$priceAsDouble"
                  }
                }
              },
              {
                $limit: 1
              },
              {
                $sort: {
                  minimumListingPrice: -1
                }
              }
            ]);
            return nftResult[0]?.minimumListingPrice || 0;
          };

          const minimumListingPrice = await getFloorPrice(nft?.NFTCollection?._id);

          // getting owner info 
          let user = await User.findOne({ wallet_id: nft.ownerAddress });

          // getting last sold 
          const lastSold = await Activity.find({ type: "sale", item: nft._id }).limit(1).sort({ createdAt: -1 });

          // getting highest Offer
          const highestLastOffer = await Offer.findOne({ nft: nft?._id, status: "active" }).sort({ createdAt: -1 });

          // nft props proba 
          let updatedAttributes = [];
          let rarityScore = 0;

          if (nft.NFTCollection.isPropsEnabled) {
            const nfts = await NFT.find({ NFTCollection: nft.NFTCollection._id })
              .select(["attributes"]);

            const uniqueTraits = {};

            nfts.forEach((nft) => {
              nft.attributes.forEach((attribute) => {
                const type = attribute.trait_type || attribute.type;
                const value = attribute.value;

                if (!uniqueTraits[type]) {
                  uniqueTraits[type] = {
                    type,
                    values: [],
                  };
                }
                const trait = uniqueTraits[type];
                const valueIndex = trait.values.findIndex((item) => item.value === value);

                if (valueIndex === -1) {
                  trait.values.push({ value, count: 1, probability: 0 });
                } else {
                  trait.values[valueIndex].count++;
                }
              });
            });

            for (const traitType in uniqueTraits) {
              const trait = uniqueTraits[traitType];
              const total = trait.values.reduce((acc, item) => acc + item.count, 0);

              trait.values.forEach((item) => {
                item.probability = ((item.count / total) * 100).toFixed(2);
                item.rarityscore = (1 / item.count / nfts.length);
              });
            }

            const propertyTraits = Object.values(uniqueTraits);
            updatedAttributes = [];

            nft.attributes.forEach((attribute) => {
              for (const trait of propertyTraits) {
                const found = trait.values.find((item) => item.value === attribute.value);
                if (found) {
                  updatedAttributes.push({
                    trait_type: trait.type,
                    value: attribute.value,
                    probability: found.probability,
                    rarityscore: found.rarityscore
                  });
                  break;
                }
              }
            });

            for (const updatedAttribute of updatedAttributes) {
              rarityScore += updatedAttribute.rarityscore;
            }
          }

          // more nfts 
          let moreNFTs = await NFT.find(
            { NFTCollection: nft.NFTCollection, isListed: true, NFTAddress: { $ne: nft_address } },
            undefined,
            { limit: 5 }
          ).populate({ path: "NFTCollection", select: { name: 1, isVerified: 1, contractAddress: 1 }, }).sort({ demandPrice: 1 });

          const mergedData = {
            ...nft.toObject(),
            FloorPrice: minimumListingPrice,
            lastSold: lastSold[0]?.price,
            highestOffer: parseFloat(highestLastOffer?.offerPrice),
            username: user.user_name,
            userProfileImage: user.profileImage,
            rarityScore: parseFloat(rarityScore.toFixed(2)),
            attributes: nft.NFTCollection.isPropsEnabled ? updatedAttributes : nft.attributes,
            moreNFTs: moreNFTs
          };

          return res.status(200).json({ success: true, data: mergedData });

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
            nft_metadata,
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
              chain: "Venom",
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
              isNSFW: false,
              isPropsEnabled: false,
              Category: "",
              TotalSupply: 0
            });
          }

          // creating the nft
          nft = await NFT.create({
            chain: "Venom",
            NFTAddress,
            ownerAddress,
            managerAddress,
            nft_image,
            nft_metadata,
            name,
            description,
            isListed: false,
            isAuction: false,
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

          return res.status(200).json({ success: true, data: "Successfully updated NFT" });
        } catch (error) {
          res.status(400).json({ success: false, data: error.message });
        }
      default:
        res.status(400).json({ success: false });
        break;
    }
  });
}
