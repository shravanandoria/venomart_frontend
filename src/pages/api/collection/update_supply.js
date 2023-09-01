import dbConnect from "../../../lib/dbConnect";
import Collection from "../../../Models/Collection";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    switch (method) {
        case "POST":
            try {
                const { contractAddress, TotalSupply } = req.body;

                const filter = { contractAddress: contractAddress };
                const update = { $set: { TotalSupply: parseInt(TotalSupply) } };

                const result = await Collection.updateOne(filter, update);

                return res.status(200).json({ success: true, data: result });
            } catch (error) {
                res.status(400).json({ success: false, data: error.message });
            }
            break;
    }
}
