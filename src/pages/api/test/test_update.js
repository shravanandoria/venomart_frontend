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
                const contractAddresses = [
                    "0:7eb6488246ba08f88fe8779e9257ca9ebc7d2f82f6111ce6747abda368e3c7a8",
                    "0:ae6ab9601f5d75a65851e2a826422de14bb193be0200506d34d1ae4c4c27dba0",
                ];
                // const contractAddresses = [
                //     "0:008a846cc9dead315ee11005ff3864996179e0ed9ec26b04f8060a362b21dec1",
                //     "0:a3d84546a9f0e3bbb720ce1415446a339b5595abd4e5ea91e770e7b6e0408168",
                //     "0:8434fd234c59d904f43594112b57cb0a2b5d65a1c800f9848b0c93a2dd052e7e",
                //     "0:4ec675ffeaab505d84412002333558e0afe9066e038a693ebb72889ce6341498",
                //     "0:c36c4939e3ae582f4e9f7215f36bc39e89a1796e6a32260dec762cf53c137dd2",
                //     "0:aae4225bcd3f7cec286b3496abbaf91b213b8c1f024dc3a3189ecd148363d277",
                //     "0:688c1bfc7415643585c81a0f769f8cc9a1432c5d2348b36eb9f27efad19a0690",
                //     "0:5a42abb162be813f0d9efd2f350baf77fcafc53acb86366e67a5571cca34d9ba",
                //     "0:639d6c2c1b33f6055436dffc0bd0f4f6d224c2227f56fb542e63fa46e0c1709d",
                //     "0:206858b2877d088d003550e4942d46821cb1c78b567e490dd6674d69fb72b63c",
                //     "0:33a630f9c54fc4092f43ab978f3fd65964bb0d775553c16953aa1568eb63ab0f",
                //     "0:3ce49eddf4099caa4c10b4869357af642616f3d71c04fd6eca772131ed9ab7c2",
                //     "0:9a49dc04f979f0ed7b0b465fc2d9266e57025406497ad5038e4ff61259eaf9d2",
                // ];

                const filter = { contractAddress: { $in: contractAddresses } };
                const update = { $set: { TotalVolume: 0, FloorPrice: 1000, TotalListed: 0, TotalSupply: 0, Category: ["Collectibles"], royalty: "5", royaltyAddress: "0:481b34e4d5c41ebdbf9b0d75f22f69b822af276c47996c9e37a89e1e2cb05580" } };

                const result = await Collection.updateMany(filter, update);

                console.log(result);

                return res.status(200).json({ success: true, data: result });
            } catch (error) {
                res.status(400).json({ success: false, data: error.message });
            }
            break;
    }
}
