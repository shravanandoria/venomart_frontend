import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import Collection from "../../../Models/Collection";
import NFT from "../../../Models/NFT";
import limiter from "../limiter";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  limiter(req, res, async () => {
    switch (method) {
      case "GET":
        try {
          const { category, sortby, option, skip } = req.query;

          let findArray = {};
          let sortArray = {};

          if (category != "" && category != "All") {
            findArray.Category = { $eq: category }
          }
          if (sortby != "") {
            if (sortby == "topVolume") {
              sortArray.TotalVolume = -1
            }
            if (sortby == "trending") {
              sortArray.TotalListed = -1
            }
            if (sortby == "recentlyCreated") {
              sortArray.createdAt = -1
            }

          }
          if (option != "") {
            if (option == "verified") {
              findArray.name = { $ne: "" }
              findArray.isVerified = true
            }
            if (option == "unverified") {
              findArray.name = { $ne: "" }
            }
          }

          const collections = await Collection.find(
            findArray,
            { socials: 0 },
            {
              skip,
              limit: 20,
            }
          ).sort(sortArray);

          return res.status(200).json({ success: true, data: collections });


        } catch (error) {
          res.status(400).json({ success: false, data: error.message });
        }
        break;
      case "POST":
        try {
          const {
            contractAddress,
            creatorAddress,
            coverImage,
            logo,
            name,
            royalty,
            royaltyAddress,
            description,
            socials,
            isVerified,
            isPropsEnabled
          } = req.body;

          const owner = await User.findOne({ wallet_id: creatorAddress });
          if (!owner)
            return res
              .status(400)
              .json({ success: false, data: "cannot find the user" });

          const existingCollection = await Collection.findOne({ contractAddress });
          if (existingCollection) {
            existingCollection.creatorAddress = creatorAddress;
            existingCollection.coverImage = coverImage;
            existingCollection.logo = logo;
            existingCollection.name = name;
            existingCollection.royalty = royalty;
            existingCollection.royaltyAddress = royaltyAddress;
            existingCollection.description = description;
            existingCollection.socials = socials;
            existingCollection.isVerified = isVerified;
            existingCollection.isPropsEnabled = isPropsEnabled;

            await existingCollection.save();
          }
          else {
            let collection = await Collection.create({
              contractAddress,
              creatorAddress,
              coverImage,
              logo,
              name,
              royalty,
              royaltyAddress,
              description,
              socials,
              isVerified,
              isPropsEnabled,
              Category: "",
              TotalSales: 0,
              TotalSupply: 0,
              TotalListed: 0,
              FloorPrice: 0,
              TotalVolume: 0,
            });

            await owner.nftCollections.push(collection);
            await owner.save();
          }

          res.status(200).json({ success: true, data: "collection created" });
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
