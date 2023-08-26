import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import Collection from "../../../Models/Collection";
import Activity from "../../../Models/Activity";
import NFT from "../../../Models/NFT";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    switch (method) {
        case "POST":
            try {
                const { collection_address } = req.body;

                let collection;

                collection = await Collection.findOne({
                    contractAddress: collection_address,
                });

                const nfts = await NFT.find({ NFTCollection: collection, isListed: true }).sort({ listingPrice: -1 }).select({ listingPrice: 1, isListed: 1 }).limit(1);
                console.log(parseFloat(nfts[0].listingPrice))

                res.status(200).json({ success: true, data: nfts });

            } catch (error) {
                res.status(400).json({ success: false, data: error.message });
            }
            break;
        default:
            res.status(400).json({ success: false });
            break;
    }
}
