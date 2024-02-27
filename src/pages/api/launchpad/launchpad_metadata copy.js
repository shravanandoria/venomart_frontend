import dbConnect from "../../../lib/dbConnect";
import Launchpad_data from "../../../Models/launchpad_data";
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
          res.status(200).send("hello");
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
