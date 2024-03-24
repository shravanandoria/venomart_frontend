// import dbConnect from "../../../lib/dbConnect";
// import NFT from "../../../Models/NFT";

// export default async function handler(req, res) {
//     const { method } = req;

//     // Connect to the MongoDB database
//     await dbConnect();

//     switch (method) {
//         case "POST":
//             try {
//                 // Fetch all NFT documents
//                 const nfts = await NFT.find({});

//                 // Loop through each NFT and update the demandPrice field
//                 for (const nft of nfts) {
//                     const newDemandPrice = parseFloat(nft.demandPrice);
//                     nft.demandPrice = newDemandPrice;
//                     await nft.save(); // Save the updated document
//                 }

//                 res.status(200).json({ success: true, message: 'Migration completed successfully.' });

//             } catch (error) {
//                 console.error('Migration error:', error);
//                 res.status(500).json({ success: false, message: 'Migration error' });
//             }
//             break;

//         default:
//             res.status(405).json({ success: false, message: 'Method not allowed' });
//             break;
//     }
// }
