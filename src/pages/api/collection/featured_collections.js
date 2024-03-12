import dbConnect from "../../../lib/dbConnect";
import Collection from "../../../Models/Collection";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    switch (method) {
        case "GET":
            try {

                const collections = await Collection.find({ isFeatured: true })
                    .limit(5)
                    .sort({ createdAt: 1 });

                return res.status(200).json({ success: true, data: collections });
            } catch (error) {
                res.status(400).json({ success: false, data: error.message });
            }
            break;
    }
}