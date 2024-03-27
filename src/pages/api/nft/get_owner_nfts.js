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
                    let { owner_address, saleType, sortby, minprice, maxprice, skip } = req.query;

                    let filterQuery = {};
                    let sortyBy = {};

                    if (owner_address != "") {
                        filterQuery.ownerAddress = owner_address
                        if (saleType == "listed") {
                            filterQuery.isListed = true
                        }
                        if (saleType == "notlisted") {
                            filterQuery.isListed = false
                        }
                        if (saleType != "All") {
                            sortyBy.updatedAt = -1
                        }
                        if (saleType == "All") {
                            sortyBy.isListed = -1
                            sortyBy.updatedAt = -1
                        }
                    }

                    if (minprice != 0 && maxprice != 0) {
                        const nfts = await NFT.find({ ownerAddress: owner_address, isListed: true, demandPrice: { $gte: minprice, $lte: maxprice } })
                            .select([
                                "-socials",
                                "-createdAt",
                                "-updatedAt",
                            ]).populate({
                                path: "NFTCollection",
                                select: { contractAddress: 1, isVerified: 1, isTrading: 1, name: 1, FloorPrice: 1 },
                            }).skip(skip)
                            .limit(20).sort({ demandPrice: 1 });
                        return res.status(200).json({ success: true, data: nfts });
                    }

                    if (sortby != "") {
                        if (sortby == "recentlyListed") {
                            const nfts = await NFT.find(filterQuery)
                                .select([
                                    "-attributes",
                                ]).populate({
                                    path: "NFTCollection",
                                    select: { contractAddress: 1, isVerified: 1, isTrading: 1, name: 1, FloorPrice: 1 },
                                }).skip(skip)
                                .limit(20).sort(sortyBy);
                            return res.status(200).json({ success: true, data: nfts });
                        }
                        if (sortby == "lowToHigh") {
                            const nfts = await NFT.find(filterQuery)
                                .select([
                                    "-attributes",
                                ]).populate({
                                    path: "NFTCollection",
                                    select: { contractAddress: 1, isVerified: 1, isTrading: 1, name: 1, FloorPrice: 1 },
                                }).skip(skip)
                                .limit(20).sort({ isListed: -1, demandPrice: 1 });
                            return res.status(200).json({ success: true, data: nfts });
                        }
                        if (sortby == "highToLow") {
                            const nfts = await NFT.find(filterQuery)
                                .select([
                                    "-attributes",
                                ]).populate({
                                    path: "NFTCollection",
                                    select: { contractAddress: 1, isVerified: 1, isTrading: 1, name: 1, FloorPrice: 1 },
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
