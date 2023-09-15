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
                    const { filterCollection, collectionCategory, minPrice, maxPrice, sortby, option, skip } = req.query;

                    let filterQuery = {};
                    let sortQuery = {};
                    let optionQuery = {};
                    let limit = 20;

                    if (filterCollection != "All") {
                        filterQuery.NFTCollection = filterCollection
                    }
                    if (collectionCategory != "All") {
                        limit = 50
                        optionQuery.Category = collectionCategory
                        // filterQuery['NFTCollection.Category'] = collectionCategory;
                    }
                    if (minPrice != 0 && maxPrice != 0) {
                        filterQuery.demandPrice = { $gte: minPrice, $lte: maxPrice }
                    }
                    if (sortby != "") {
                        if (sortby == "recentlyListed") {
                            limit = 50
                            sortQuery.isListed = -1
                            sortQuery.updatedAt = -1
                        }
                        if (sortby == "lowToHigh") {
                            limit = 50
                            sortQuery.isListed = -1
                            sortQuery.demandPrice = 1
                        }
                        if (sortby == "highToLow") {
                            limit = 50
                            sortQuery.isListed = -1
                            sortQuery.demandPrice = -1
                        }
                    }
                    if (option) {
                        if (option == "verified") {
                            optionQuery.isVerified = true
                        }
                    }

                    let nfts = await NFT.find(filterQuery, undefined, {
                        skip,
                        limit: limit,
                    }).populate({
                        path: "NFTCollection",
                        match: optionQuery,
                        select: { contractAddress: 1, name: 1, isVerified: 1, royalty: 1, royaltyAddress: 1 },
                    }).sort(sortQuery);

                    if (option == "verified") {
                        nfts = nfts.filter(nft => nft.NFTCollection);
                    }

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
