import dbConnect from "../../../lib/dbConnect";
import NFT from "../../../Models/NFT";
import Offer from "../../../Models/Offer";
import limiter from "../limiter";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "GET":
                try {
                    const { offerContract } = req.query;

                    const offer = await Offer.findOne({ offerContract }).sort({ createdAt: -1 });

                    return res.status(200).json({ success: true, data: offer });
                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
                break;
        }
    });
}
