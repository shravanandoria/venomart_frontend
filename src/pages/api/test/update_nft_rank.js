import dbConnect from "../../../lib/dbConnect";
import NFT from "../../../Models/NFT";
import mongoose from "mongoose";

export default async function handler(req, res) {
    const { method } = req;

    // Connect to the MongoDB database
    await dbConnect();

    switch (method) {
        case "POST":
            try {
                // Fetch all NFT documents
                await NFT.updateMany(
                    { NFTCollection: new mongoose.Types.ObjectId("663203b48b47b6f579be2043") },
                    { $unset: { rank: "" } }
                );


                res.status(200).json({ success: true, message: 'Deleted successfully' });

            } catch (error) {
                console.error('Migration error:', error);
                res.status(500).json({ success: false, message: 'Migration error' });
            }
            break;

        default:
            res.status(405).json({ success: false, message: 'Method not allowed' });
            break;
    }
}
