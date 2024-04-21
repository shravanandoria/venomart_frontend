import { Address, parseMessage, parseTransaction } from "everscale-inpage-provider";
import moment from "moment";
import {
  createNFT,
  updateNFTListing,
  cancelNFTListing,
  updateNFTsale,
  update_verified_nft_data,
  updateNFTSaleBulk,
} from "./mongo_api/nfts/nfts";
import { Subscriber, TvmException } from "everscale-inpage-provider";
import { addOffer, getOfferWithOfferContract, removeAllOffers, updateOffer } from "./mongo_api/offer/offer";
import { addActivity } from "./mongo_api/activity/activity";
import { create_collection } from "./mongo_api/collection/collection";

// importing abis
import indexAbi from "../../abi/Index.abi.json";
import nftAbi from "../../abi/Nft.abi.json";
import FactoryDirectSell from "../../abi/FactoryDirectSell.abi.json";
import DirectSell from "../../abi/DirectSell.abi.json";
import Launchpad_Contract_ABI from "../../abi/LaunchpadContract.abi.json";
import { TonClient, abiContract } from "@eversdk/core";

// make offer abis
// import TokenWallet from "../../abi/TokenWallet.abi.json";
// import TokenRoot from "../../abi/TokenRoot.abi.json";
// import FactoryMakeOffer from "../../new_abi/FactoryMakeOffer.abi.json";
// import make_offer_abi from "../../new_abi/MakeOffer.abi.json";

// STRICT -- dont change this values, this values are used in transactions
export const ONE_VENOM = 1000000000; //one venom for calculations
export const cancel_refundable_fees = 0.1 * ONE_VENOM; //amount we send to cancel transaction {PASSING IT IN TRANSACTIONS}
export const launchpad_nft_fees = 0.1 * ONE_VENOM; //amount we send to mint launchpad NFT {PASSING IT IN TRANSACTIONS}
export const buy_refundable_fees = 0.6 * ONE_VENOM; //amount we send when buy NFT {FOR DISPLAY}
export const buy_cart_refundable_fees = 0.7 * ONE_VENOM; //amount we send when buy cart NFT {FOR DISPLAY}
export const extra_venom_fees = 0.01 * ONE_VENOM; //extra venoms for transactions {PASSING IT IN TRANSACTIONS}
export const platform_fees = 2.5; //value in percent 2.5% {FOR DISPLAY}
// dont change this values, this values are used in transactions -- STRICT

// all contract address here down
export const FactoryDirectSellAddress = new Address(
  "0:cfca87bef699ba4d7dafbd2611ff0159cd64e3f99b5ef3f407ff0ddb1723096c",
);

// all contract address here up

// ---- all functions used for rpc or graphql nft fetch ----
export const getNftImage = async (provider, nftAddress) => {
  const nftContract = new provider.Contract(nftAbi, nftAddress);
  const getJsonAnswer = await nftContract.methods.getJson({ answerId: 0 }).call();
  // const json = JSON.parse(getJsonAnswer.json);
  const json = JSON.parse(getJsonAnswer.json ?? "{}");
  return json;
};

export const getCollectionItems = async (provider, nftAddresses) => {
  let nfts = [];
  await Promise.all(
    nftAddresses.map(async nftAddress => {
      const nft_contract = new provider.Contract(nftAbi, nftAddress);
      // for GRAPHQL
      // const nft_contract = new provider.Contract(indexAbi, indexAddress.id);

      const nft = await nft_contract.methods.getInfo({ answerId: 0 }).call();

      const imgInfo = await getNftImage(provider, nftAddress);
      let obj = {
        ...imgInfo,
        nftAddress,
        last_paid: nftAddress.last_paid,
        manager: nft.manager.toString(),
        owner: nft.owner.toString(),
      };
      nfts.push(obj);
    }),
  );
  return nfts;
};

