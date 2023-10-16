import dbConnect from "../../../lib/dbConnect";
import NFT from "../../../Models/NFT";
import User from "../../../Models/User";
import Activity from "../../../Models/Activity";
import Notification from "../../../Models/Notification";
import Collection from "../../../Models/Collection";
import limiter from "../limiter";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "PUT":
                try {
                    const { NFTAddresses, NFTCollections, NFTPrices, ownerAddresses, signer_address, hash } = req.body;

                    for (let i = 0; i < NFTAddresses.length; i++) {
                        let nft = await NFT.findOne({ NFTAddress: NFTAddresses[i] });
                        nft.isListed = false;
                        nft.demandPrice = 0;
                        nft.listingPrice = "0";
                        nft.managerAddress = signer_address;
                        nft.ownerAddress = signer_address;
                        await nft.save();

                        let collection = await Collection.findOne({ contractAddress: NFTCollections[i].contractAddress });

                        let user = await User.findOne({ wallet_id: ownerAddresses[i] });

                        let activity = await Activity.create({
                            chain: "Venom",
                            hash,
                            from: ownerAddresses[i],
                            to: signer_address,
                            price: (NFTPrices[i] / 1000000000).toString(),
                            stampedFloor: NFTCollections[i].FloorPrice,
                            item: nft,
                            type: "sale",
                            owner: user,
                            nft_collection: collection,
                        });

                        let notification = await Notification.create({
                            chain: "Venom",
                            user: ownerAddresses[i],
                            soldTo: signer_address,
                            price: (NFTPrices[i] / 1000000000).toString(),
                            hash,
                            hasReaded: false,
                            nft,
                            type: "sale"
                        });
                    }

                    return res.status(200).json({ success: true, data: "bulk buy successful" });
                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
            default:
                res.status(400).json({ success: false });
                break;
        }
    });
}
