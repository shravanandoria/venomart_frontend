import dbConnect from "../../../lib/dbConnect";
import Collection from "../../../Models/Collection";
import Activity from "../../../Models/Activity";
import NFT from "../../../Models/NFT";
import limiter from "../limiter";

export default async function handler(req, res) {
    const { method } = req;

    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "GET":
                try {
                    const { collection_id } = req.query;

                    const nfts = await NFT.find({ NFTCollection: collection_id })
                        .select(["attributes"]);

                    const uniqueTraits = {};

                    nfts.forEach((nft) => {
                        nft.attributes.forEach((attribute) => {
                            const type = attribute.trait_type || attribute.type;
                            const value = attribute.value;

                            if (!uniqueTraits[type]) {
                                uniqueTraits[type] = {
                                    type,
                                    values: [],
                                };
                            }
                            const trait = uniqueTraits[type];
                            const valueIndex = trait.values.findIndex((item) => item.value === value);

                            if (valueIndex === -1) {
                                trait.values.push({ value, count: 1, probability: 0 });
                            } else {
                                trait.values[valueIndex].count++;
                            }
                        });
                    });

                    for (const traitType in uniqueTraits) {
                        const trait = uniqueTraits[traitType];
                        const total = trait.values.reduce((acc, item) => acc + item.count, 0);

                        trait.values.forEach((item) => {
                            item.probability = ((item.count / total) * 100).toFixed(2);
                        });
                    }

                    const propertyTraits = Object.values(uniqueTraits);

                    res.status(200).json({ success: true, data: propertyTraits });
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
