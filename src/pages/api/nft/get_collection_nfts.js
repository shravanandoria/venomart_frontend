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
                    const { collection_address, owner_address, sortby, propsFilter, minprice, maxprice, skip } = req.query;
                    const decodedPropsFilter = JSON.parse(decodeURIComponent(propsFilter));

                    const collection = await Collection.findOne({
                        contractAddress: collection_address,
                    });

                    if (!collection) {
                        return res
                            .status(400)
                            .json({ success: false, data: "Cannot find this collection" });
                    }

                    if (decodedPropsFilter != "" && decodedPropsFilter != []) {
                        const filteredNFTs = await NFT.aggregate([
                            {
                                $match: {
                                    NFTCollection: collection._id
                                },
                            },
                            {
                                $unwind: "$attributes",
                            },
                            {
                                $match: {
                                    "attributes.value": { $in: decodedPropsFilter },
                                },
                            },
                            {
                                $lookup: {
                                    from: "collections",
                                    localField: "NFTCollection",
                                    foreignField: "_id",
                                    as: "collectionData",
                                },
                            },
                            {
                                $unwind: "$collectionData",
                            },
                            {
                                $project: {
                                    "collectionData.isVerified": 1,
                                    "collectionData.name": 1,
                                    "collectionData.contractAddress": 1,
                                    "collectionData.royalty": 1,
                                    "collectionData.royaltyAddress": 1,
                                    "collectionData.FloorPrice": 1,
                                    nft_image: 1,
                                    NFTAddress: 1,
                                    ownerAddress: 1,
                                    managerAddress: 1,
                                    nft_metadata: 1,
                                    name: 1,
                                    description: 1,
                                    isListed: 1,
                                    listingPrice: 1,
                                    demandPrice: 1
                                },
                            },
                            {
                                $group: {
                                    _id: "$_id",
                                    NFTCollection: { $first: "$collectionData" },
                                    nft_image: { $first: "$nft_image" },
                                    NFTAddress: { $first: "$NFTAddress" },
                                    ownerAddress: { $first: "$ownerAddress" },
                                    managerAddress: { $first: "$managerAddress" },
                                    nft_metadata: { $first: "$nft_metadata" },
                                    name: { $first: "$name" },
                                    description: { $first: "$description" },
                                    isListed: { $first: "$isListed" },
                                    listingPrice: { $first: "$listingPrice" },
                                    demandPrice: { $first: "$demandPrice" },
                                },
                            },
                            {
                                $limit: 20,
                            },
                            {
                                $sort: { isListed: -1 },
                            }
                        ]);
                        return res.status(200).json({ success: true, data: filteredNFTs });
                    }

                    if (minprice != 0 && maxprice != 0) {
                        const nfts = await NFT.find({ NFTCollection: collection, demandPrice: { $gte: minprice, $lte: maxprice } })
                            .select([
                                "-attributes",
                            ]).populate({
                                path: "NFTCollection",
                                select: { contractAddress: 1, isVerified: 1, name: 1, FloorPrice: 1 },
                            }).skip(skip)
                            .limit(20).sort({ demandPrice: 1 });
                        return res.status(200).json({ success: true, data: nfts });
                    }

                    if (sortby != "") {
                        if (sortby == "recentlyListed") {
                            const nfts = await NFT.find({ NFTCollection: collection, isListed: true })
                                .select([
                                    "-attributes",
                                ]).populate({
                                    path: "NFTCollection",
                                    select: { contractAddress: 1, isVerified: 1, name: 1, FloorPrice: 1 },
                                }).skip(skip)
                                .limit(20).sort({ updatedAt: -1 });
                            return res.status(200).json({ success: true, data: nfts });
                        }
                        if (sortby == "recentlySold") {
                            const nfts = await NFT.find({ NFTCollection: collection, isListed: false })
                                .select([
                                    "-attributes",
                                ]).populate({
                                    path: "NFTCollection",
                                    select: { contractAddress: 1, isVerified: 1, name: 1, FloorPrice: 1 },
                                }).skip(skip)
                                .limit(20).sort({ updatedAt: -1 });
                            return res.status(200).json({ success: true, data: nfts });
                        }
                        if (sortby == "ownedBy") {
                            const nfts = await NFT.find({ NFTCollection: collection, ownerAddress: owner_address })
                                .select([
                                    "-attributes",
                                ]).populate({
                                    path: "NFTCollection",
                                    select: { contractAddress: 1, isVerified: 1, name: 1, FloorPrice: 1 },
                                }).skip(skip)
                                .limit(20).sort({ isListed: -1 });
                            return res.status(200).json({ success: true, data: nfts });
                        }
                        if (sortby == "lowToHigh") {
                            const nfts = await NFT.find({ NFTCollection: collection })
                                .select([
                                    "-attributes",
                                ]).populate({
                                    path: "NFTCollection",
                                    select: { contractAddress: 1, isVerified: 1, name: 1, FloorPrice: 1 },
                                }).skip(skip)
                                .limit(20).sort({ isListed: -1, demandPrice: 1 });
                            return res.status(200).json({ success: true, data: nfts });
                        }
                        if (sortby == "highToLow") {
                            const nfts = await NFT.find({ NFTCollection: collection })
                                .select([
                                    "-attributes",
                                ]).populate({
                                    path: "NFTCollection",
                                    select: { contractAddress: 1, isVerified: 1, name: 1, FloorPrice: 1 },
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
