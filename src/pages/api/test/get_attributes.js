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
                    const { collection_address } = req.query;

                    const collection = await Collection.findOne({
                        contractAddress: collection_address,
                    });

                    if (!collection) {
                        return res
                            .status(400)
                            .json({ success: false, data: "Cannot find this collection" });
                    }

                    const nfts = await NFT.find({ NFTCollection: collection, isListed: true })
                        .select(["attributes"])
                        .populate({
                            path: "NFTCollection",
                            select: { contractAddress: 1, isVerified: 1, name: 1 },
                        })
                        .limit(10).sort({ updatedAt: -1 });

                    const nftsWithParsedAttributes = nfts.map((nft) => ({
                        ...nft.toObject(),
                        attributes: JSON.parse(nft.attributes),
                    }));

                    const uniqueTraits = {};

                    nftsWithParsedAttributes.forEach((nft) => {
                        nft.attributes.forEach((attribute) => {
                            const type = attribute.trait_type || attribute.type;
                            const value = attribute.value;

                            if (!uniqueTraits[type]) {
                                uniqueTraits[type] = {
                                    type,
                                    values: [],
                                    counts: [],
                                    probabilities: [], // Add an array for probabilities
                                };
                            }
                            const trait = uniqueTraits[type];
                            const valueIndex = trait.values.indexOf(value);
                            if (valueIndex === -1) {
                                trait.values.push(value);
                                trait.counts.push(1);
                            } else {
                                trait.counts[valueIndex]++;
                            }
                        });
                    });

                    // Calculate probabilities in percentage
                    for (const traitType in uniqueTraits) {
                        const trait = uniqueTraits[traitType];
                        const total = trait.counts.reduce((acc, count) => acc + count, 0);
                        trait.probabilities = trait.counts.map((count) =>
                            ((count / total) * 100).toFixed(2)
                        );
                    }

                    const uniqueTraitsArray = Object.values(uniqueTraits);
                    return res.status(200).json({ success: true, data: uniqueTraitsArray });

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
