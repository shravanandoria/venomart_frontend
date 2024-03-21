import dbConnect from "../../../lib/dbConnect";
import NFT from "../../../Models/NFT";
import limiter from "../limiter";
import Collection from "../../../Models/Collection";


export default async function handler(req, res) {
    const { method } = req;

    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "GET":
                try {
                    const { contractAddress, signer_address } = req.query;

                    const collection_id = await Collection.find({ contractAddress })

                    let nfts = await NFT.find({ NFTCollection: collection_id, ownerAddress: signer_address }, undefined).sort({ updatedAt: -1 }).select({ nft_image: 1, name: 1, _id: 1, NFTAddress: 1 });

                    res.status(200).json({ success: true, data: nfts });
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
