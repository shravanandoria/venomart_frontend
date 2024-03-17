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
                    const { name } = req.query;
                    const launchpadData = await Launchpad.findOne({ pageName: name });

                    res.status(200).json({ success: true, data: launchpadData });
                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
                break;
            case "PUT":
                try {
                    const { pageName, status } = req.body;
                    const launchpadData = await Launchpad.findOneAndUpdate({ pageName }, { status });

                    res.status(200).json({ success: true, data: "Status Updated Successfully!!" });
                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
            default:
                res.status(400).json({ success: false });
                break;
        }
    });
}
