import dbConnect from "../../../lib/dbConnect";
import Collection from "../../../Models/Collection";
import NFT from "../../../Models/NFT";
import mongoose from "mongoose";
const { Parser } = require('json2csv');
const fs = require('fs');

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    switch (method) {
        case "GET":
            try {
                const { collection_id } = req.query;
                const nfts = await NFT.find({ NFTCollection: new mongoose.Types.ObjectId(collection_id) });

                const uniqueOwnerAddressesSet = new Set();

                const ownersAddr = nfts.filter(nft => {
                    return nft.managerAddress === nft.ownerAddress;
                }).map(nft => {
                    // Add owner address to set if it doesn't already exist
                    if (!uniqueOwnerAddressesSet.has(nft.ownerAddress)) {
                        uniqueOwnerAddressesSet.add(nft.ownerAddress);
                        return { ownerAddress: nft.ownerAddress };
                    }
                    return null; // Skip duplicate owner addresses
                }).filter(owner => owner !== null);

                // Convert ownerAddresses array to CSV format
                const json2csvParser = new Parser({ fields: ['ownerAddress'] });
                const csv = json2csvParser.parse(ownersAddr);

                // Send the CSV data as the response
                res.setHeader('Content-Disposition', `attachment; filename=NFT_Owner_Addresses_${Date.now()}.csv`);
                res.setHeader('Content-Type', 'text/csv');
                res.status(200).send(csv);
            } catch (error) {
                res.status(400).json({ success: false, data: error.message });
            }
            break;
    }
}