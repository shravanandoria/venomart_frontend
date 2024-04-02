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

          const launchpadData = await Launchpad.find({}).skip(skip).limit(9).sort({ createdAt: -1 });
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
            isVerified,
            isTrading,
            isPropsEnabled,
            isFeatured,
            maxSupply,
            Category,
            phases
          } = req.body;

          // creating launchpad 
          const launchpad = await Launchpad.create({
            chain: "Venom",
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
            maxSupply,
            status: "upcoming",
            phases: phases
          });

          // creating collection 
          if (contractAddress) {
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
          }

          res.status(200).json({ success: true, data: "Successfully created a launchpad event!" });
        } catch (error) {
          res.status(400).json({ success: false, data: error.message });
        }
        break;
      case "PUT":
        try {
          const {
            logo,
            coverImage,
            name,
            pageName,
            description,
            contractAddress,
            creatorAddress,
            socials,
            status,
            phases
          } = req.body;

          // updating launchpad 
          const launchpad = await Launchpad.updateOne(
            { pageName },
            {
              logo,
              coverImage,
              name,
              description,
              contractAddress,
              creatorAddress,
              socials,
              status,
              phases
            }
          );

          res.status(200).json({ success: true, data: "Successfully updated the launchpad event!" });
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