export const getNftCodeHash = async (provider, collection_address) => {
  const collectionAddress = new Address(collection_address);
  const contract = new provider.Contract(Launchpad_Contract_ABI, collectionAddress);
  const { codeHash } = await contract.methods.nftCodeHash({ answerId: 0 }).call({ responsible: true });
  return BigInt(codeHash).toString(16);
};

export const saltCode = async (provider, ownerAddress) => {
  // Index StateInit you should take from github. It ALWAYS constant!
  const INDEX_BASE_64 =
    "te6ccgECIAEAA4IAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAgaK2zUfBAQkiu1TIOMDIMD/4wIgwP7jAvILHAYFHgOK7UTQ10nDAfhmifhpIds80wABn4ECANcYIPkBWPhC+RDyqN7TPwH4QyG58rQg+COBA+iogggbd0CgufK0+GPTHwHbPPI8EQ4HA3rtRNDXScMB+GYi0NMD+kAw+GmpOAD4RH9vcYIImJaAb3Jtb3Nwb3T4ZNwhxwDjAiHXDR/yvCHjAwHbPPI8GxsHAzogggujrde64wIgghAWX5bBuuMCIIIQR1ZU3LrjAhYSCARCMPhCbuMA+EbycyGT1NHQ3vpA0fhBiMjPjits1szOyds8Dh8LCQJqiCFus/LoZiBu8n/Q1PpA+kAwbBL4SfhKxwXy4GT4ACH4a/hs+kJvE9cL/5Mg+GvfMNs88gAKFwA8U2FsdCBkb2Vzbid0IGNvbnRhaW4gYW55IHZhbHVlAhjQIIs4rbNYxwWKiuIMDQEK103Q2zwNAELXTNCLL0pA1yb0BDHTCTGLL0oY1yYg10rCAZLXTZIwbeICFu1E0NdJwgGOgOMNDxoCSnDtRND0BXEhgED0Do6A34kg+Gz4a/hqgED0DvK91wv/+GJw+GMQEQECiREAQ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAD/jD4RvLgTPhCbuMA0x/4RFhvdfhk0ds8I44mJdDTAfpAMDHIz4cgznHPC2FeIMjPkll+WwbOWcjOAcjOzc3NyXCOOvhEIG8TIW8S+ElVAm8RyM+EgMoAz4RAzgH6AvQAcc8LaV4gyPhEbxXPCx/OWcjOAcjOzc3NyfhEbxTi+wAaFRMBCOMA8gAUACjtRNDT/9M/MfhDWMjL/8s/zsntVAAi+ERwb3KAQG90+GT4S/hM+EoDNjD4RvLgTPhCbuMAIZPU0dDe+kDR2zww2zzyABoYFwA6+Ez4S/hK+EP4QsjL/8s/z4POWcjOAcjOzc3J7VQBMoj4SfhKxwXy6GXIz4UIzoBvz0DJgQCg+wAZACZNZXRob2QgZm9yIE5GVCBvbmx5AELtRNDT/9M/0wAx+kDU0dD6QNTR0PpA0fhs+Gv4avhj+GIACvhG8uBMAgr0pCD0oR4dABRzb2wgMC41OC4yAAAADCD4Ye0e2Q==";
  // Gettind a code from Index StateInit
  const tvc = await provider?.splitTvc(INDEX_BASE_64);
  if (!tvc?.code) throw new Error("tvc code is empty");
  const ZERO_ADDRESS = "0:0000000000000000000000000000000000000000000000000000000000000000";
  // Salt structure that we already know
  const saltStruct = [
    { name: "zero_address", type: "address" },
    { name: "owner", type: "address" },
    { name: "type", type: "fixedbytes3" }, // according on standards, each index salted with string 'nft'
  ];

  const { code: saltedCode } = await provider.setCodeSalt({
    code: tvc?.code,
    salt: {
      structure: saltStruct,
      abiVersion: "2.1",
      data: {
        zero_address: new Address(ZERO_ADDRESS), // just pass it here for code hash you need
        owner: new Address(ownerAddress),
        type: btoa("nft"),
      },
    },
  });
  return saltedCode;
};

