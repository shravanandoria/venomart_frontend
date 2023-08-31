import dbConnect from "../../../lib/dbConnect";
import Collection from "../../../Models/Collection";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    switch (method) {
        case "POST":
            try {
                const filter = { isVerified: true };
                const update = { $set: { TotalSupply: 100 } };

                const result = await Collection.updateMany(filter, update);

                return res.status(200).json({ success: true, data: result });
            } catch (error) {
                res.status(400).json({ success: false, data: error.message });
            }
            break;
    }
}
