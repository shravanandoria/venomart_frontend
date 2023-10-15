import dbConnect from "../../../lib/dbConnect";
import NFT from "../../../Models/NFT";
import limiter from "../limiter";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "PUT":
                try {
                    const { NFTArray } = req.body;


                    let nft = await NFT.findOne({ NFTAddress });
                    nft.isListed = true;
                    nft.demandPrice = demandPrice;
                    nft.listingPrice = listingPrice;
                    nft.managerAddress = new_manager;
                    nft.ownerAddress = new_owner;
                    await nft.save();

                    return res.status(200).json({ success: true, data: nft });
                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
            default:
                res.status(400).json({ success: false });
                break;
        }
    });
}