export const getNftsByIndexesGQL = async (provider, indexAddresses) => {
  const nfts = [];
  const nftAddresses = await Promise.all(
    indexAddresses.map(async indexAddress => {
      try {
        // for GRAPHQL
        const indexContract = new provider.Contract(indexAbi, indexAddress.id);

        const indexInfo = await indexContract.methods.getInfo({ answerId: 0 }).call();

        const nftContract = new provider.Contract(nftAbi, indexInfo.nft);

        const getNftInfo = await nftContract.methods.getInfo({ answerId: 0 }).call();

        const getJsonAnswer = await nftContract.methods.getJson({ answerId: 0 }).call();

        nfts.push({
          ...getJsonAnswer,
          ...getNftInfo,
          ...indexInfo,
          last_paid: indexAddress.last_paid,
        });
      } catch (error) {
        return false;
      }
    }),
  );
  return nfts;
};

export const getNftsByIndexes = async (provider, indexAddresses) => {
  const nfts = [];
  const nftAddresses = await Promise.all(
    indexAddresses.map(async indexAddress => {
      try {
        // for RPC
        const indexContract = new provider.Contract(indexAbi, indexAddress);
        // for GRAPHQL
        // const indexContract = new provider.Contract(indexAbi, indexAddress.id);

        const indexInfo = await indexContract.methods.getInfo({ answerId: 0 }).call();

        const nftContract = new provider.Contract(nftAbi, indexInfo.nft);

        const getNftInfo = await nftContract.methods.getInfo({ answerId: 0 }).call();

        const getJsonAnswer = await nftContract.methods.getJson({ answerId: 0 }).call();

        nfts.push({
          ...getJsonAnswer,
          ...getNftInfo,
          ...indexInfo,
          last_paid: indexAddress.last_paid,
        });
      } catch (error) {
        return false;
      }
    }),
  );
  return nfts;
};

export const get_nft_by_address = async (provider, nft_address) => {
  if (nft_address == undefined || !provider) return;
  const nftContract = new provider.Contract(nftAbi, nft_address);
  const nft_json = await nftContract.methods.getJson({ answerId: 0 }).call();
  const getNftInfo = await nftContract.methods.getInfo({ answerId: 0 }).call();

  let nft = {
    ...JSON.parse(nft_json.json),
    ...getNftInfo,
    isListed: false,
    price: "0",
  };
  return nft;
};

export const getAddressesFromIndex = async (standaloneProvider, codeHash, last_nft_addr) => {
  const addresses = await standaloneProvider.getAccountsByCodeHash({
    codeHash,
    continuation: last_nft_addr,
    limit: 25,
  });
  return addresses;
};
// ---- all functions used for rpc or graphql nft fetch ----

// getting nft info with listing info
export const directSell_nft_info = async (provider, nft_manager) => {
  try {
    const contract = new provider.Contract(DirectSell, new Address(nft_manager));
    const data = await contract?.methods?.get_listing_data({ answerId: 0 }).call();
    return data;
  } catch (error) {
    console.log(error);
  }
};

// Graphql Collection NFTs
export const loadNFTs_collection = async (provider, collection_address, last_nft_addr, client, last_paid) => {
  try {
    const nftCodeHash = await getNftCodeHash(provider, collection_address);
    if (!nftCodeHash) {
      return;
    }

    const query = `query {
      accounts(
        filter: {
          workchain_id: { eq: 0 }
          code_hash: {
            eq: "${nftCodeHash}"
          }
          ${last_paid ? `last_paid: { lt: ${last_paid} }` : ""}
        }
        orderBy: [{ path: "last_paid", direction: DESC }]
        limit: 25
      ) {
        id
        balance(format: DEC)
        last_paid
      }
    }`;

    const { result } = await client.net.query({ query });

    client.close();

    const nftURLs = await getCollectionItems(provider, result.data.accounts);
    return {
      nfts: nftURLs,
      continuation: result.data.accounts[result.data.accounts.length - 1].last_paid,
    };
  } catch (e) {
    console.error(e);
  }
};

