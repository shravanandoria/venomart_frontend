import dbConnect from "../../../lib/dbConnect";
import Launchpad from "../../../Models/Launchpad";
import limiter from "../limiter";
import Collection from "../../../Models/Collection";


export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  limiter(req, res, async () => {
    switch (method) {
      case "GET":
        try {
          const { sortby, skip } = req.query;

          const launchpadData = await Launchpad.find({}).skip(skip).limit(9).sort({ startDate: -1, status: -1 });
          res.status(200).json({ success: true, data: launchpadData });
        } catch (error) {
          res.status(400).json({ success: false, data: error.message });
        }
        break;
      case "POST":
        try {
          const {
            logo,
            coverImage,
            name,
            pageName,
            description,
            contractAddress,
            creatorAddress,
            royaltyAddress,
            royalty,
            socials,
            isActive,
            isVerified,
            isTrading,
            isPropsEnabled,
            isFeatured,
            maxSupply,
            jsonURL,
            mintPrice,
            comments,
            Category,
            startDate,
            endDate,
          } = req.body;

          // creating launchpad 
          const launchpad = await Launchpad.create({
            chain: "Venom",
            logo,
            coverImage,
            pageName,
            name,
            description,
            contractAddress,
            creatorAddress,
            royaltyAddress,
            royalty,
            socials,
            maxSupply,
            mintPrice,
            isActive,
            isVerified,
            isPropsEnabled,
            startDate,
            endDate,
            comments,
            jsonURL,
            status: "upcoming"
          });

          // creating collection 
          const existingCollection = await Collection.findOne({ contractAddress });
          if (!existingCollection) {
            let collection = await Collection.create({
              chain: "Venom",
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
              isNSFW: false,
              isPropsEnabled,
              isFeatured,
              isTrading,
              Category: Category ? Category : "",
              TotalSupply: maxSupply ? maxSupply : 0
            });
          }

          res.status(200).json({ success: true, data: "Successfully created a launchpad event!" });
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
