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

          if (category != "") {
            // findArray.Category = { $eq: category }
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
          let collection;
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
          } = req.body;

          const check_col = await Collection.findOne({ contractAddress });
          if (check_col)
            return res.status(400).json({
              success: false,
              data: "A collection with this contractAddress already exists",
            });

          const owner = await User.findOne({ wallet_id: creatorAddress });
          if (!owner)
            return res
              .status(400)
              .json({ success: false, data: "cannot find the user" });

          collection = await Collection.create({
            contractAddress,
            creatorAddress,
            coverImage,
            logo,
            name,
            royalty,
            royaltyAddress: "",
            description,
            socials,
            isVerified,
            Category: "",
            TotalSales: 0,
            TotalSupply: 0,
            TotalListed: 0,
            FloorPrice: 100000,
            TotalVolume: 0,
          });

          await owner.nftCollections.push(collection);
          await owner.save();
          res.status(200).json({ success: true, data: collection });
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