// load NFTs using RPC
export const loadNFTs_collection_RPC = async (provider, collection_address, last_nft_addr) => {
  try {
    const nftCodeHash = await getNftCodeHash(provider, collection_address);
    console.log({ nftCodeHash });
    if (!nftCodeHash) {
      return;
    }
    const nftAddresses = await getNftAddresses(nftCodeHash, provider, last_nft_addr);
    const { continuation } = nftAddresses;
    if (!nftAddresses || !nftAddresses.accounts.length) {
      if (nftAddresses && !nftAddresses.accounts.length);
      return;
    }
    const nftURLs = await getCollectionItems(provider, nftAddresses.accounts);
    return { nfts: nftURLs, continuation };
  } catch (e) {
    console.error(e);
  }
};

export const getNftAddresses = async (codeHash, provider, last_nft_addr) => {
  const addresses = await provider.getAccountsByCodeHash({
    codeHash,
    continuation: undefined || last_nft_addr,
    limit: 25,
  });
  return addresses;
};

// // Graphql method for fetching user NFTs
export const loadNFTs_user = async (provider, ownerAddress, last_paid, client, onChainFilterNFT) => {
  try {
    // Take a salted code
    const saltedCode = await saltCode(provider, ownerAddress);
    // Hash it
    const codeHash = await provider.getBocHash(saltedCode);
    if (!codeHash) {
      return;
    }

    let query;
    if (onChainFilterNFT === "newestFirst") {
      query = `query {
        accounts(
          filter: {
            workchain_id: { eq: 0 }
            code_hash: {
              eq: "${codeHash}"
            }
            ${last_paid ? `last_paid: { lt: ${last_paid} }` : ""}
          }
          orderBy: [{ path: "last_paid", direction: DESC }]
          limit: 25
        ) {
          id
          balance(format: DEC)
          last_paid
        }
      }`;
    } else {
      query = `query {
        accounts(
          filter: {
            workchain_id: { eq: 0 }
            code_hash: {
              eq: "${codeHash}"
            }
            ${last_paid ? `last_paid: { lt: ${last_paid} }` : ""}
          }
          orderBy: [{ path: "last_paid", direction: ASC }]
          limit: 15
        ) {
          id
          balance(format: DEC)
          last_paid
        }
      }`;
    }

    const { result } = await client.net.query({ query });
    client.close();

    // Fetch all image URLs
    const nfts = await getNftsByIndexesGQL(provider, result.data.accounts);
    return {
      nfts,
      continuation: result.data.accounts[result.data.accounts.length - 1].last_paid,
    };
  } catch (e) {
    console.error(e);
  }
};

// JRPC METHOD for fetching user NFTs
export const loadNFTs_user_RPC = async (provider, ownerAddress, last_nft_addr) => {
  try {
    // Take a salted code
    const saltedCode = await saltCode(provider, ownerAddress);
    // Hash it
    const codeHash = await provider.getBocHash(saltedCode);
    if (!codeHash) {
      return;
    }

    const indexesAddresses = await getAddressesFromIndex(provider, codeHash, last_nft_addr);
    const { continuation } = indexesAddresses;
    if (!indexesAddresses || !indexesAddresses.accounts.length) {
      if (indexesAddresses && !indexesAddresses.accounts.length) return;
    }
    // Fetch all image URLs
    const nfts = await getNftsByIndexes(provider, indexesAddresses.accounts);
    return { nfts, continuation };
  } catch (e) {
    console.error(e);
  }
};

// creating nft in only DB
export const create_nft_database = async (data, nft_address, signer_address) => {
  let obj = {
    NFTAddress: nft_address,
    ownerAddress: data.owner._address,
    managerAddress: data.manager._address,
    imageURL: data?.preview?.source,
    metadata: data?.files[0]?.source,
    name: data.name,
    description: data.description,
    properties: data.attributes,
    NFTCollection: data.collection._address,
    signer_address: signer_address,
  };
  createNFT(obj);
};

