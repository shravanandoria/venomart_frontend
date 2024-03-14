import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import limiter from "../limiter";

export default async function handler(req, res) {
    await dbConnect();
    const { method } = req;

    limiter(req, res, async () => {
        switch (method) {
            case "GET":
                const { wallet_address } = req.query;

                try {
                    const user = await User.find({ wallet_id: wallet_address });
                    res.status(200).json({ success: true, data: user });
                } catch (error) {
                    res.status(500).json({ success: false, message: "An error occurred" });
                }
                break;
            default:
                res.status(400).json({ success: false });
                break;
        }
    });
}
