import dbConnect from "../../lib/dbConnect";
import limiter from "./limiter";
import { libNode } from "@eversdk/lib-node";
const { TonClient } = require("@eversdk/core");
TonClient.useBinaryLibrary(libNode);

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  const client = new TonClient({
    network: {
      endpoints: ["https://gql-testnet.venom.foundation/graphql"],
      // endpoints: ["https://jrpc-testnet.venom.foundation/rpc"],
    },
  });

  limiter(req, res, async () => {
    switch (method) {
      case "GET":
        try {
          const result = await client.net.query_collection({
            collection: "accounts",
            filter: {
              id: { eq: "0:e12577165b4f98da773d0f6f5057c14fced0b2eda0d67eddf569787dc2213b98" },
            },
            result: "balance",
          });
          console.log("result: ", { result });

          // console.log({ query });
          res.status(200).json({ success: true, data: "world" });
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