// list nft for sale
export const list_nft = async (
  prev_nft_Owner,
  prev_nft_Manager,
  nft_address,
  collection_address,
  price,
  venomProvider,
  signer_address,
  nft,
  onchainNFTData,
  royaltyPercent,
  royaltyAddress,
) => {
  console.log({
    prev_nft_Owner,
    prev_nft_Manager,
    nft_address,
    collection_address,
    price,
    venomProvider,
    signer_address,
    nft,
    onchainNFTData,
    royaltyPercent,
    royaltyAddress,
  });
  try {
    // checking nft owners across database and onchain
    if (!onchainNFTData) {
      const nft_onchain = await get_nft_by_address(venomProvider, nft_address);
      let OnChainOwner = nft_onchain?.owner?._address;
      let OnChainManager = nft_onchain?.manager?._address;

      if (OnChainOwner != prev_nft_Owner || OnChainManager != prev_nft_Manager) {
        const updateNFTData = await update_verified_nft_data(OnChainOwner, OnChainManager, nft_address);
        alert("This NFT is not owned by you!");
        return false;
      }
    }

    if (onchainNFTData) {
      const createNFTInDatabase = await create_nft_database(nft, nft_address, signer_address);
    }

    const factory_contract = new venomProvider.Contract(FactoryDirectSell, FactoryDirectSellAddress);

    const payload = await factory_contract.methods
      .generatePayload({
        answerId: 0,
        price: parseFloat(price) * ONE_VENOM,
        royalty: parseFloat(royaltyPercent) * 1000,
        royalty_address: royaltyAddress,
      })
      .call();

    const { total_cost: listing_cost } = await factory_contract.methods.get_listing_amount({ answerId: 0 }).call();

    const nft_contract = new venomProvider.Contract(nftAbi, nft_address);

    const output = await nft_contract.methods
      .changeManager({
        newManager: FactoryDirectSellAddress,
        sendGasTo: new Address(signer_address),
        callbacks: [[FactoryDirectSellAddress, { value: listing_cost, payload: payload.payload }]],
      })
      .send({
        from: new Address(signer_address),
        amount: (parseInt(listing_cost) + parseInt(extra_venom_fees)).toString(),
      });

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    if (output) {
      await wait(5000);
      const nft_onchain = await get_nft_by_address(venomProvider, nft_address);
      let OnChainManager = nft_onchain?.manager?._address;
      let obj = {
        NFTAddress: nft_address,
        isListed: true,
        price: price,
        demandPrice: price,
        new_manager: OnChainManager,
        hash: output ? output?.id?.hash : "",
        from: signer_address,
        to: OnChainManager,
        type: "list",
        wallet_id: signer_address,
        nft_address: nft_address,
        collection_address: collection_address,
      };
      const updateNFTData = await updateNFTListing(obj);
    }
    return true;
  } catch (error) {
    if (error instanceof TvmException) {
      console.log(`TVM Exception: ${error.code}`);
    }
    console.log(error);
    return false;
  }
};

// remove nft for sale
export const cancel_listing = async (
  prev_nft_Owner,
  prev_nft_Manager,
  nft_address,
  collection_address,
  venomProvider,
  signer_address,
) => {
  try {
    // checking nft owners across database and onchain
    const nft_onchain = await get_nft_by_address(venomProvider, nft_address);
    let OnChainOwner = nft_onchain?.owner?._address;
    let OnChainManager = nft_onchain?.manager?._address;

    if (OnChainOwner != prev_nft_Owner || OnChainManager != prev_nft_Manager) {
      const updateNFTData = await update_verified_nft_data(OnChainOwner, OnChainManager, nft_address);
      alert("This NFT is not owned by you!");
      return false;
    }

    const DirectSellContract = new venomProvider.Contract(DirectSell, new Address(prev_nft_Manager));

    let output;
    output = await DirectSellContract.methods.cancel_listing().send({
      from: new Address(signer_address),
      amount: cancel_refundable_fees.toString(),
    });

    if (output) {
      let obj = {
        NFTAddress: nft_address,
        isListed: false,
        price: "0",
        demandPrice: 0,
        new_manager: signer_address,
        hash: output ? output?.id?.hash : "",
        from: prev_nft_Manager,
        to: signer_address,
        saleprice: "0",
        type: "cancel",
        wallet_id: signer_address,
        nft_address: nft_address,
        collection_address: collection_address,
      };
      let updateNFTData = await cancelNFTListing(obj);
    }
    return true;
  } catch (error) {
    if (error instanceof TvmException) {
      console.log(`TVM Exception: ${error.code}`);
    }
    console.log(error);
    return false;
  }
};

