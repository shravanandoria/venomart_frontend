import dbConnect from "../../../lib/dbConnect";
import NFT from "../../../Models/NFT";
import Collection from "../../../Models/Collection";
import limiter from "../limiter";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "GET":
                try {
                    const { skip } = req.query;

                    let nfts = await NFT.find({}, undefined, {
                        skip,
                        limit: 20,
                    }).populate({
                        path: "NFTCollection",
                        select: { activity: 0, socials: 0, createdAt: 0, updatedAt: 0 },
                    }).sort({ isListed: -1 });

                    return res.status(200).json({ success: true, data: nfts });

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
