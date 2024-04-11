import dbConnect from "../../../lib/dbConnect";
import NFT from "../../../Models/NFT";
import Collection from "../../../Models/Collection";
import limiter from "../limiter";
import mongoose from "mongoose";


export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "PUT":
                try {
                    const { collection_id } = req.body;

                    const nfts = await NFT.find({ NFTCollection: new mongoose.Types.ObjectId(collection_id) })
                        .select(["attributes"]);

                    // want to do updatedNFTs in batches 
                    const updatedNFTs = await Promise.all(nfts.map(async (nft) => {
                        let updatedAttributes = [];
                        let rarityScore = 0;

                        const relatedNFTs = await NFT.find({ NFTCollection: new mongoose.Types.ObjectId(collection_id) })
                            .select(["attributes"]);

                        const uniqueTraits = {};

                        relatedNFTs.forEach((relatedNFT) => {
                            relatedNFT.attributes.forEach((attribute) => {
                                const type = attribute.trait_type;
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
                                item.rarityscore = (1 / item.count / relatedNFTs.length);
                            });
                        }

                        const propertyTraits = Object.values(uniqueTraits);
                        updatedAttributes = [];

                        nft.attributes.forEach((attribute) => {
                            for (const trait of propertyTraits) {
                                const found = trait.values.find((item) => item.value === attribute.value);
                                if (found) {
                                    updatedAttributes.push({
                                        trait_type: trait.type,
                                        value: attribute.value,
                                        probability: found.probability,
                                        rarityscore: found.rarityscore
                                    });
                                    break;
                                }
                            }
                        });

                        for (const updatedAttribute of updatedAttributes) {
                            rarityScore += updatedAttribute.rarityscore;
                        }


                        const mergedData = {
                            nft_id: nft._id,
                            rarityScore: rarityScore
                        };

                        return mergedData;
                    }));

                    // Sort the NFTs by rarity score in ascending order
                    updatedNFTs.sort((a, b) => b.rarityScore - a.rarityScore);

                    // Assign ranks based on the sorted order
                    let currentRank = 1;
                    let previousRarityScore = null;

                    updatedNFTs.forEach((nft, index) => {
                        if (nft.rarityScore !== previousRarityScore) {
                            // If rarity score changed, update current rank
                            nft.rank = currentRank;
                            currentRank = index + 1;
                            previousRarityScore = nft.rarityScore;
                        } else {
                            // If rarity score is the same as the previous one, keep the same rank
                            nft.rank = currentRank + 1;
                        }
                    });

                    // Update ranks in the database
                    await Promise.all(updatedNFTs.map(async (nft) => {
                        const rarityUpdate = await NFT.findByIdAndUpdate(new mongoose.Types.ObjectId(nft.nft_id), { rank: nft.rank });
                    }));


                    return res.status(200).json({ success: true, data: "Computed Rankings Successfully!" });
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