export const transfer_nft = async (provider, signer_address, receiver_address, nft_address) => {
  try {
    const contract = new provider.Contract(nftAbi, nft_address);

    await contract
      .methods.transfer({
        to: receiver_address,
        sendGasTo: signer_address,
        callbacks: [],
      })
      .send({
        from: new Address(signer_address),
        amount: (1000000000).toString(),
      });
  } catch (error) { }
};

// buy nft from sale
export const buy_nft = async (
  venomProvider,
  prev_nft_Owner,
  prev_nft_Manager,
  nft_address,
  collection_address,
  salePrice,
  price,
  signer_address,
) => {
  try {
    // checking nft owners across database and onchain
    // const nft_onchain = await get_nft_by_address(venomProvider, nft_address);
    // let OnChainOwner = nft_onchain?.owner?._address;
    // let OnChainManager = nft_onchain?.manager?._address;

    // if (OnChainOwner != prev_nft_Owner || OnChainManager != prev_nft_Manager) {
    //   const updateNFTData = await update_verified_nft_data(OnChainOwner, OnChainManager, nft_address);
    //   alert("This NFT is already sold out!");
    //   return false;
    // }

    const DirectSellContract = new venomProvider.Contract(DirectSell, new Address(prev_nft_Manager));
    // const nft_price = await DirectSellContract.methods.get_nft_price().call();

    let output;
    output = await DirectSellContract.methods
      .buyNft({
        new_nft_holder: new Address(signer_address),
      })
      .send({
        from: new Address(signer_address),
        amount: "210000000000",
        // amount: (parseInt(nft_price.value0) + parseInt(extra_venom_fees)).toString(),
      });

    console.log(output);
    const subscriber = new venomProvider.Subscriber();

    const traceStream = subscriber.trace(output);
    console.log(traceStream);

    traceStream.on(async data => {
      console.log({ data });
      if (data.aborted) {
        // FAIL LOGIC
        traceStream.stopProducer();
        return;
      }
    });

    // if (output) {
    //   let obj = {
    //     NFTAddress: nft_address,
    //     isListed: false,
    //     price: "0",
    //     demandPrice: 0,
    //     new_owner: signer_address,
    //     new_manager: signer_address,
    //     hash: output ? output?.id?.hash : "",
    //     from: prev_nft_Owner,
    //     to: signer_address,
    //     saleprice: salePrice,
    //     type: "sale",
    //     wallet_id: signer_address,
    //     nft_address: nft_address,
    //     collection_address: collection_address,
    //   };
    //   const updateNFTData = await updateNFTsale(obj);
    // }

    return true;
  } catch (error) {
    console.log({ error });
    if (error instanceof TvmException) {
      console.log(`TVM Exception: ${error.code}`);
    }
    console.log(error);
    return false;
  }
};

