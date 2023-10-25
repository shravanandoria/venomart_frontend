import dbConnect from "../../lib/dbConnect";
import limiter from "./limiter";
const { TonClient } = require("@eversdk/core");
const { libNode } = require("@eversdk/lib-node");

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();
  TonClient.useBinaryLibrary(libNode);

  limiter(req, res, async () => {
    switch (method) {
      case "GET":
        try {
          // const client = new TonClient({
          //   network: {
          //     endpoints: ["https://gql-testnet.venom.foundation/graphql"],
          //     // endpoints: ["https://jrpc-testnet.venom.foundation/rpc"],
          //   },
          // });
          // const query = client.net.query({
          //   query: `query{
          //   blockchain{
          //     account(address:"0:e12577165b4f98da773d0f6f5057c14fced0b2eda0d67eddf569787dc2213b98"){
          //       messages(msg_type:[ExtOut, ExtIn, IntIn, IntOut],first:2){
          //         edges{
          //           node{
          //             hash
          //             body
          //             created_at_string
          //           }
          //           cursor
          //         }
          //         pageInfo{
          //           hasNextPage
          //         }
          //       }
          //     }
          //   }
          // }`,
          // });

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
