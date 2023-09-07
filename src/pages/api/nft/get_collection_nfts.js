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
                    const { collection_address, sortby, minprice, maxprice, skip } = req.query;

                    const collection = await Collection.findOne({
                        contractAddress: collection_address,
                    });

                    if (!collection) {
                        return res
                            .status(400)
                            .json({ success: false, data: "Cannot find this collection" });
                    }

                    if (minprice != 0 && maxprice != 0) {
                        const nfts = await NFT.find({ NFTCollection: collection, demandPrice: { $gte: minprice, $lte: maxprice } })
                            .select([
                                "-NFTCollection",
                                "-managerAddress",
                                "-attributes",
                            ]).skip(skip)
                            .limit(20).sort({ demandPrice: 1 });
                        return res.status(200).json({ success: true, data: nfts });
                    }

                    if (sortby != "") {
                        if (sortby == "recentlyListed") {
                            const nfts = await NFT.find({ NFTCollection: collection, isListed: true })
                                .select([
                                    "-managerAddress",
                                    "-attributes",
                                ]).populate({
                                    path: "NFTCollection",
                                    select: { contractAddress: 1, isVerified: 1, name: 1 },
                                }).skip(skip)
                                .limit(20).sort({ updatedAt: -1 });
                            return res.status(200).json({ success: true, data: nfts });
                        }
                        if (sortby == "lowToHigh") {
                            const nfts = await NFT.find({ NFTCollection: collection })
                                .select([
                                    "-managerAddress",
                                    "-attributes",
                                ]).populate({
                                    path: "NFTCollection",
                                    select: { contractAddress: 1, isVerified: 1, name: 1 },
                                }).skip(skip)
                                .limit(20).sort({ isListed: -1, demandPrice: 1 });
                            return res.status(200).json({ success: true, data: nfts });
                        }
                        if (sortby == "highToLow") {
                            const nfts = await NFT.find({ NFTCollection: collection })
                                .select([
                                    "-managerAddress",
                                    "-attributes",
                                ]).populate({
                                    path: "NFTCollection",
                                    select: { contractAddress: 1, isVerified: 1, name: 1 },
                                }).skip(skip)
                                .limit(20).sort({ isListed: -1, demandPrice: -1 });
                            return res.status(200).json({ success: true, data: nfts });
                        }
                    }

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