// bulk buy cart nfts sale
export const bulk_buy_nfts = async (
  provider,
  signer_address,
  ownerAddresses,
  directSell_addr,
  nft_price,
  NFTAddresses,
  NFTCollections,
) => {
  try {
    const contract = new provider.Contract(FactoryDirectSell, FactoryDirectSellAddress);

    const buy_amount = await contract.methods
      .get_bulkBuyAmount({
        directSell_addr,
        nft_price,
      })
      .call();

    let output = await contract.methods.bulkBuy({ directSell_addr, nft_price }).send({
      from: new Address(signer_address),
      amount: (parseInt(buy_amount.value0) + extra_venom_fees).toString(),
    });

    if (output) {
      let obj = {
        NFTAddresses: NFTAddresses,
        NFTCollections: NFTCollections,
        NFTPrices: nft_price,
        ownerAddresses: ownerAddresses,
        managerAddresses: directSell_addr,
        signer_address: signer_address,
        hash: output ? output?.id?.hash : "undefined",
      };
      const updateNFTListings = await updateNFTSaleBulk(obj);
    }

    return true;
  } catch (error) {
    if (error instanceof TvmException) {
      console.log(`TVM Exception: ${error.code}`);
    }
    return false;
  }
};

// venom price fetch USD
// const fetchVenomPrice = async () => {
//   try {
//     let response = await axios.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=VENOM', {
//       headers: {
//         'X-CMC_PRO_API_KEY': '13135295-fed2-4277-b155-3823aef06cfa',
//       },
//     });

//     console.log({ response })
//   } catch (error) {
//     console.log(error);
//   }
// }

// -------------- offer feature starts here ----------------

// export const FactoryMakeOfferAddress = new Address(
//   "0:0873216d824c458aaa8f2e6015ef6e7af15768c0cb3f804e93754325407e2b41",
// );
// export const WVenomAddress = new Address("0:2c3a2ff6443af741ce653ae4ef2c85c2d52a9df84944bbe14d702c3131da3f14");

// make an offer on NFT
// export const MakeOpenOffer = async (
//   provider,
//   signer_address,
//   onchainNFTData,
//   nft,
//   nft_address,
//   client,
//   oldOffer,
//   offerAmount,
//   offerExpiration,
//   prev_nft_Owner,
//   collection_address,
// ) => {
//   try {
//     if (onchainNFTData) {
//       const createNFTInDatabase = await create_nft_database(nft, nft_address, signer_address);
//     }

//     const contract = new provider.Contract(TokenRoot, WVenomAddress);

//     const tokenWalletAddress = await contract.methods
//       .walletOf({
//         answerId: 0,
//         walletOwner: new Address(signer_address),
//       })
//       .call();

//     const tokenWalletContract = new provider.Contract(TokenWallet, new Address(tokenWalletAddress.value0.toString()));

//     const factoryContract = new provider.Contract(FactoryMakeOffer, FactoryMakeOfferAddress);

//     const afterEvent = async event => {
//       // saving new offer to database
//       const addoffer = await addOffer(
//         signer_address,
//         offerAmount,
//         event?.data
//           ? event?.data?.new_offer_contract
//           : "0:0000000000000000000000000000000000000000000000000000000000000000",
//         offerExpiration,
//         nft_address,
//       );
//     };

//     // event
//     const subscriber = new Subscriber(provider);
//     const contractEvents = factoryContract.events(subscriber);
//     contractEvents.on(async event => {
//       console.log(event);
//       afterEvent(event);
//     });

//     const now = moment().add(1, "day").unix();

//     const makeOfferFee = await factoryContract.methods.makeOffer_fee({ answerId: 0 }).call();

//     const load = await client.abi.encode_boc({
//       params: [
//         { name: "nft_address", type: "address" },
//         { name: "old_offer", type: "address" },
//         { name: "validity", type: "uint128" },
//       ],
//       data: {
//         nft_address: nft_address,
//         old_offer: oldOffer,
//         validity: now.toString(),
//       },
//     });

//     // sending transaction
//     let output = await tokenWalletContract.methods
//       .transfer({
//         amount: parseFloat(offerAmount) * 1000000000,
//         recipient: FactoryMakeOfferAddress,
//         deployWalletValue: 0,
//         remainingGasTo: new Address(signer_address),
//         notify: true,
//         payload: load.boc,
//       })
//       .send({
//         from: new Address(signer_address),
//         amount: (parseFloat(makeOfferFee.value0) + 100000000).toString(),
//       });

