import dbConnect from "../../../lib/dbConnect";
import Collection from "../../../Models/Collection";
import limiter from "../limiter";

export default async function handler(req, res) {
    const { method } = req;

    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "POST":
                try {
                    const { contractAddress } = req.body;

                    const collection = await Collection.findOne({ contractAddress }, { royalty: 1, name: 1, isVerified: 1, contractAddress: 1, FloorPrice: 1 });

                    if (!collection)
                        return res.status(400).json({
                            success: false,
                            data: "Cannot Find This Collection",
                        });

                    return res.status(200).json({ success: true, data: collection });
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
