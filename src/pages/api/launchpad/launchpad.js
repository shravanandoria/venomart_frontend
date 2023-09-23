import dbConnect from "../../../lib/dbConnect";
import Launchpad from "../../../Models/Launchpad";
import limiter from "../limiter";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  limiter(req, res, async () => {
    switch (method) {
      case "GET":
        try {
          const launchpadData = await Launchpad.find({});
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
            description,
            contractAddress,
            creatorAddress,
            royaltyAddress,
            royalty,
            socials,
            maxSupply,
            jsonURL,
            mintPrice,
            status,
            isActive,
            isVerified,
            isPropsEnabled,
            startDate,
            endDate,
            comments,
          } = req.body;

          const launchpad = await Launchpad.create({
            logo,
            coverImage,
            name,
            description,
            contractAddress,
            creatorAddress,
            royaltyAddress,
            royalty,
            socials,
            maxSupply,
            jsonURL,
            mintPrice,
            status,
            isActive,
            isVerified,
            isPropsEnabled,
            startDate,
            endDate,
            comments,
          });

          res.status(200).json({ success: true, data: launchpad });
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
