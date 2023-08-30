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
                    const {
                        ownerAddress,
                        managerAddress,
                        NFTAddress,
                    } = req.body;

                    let nft = await NFT.findOne({ NFTAddress });
                    if (!nft)
                        return res
                            .status(400)
                            .json({ success: false, data: "Cannot Find This NFT" });

                    nft.ownerAddress = ownerAddress;
                    nft.managerAddress = managerAddress;
                    nft.isListed = false;
                    nft.listingPrice = "0";
                    nft.demandPrice = 0;

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
