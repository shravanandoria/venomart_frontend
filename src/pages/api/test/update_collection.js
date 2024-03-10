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
                const filter = {};
                const update = { $set: { isFeatured: false, isTrading: true } };

                const result = await Collection.updateMany(filter, update);

                return res.status(200).json({ success: true, data: result });
            } catch (error) {
                res.status(400).json({ success: false, data: error.message });
            }
            break;
    }
}