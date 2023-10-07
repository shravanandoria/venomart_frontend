import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import NFT from "../../../Models/NFT";
import Offer from "../../../Models/Offer";
import Notification from "../../../Models/Notification";
import limiter from "../limiter";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "GET":
                try {
                    const { nftId, signer_address } = req.query;

                    const offer = await Offer.find({ nft: nftId, from: signer_address, status: "active" });

                    return res.status(200).json({ success: true, data: offer });
                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
                break;
        }
    });
}
