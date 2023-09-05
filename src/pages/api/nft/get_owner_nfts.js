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
                    const { owner_address, skip } = req.query;

                    let nfts = await NFT.find({
                        ownerAddress: owner_address,
                        isListed: true,
                    }).populate({
                        path: "NFTCollection",
                        select: { socials: 0, createdAt: 0, updatedAt: 0 },
                    }).skip(skip).limit(15);

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
