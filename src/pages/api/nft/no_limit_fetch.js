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
                    let { owner_address } = req.query;

                    const nfts = await NFT.find({ ownerAddress: owner_address })
                        .select([
                            "-socials",
                            "-createdAt",
                            "-updatedAt",
                        ]).populate({
                            path: "NFTCollection",
                            select: { contractAddress: 1, isVerified: 1, isTrading: 1, name: 1, FloorPrice: 1 },
                        });
                    return res.status(200).json({ success: true, data: nfts });

                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
                break;
            case "PUT":
                try {
                    const {
                        NFTAddress,
                        ownerAddress,
                        managerAddress
                    } = req.body;

                    let nft = await NFT.findOne({ NFTAddress });
                    if (!nft)
                        return res
                            .status(400)
                            .json({ success: false, data: "Cannot Find This NFT" });

                    if (ownerAddress == managerAddress) {
                        nft.isListed = false,
                            nft.demandPrice = 0;
                        nft.listingPrice = "0";
                    }
                    if ((nft.ownerAddress != ownerAddress) || (nft.managerAddress != managerAddress)) {
                        nft.ownerAddress = ownerAddress,
                            nft.managerAddress = managerAddress,
                            await nft.save();
                    }

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
