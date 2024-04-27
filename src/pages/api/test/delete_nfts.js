import { NFTCollection } from "@thirdweb-dev/react";
import dbConnect from "../../../lib/dbConnect";
import NFT from "../../../Models/NFT";
import limiter from "../limiter";
import mongoose from "mongoose";


export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "PUT":
                try {
                    let nft = await NFT.find({
                        name: /Soldier/,
                        NFTCollection: new mongoose.Types.ObjectId("662a6202324690f7895aa543")
                    });
                    console.log(nft?.length)
                    if (!nft)
                        return res
                            .status(400)
                            .json({ success: false, data: "Cannot Find This NFT" });

                    await NFT.deleteMany({
                        name: /Soldier/,
                        NFTCollection: new mongoose.Types.ObjectId("662a6202324690f7895aa543")
                    });

                    return res.status(200).json({ success: true, data: nft });
                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
            default:
                res.status(400).json({ success: false });
                break;
        }
    });
}
