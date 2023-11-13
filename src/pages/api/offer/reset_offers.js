import dbConnect from "../../../lib/dbConnect";
import NFT from "../../../Models/NFT";
import Offer from "../../../Models/Offer";
import limiter from "../limiter";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "POST":
                try {
                    const { nft_address } = req.body;

                    let nft = await NFT.findOne({ NFTAddress: nft_address });
                    if (!nft)
                        return res
                            .status(400)
                            .json({ success: false, data: "Cannot Find the NFT" });

                    const deletedOffers = await Offer.deleteMany({ nft });

                    return res.status(200).json({ success: true, data: "Successfully removed all offers from NFT" });
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