//     // updating the outbidded offer in database
//     if (
//       oldOffer != "" &&
//       oldOffer != "0:0000000000000000000000000000000000000000000000000000000000000000" &&
//       oldOffer != undefined
//     ) {
//       const getOfferContract = await getOfferWithOfferContract(oldOffer);
//       const updateOutbiddedOffer = await updateOffer("outbidded", getOfferContract?._id);
//     }

//     // adding activity in DB
//     if (output) {
//       let obj = {
//         hash: output?.id?.hash ? output?.id?.hash : "",
//         from: signer_address,
//         to: prev_nft_Owner,
//         type: "offer",
//         price: offerAmount,
//         wallet_id: signer_address,
//         nft_address: nft_address,
//         collection_address: collection_address,
//       };
//       const add_activity = await addActivity(obj);
//     }

//     const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
//     await wait(10000);
//     return true;
//   } catch (error) {
//     if (error instanceof TvmException) {
//       console.log(`TVM Exception: ${error.code}`);
//     }
//     console.log(error);
//     return false;
//   }
// };

// // cancel offer
// export const cancel_offer = async (
//   offer_address,
//   provider,
//   nft_address,
//   signer_address,
//   prev_nft_Owner,
//   collection_address,
//   selectedOfferId,
// ) => {
//   const contract = new provider.Contract(make_offer_abi, offer_address);
//   let output = await contract.methods.return_offer().send({
//     from: new Address(signer_address),
//     amount: (100000000).toString(),
//   });

//   // updating offer in DB
//   const removeOffer = await updateOffer("cancelled", selectedOfferId);

//   // adding activity in DB
//   if (output) {
//     let obj = {
//       hash: output?.id?.hash ? output?.id?.hash : "",
//       from: signer_address,
//       to: prev_nft_Owner,
//       type: "canceloffer",
//       wallet_id: signer_address,
//       nft_address: nft_address,
//       collection_address: collection_address,
//     };
//     const add_activity = await addActivity(obj);
//   }

//   return true;
// };

// // accept offer
// export const accept_offer = async (
//   offer_address,
//   offerPrice,
//   from,
//   provider,
//   nft_address,
//   signer_address,
//   prev_nft_Owner,
//   prev_nft_Manager,
//   collection_address,
//   stampedFloor,
// ) => {
//   //function to remove nft listing if listed
//   if (prev_nft_Owner != prev_nft_Manager) {
//     if (
//       window.confirm(
//         "you cannot accept the offer if the NFT is listed on marketplace, do you want to proceed to cancel the nft listing before accepting the offer ?",
//       )
//     ) {
//       const cancel_nft_list = await cancel_listing(
//         prev_nft_Owner,
//         prev_nft_Manager,
//         nft_address,
//         collection_address,
//         provider,
//         signer_address,
//         stampedFloor,
//       );

//       if (!cancel_nft_list) return;
//     } else {
//       return;
//     }
//   }

//   // sending accept offer transaction
//   const nft_contract = new provider.Contract(nftAbi, nft_address);
//   const output = await nft_contract.methods
//     .changeManager({
//       newManager: new Address(offer_address),
//       sendGasTo: new Address(signer_address),
//       callbacks: [[new Address(offer_address), { value: "1000000000", payload: "" }]],
//     })
//     .send({
//       from: new Address(signer_address),
//       amount: (1500000000).toString(),
//     });

//   // removing all other offers of the nft
//   const resetOffers = await removeAllOffers(nft_address);

//   if (resetOffers) {
//     let obj = {
//       NFTAddress: nft_address,
//       isListed: false,
//       price: "0",
//       demandPrice: 0,
//       new_owner: from,
//       new_manager: from,
//       hash: output ? output?.id?.hash : "",
//       from: prev_nft_Owner,
//       to: signer_address,
//       saleprice: offerPrice,
//       type: "sale",
//       wallet_id: from,
//       nft_address: nft_address,
//       collection_address: collection_address
//     };
//     const updateNFTData = await updateNFTsale(obj);
//   }

//   return true;
// };
