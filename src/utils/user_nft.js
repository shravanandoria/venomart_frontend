import { Address } from "everscale-inpage-provider";
import indexAbi from "../../abi/Index.abi.json";
import nftAbi from "../../abi/Nft.abi.json";
import collectionAbi from "../../abi/CollectionDrop.abi.json";
import marketplaceAbi from "../../abi/Marketplace.abi.json";
import FactoryDirectSell from "../../new_abi/FactoryDirectSell.abi.json";
import DirectSell from "../../new_abi/DirectSell.abi.json";
import moment from "moment";
import {
  createNFT,
  updateNFTListing,
  cancelNFTListing,
  updateNFTsale,
  update_verified_nft_data,
  updateNFTSaleBulk,
} from "./mongo_api/nfts/nfts";
import {
  Subscriber,
  ProviderRpcClient,
  TvmException,
} from "everscale-inpage-provider";
import { EverscaleStandaloneClient } from "everscale-standalone-client";

import FactoryMakeOffer from "../../new_abi/FactoryMakeOffer.abi.json";
import MakeOfferABI from "../../new_abi/MakeOffer.abi.json";
import { addOffer } from "./mongo_api/offer/offer";

import TokenWallet from "../../abi/TokenWallet.abi.json";
import TokenRoot from "../../abi/TokenRoot.abi.json";
// import TokenWallet from "../../new_abi/TokenWallet.abi.json";
// import TokenRoot from "../../new_abi/TokenRoot.abi.json";

export class MyEver {
  constructor() {}
  ever = () => {
    return new ProviderRpcClient({
      fallback: () =>
        EverscaleStandaloneClient.create({
          connection: {
            id: 1000,
            group: "venom_testnet",
            type: "jrpc",
            data: {
              endpoint: "https://jrpc-testnet.venom.foundation/rpc",
            },
          },
        }),
    });
  };
}

// STRICT -- dont change this values, this values are used in transactions
export const nft_minting_fees = 1000000000; //adding 9 zeros at the end makes it 1 venom
export const collection_minting_fees = 3000000000;
export const cancel_refundable_fees = 100000000;
export const buy_refundable_fees = 1000000000;
export const platform_fees = 2.5; //value in percent 2.5%
// dont change this values, this values are used in transactions -- STRICT

export const COLLECTION_ADDRESS =
  "0:332fea94780031e602c3362d89799a60424ccfeae769821d4907f69521d4c22b";

export const MARKETPLACE_ADDRESS =
  "0:a8cb89e61f88965012e44df30ca2281ecf406c71167c6cd92badbb603107a55d";

export const FactoryDirectSellAddress = new Address(
  "0:bd49983602ab2155fd23d4bad4a2913e9bd014a3c8d1b3269c06dc5545b99451"
);

export const FactoryMakeOfferAddress = new Address(
<<<<<<< HEAD
  "0:99448bdc1f27987e0706ba4968062d886869ca83ab7e58f4d6cc7ce85e17df00"
=======
  "0:68b578e7668caba0aa60dde6e1b958981dba7c6e52d955eb5b480542222f1711"
>>>>>>> 4900ee2739e19f2f49b96bc8f35217bc0a6f1b34
);

export const WVenomAddress = new Address(
  "0:2c3a2ff6443af741ce653ae4ef2c85c2d52a9df84944bbe14d702c3131da3f14"
);

export const bulk_buy_nfts = async (
  provider,
  signer_address,
  ownerAddresses,
  directSell_addr,
  nft_price,
  NFTAddresses,
  NFTCollections
) => {
  try {
    const contract = new provider.Contract(
      FactoryDirectSell,
      FactoryDirectSellAddress
    );

    const buy_amount = await contract.methods
      .get_bulkBuyAmount({
        answerId: 0,
        directSell_addr,
        nft_price,
      })
      .call();

    let output = await contract.methods
      .bulkBuy({ directSell_addr, nft_price })
      .send({
        from: new Address(signer_address),
        amount: parseFloat(buy_amount.value0).toString(),
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

export const MakeOpenOffer = async (
  provider,
  signer_address,
  nft_address,
  client,
  oldOffer,
  offerAmount,
  offerExpiration
) => {
  try {
    const contract = new provider.Contract(TokenRoot, WVenomAddress);

    const tokenWalletAddress = await contract.methods
      .walletOf({
        answerId: 0,
        walletOwner: new Address(signer_address),
      })
      .call();

    const tokenWalletContract = new provider.Contract(
      TokenWallet,
      new Address(tokenWalletAddress.value0.toString())
    );

    const factoryContract = new provider.Contract(
      FactoryMakeOffer,
      FactoryMakeOfferAddress
    );

    const res = await factoryContract.methods.read_code({ answerId: 0 }).call();
    console.log(res);
    const now = moment().add(1, "day").unix();

    const makeOfferFee = await factoryContract.methods
      .makeOffer_fee({ answerId: 0 })
      .call();

    const load = await client.abi.encode_boc({
      params: [
        { name: "nft_address", type: "address" },
        { name: "old_offer", type: "address" },
        { name: "validity", type: "uint128" },
      ],
      data: {
        nft_address: nft_address,
        old_offer: oldOffer,
        validity: now.toString(),
      },
    });

    await tokenWalletContract.methods
      .transfer({
        amount: parseFloat(offerAmount) * 1000000000,
        recipient: FactoryMakeOfferAddress,
        deployWalletValue: 0,
        remainingGasTo: new Address(signer_address),
        notify: true,
        payload: load.boc,
      })
      .send({
        from: new Address(signer_address),
        amount: (parseFloat(makeOfferFee.value0) + 100000000).toString(),
      });

    const addoffer = await addOffer(
      signer_address,
      offerAmount,
      offerExpiration,
      nft_address
    );

    const data = await factoryContract.methods
      .read_code({ answerId: 0 })
      .call();

    console.log(data);
    return true;
  } catch (error) {
    if (error instanceof TvmException) {
      console.log(`TVM Exception: ${error.code}`);
    }
    console.log(error);
    return false;
  }
};

// Extract an preview field of NFT's json
export const getNftImage = async (provider, nftAddress) => {
  const nftContract = new provider.Contract(nftAbi, nftAddress);
  const getJsonAnswer = await nftContract.methods
    .getJson({ answerId: 0 })
    .call();
  // const json = JSON.parse(getJsonAnswer.json);
  const json = JSON.parse(getJsonAnswer.json ?? "{}");
  return json;
};

// Returns array with NFT's images urls
export const getCollectionItems = async (provider, nftAddresses) => {
  let nfts = [];

  await Promise.all(
    nftAddresses.map(async (nftAddress) => {
      const imgInfo = await getNftImage(provider, nftAddress.id);
      let obj = { ...imgInfo, nftAddress, last_paid: nftAddress.last_paid };
      nfts.push(obj);
    })
  );
  return nfts;
};

// getting nft code hash
export const getNftCodeHash = async (provider, collection_address) => {
  const collectionAddress = new Address(collection_address);
  const contract = new provider.Contract(collectionAbi, collectionAddress);
  const { codeHash } = await contract.methods
    .nftCodeHash({ answerId: 0 })
    .call({ responsible: true });
  return BigInt(codeHash).toString(16);
};

// Method, that return NFT's addresses by single query with fetched code hash
export const getNftAddresses = async (codeHash, provider, last_nft_addr) => {
  const myEver = new MyEver();
  const addresses = await myEver.ever().getAccountsByCodeHash({
    codeHash,
    continuation: undefined || last_nft_addr,
    limit: 25,
  });
  return addresses;
};

export const saltCode = async (provider, ownerAddress) => {
  // Index StateInit you should take from github. It ALWAYS constant!
  const INDEX_BASE_64 =
    "te6ccgECIAEAA4IAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAgaK2zUfBAQkiu1TIOMDIMD/4wIgwP7jAvILHAYFHgOK7UTQ10nDAfhmifhpIds80wABn4ECANcYIPkBWPhC+RDyqN7TPwH4QyG58rQg+COBA+iogggbd0CgufK0+GPTHwHbPPI8EQ4HA3rtRNDXScMB+GYi0NMD+kAw+GmpOAD4RH9vcYIImJaAb3Jtb3Nwb3T4ZNwhxwDjAiHXDR/yvCHjAwHbPPI8GxsHAzogggujrde64wIgghAWX5bBuuMCIIIQR1ZU3LrjAhYSCARCMPhCbuMA+EbycyGT1NHQ3vpA0fhBiMjPjits1szOyds8Dh8LCQJqiCFus/LoZiBu8n/Q1PpA+kAwbBL4SfhKxwXy4GT4ACH4a/hs+kJvE9cL/5Mg+GvfMNs88gAKFwA8U2FsdCBkb2Vzbid0IGNvbnRhaW4gYW55IHZhbHVlAhjQIIs4rbNYxwWKiuIMDQEK103Q2zwNAELXTNCLL0pA1yb0BDHTCTGLL0oY1yYg10rCAZLXTZIwbeICFu1E0NdJwgGOgOMNDxoCSnDtRND0BXEhgED0Do6A34kg+Gz4a/hqgED0DvK91wv/+GJw+GMQEQECiREAQ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAD/jD4RvLgTPhCbuMA0x/4RFhvdfhk0ds8I44mJdDTAfpAMDHIz4cgznHPC2FeIMjPkll+WwbOWcjOAcjOzc3NyXCOOvhEIG8TIW8S+ElVAm8RyM+EgMoAz4RAzgH6AvQAcc8LaV4gyPhEbxXPCx/OWcjOAcjOzc3NyfhEbxTi+wAaFRMBCOMA8gAUACjtRNDT/9M/MfhDWMjL/8s/zsntVAAi+ERwb3KAQG90+GT4S/hM+EoDNjD4RvLgTPhCbuMAIZPU0dDe+kDR2zww2zzyABoYFwA6+Ez4S/hK+EP4QsjL/8s/z4POWcjOAcjOzc3J7VQBMoj4SfhKxwXy6GXIz4UIzoBvz0DJgQCg+wAZACZNZXRob2QgZm9yIE5GVCBvbmx5AELtRNDT/9M/0wAx+kDU0dD6QNTR0PpA0fhs+Gv4avhj+GIACvhG8uBMAgr0pCD0oR4dABRzb2wgMC41OC4yAAAADCD4Ye0e2Q==";
  // Gettind a code from Index StateInit
  const tvc = await provider?.splitTvc(INDEX_BASE_64);
  if (!tvc?.code) throw new Error("tvc code is empty");
  const ZERO_ADDRESS =
    "0:0000000000000000000000000000000000000000000000000000000000000000";
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

export const getNftsByIndexes = async (provider, indexAddresses) => {
  const nfts = [];
  const nftAddresses = await Promise.all(
    indexAddresses.map(async (indexAddress) => {
      try {
        const indexContract = new provider.Contract(indexAbi, indexAddress.id);

        const indexInfo = await indexContract.methods
          .getInfo({ answerId: 0 })
          .call();

        const nftContract = new provider.Contract(nftAbi, indexInfo.nft);

        const getNftInfo = await nftContract.methods
          .getInfo({ answerId: 0 })
          .call();

        const getJsonAnswer = await nftContract.methods
          .getJson({ answerId: 0 })
          .call();

        nfts.push({
          ...getJsonAnswer,
          ...getNftInfo,
          ...indexInfo,
          last_paid: indexAddress.last_paid,
        });
      } catch (error) {
        return false;
      }
    })
  );
  return nfts;
};

export const get_nft_by_address = async (provider, nft_address) => {
  if (nft_address == undefined) return;
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

// getting nft info with listing info
export const directSell_nft_info = async (provider, nft_manager) => {
  const contract = new provider.Contract(DirectSell, new Address(nft_manager));
  const data = await contract.methods.get_listing_data({ answerId: 0 }).call();
  return data;
};

// loading all the nft collection nfts
export const loadNFTs_collection = async (
  provider,
  collection_address,
  last_nft_addr,
  client,
  last_paid
) => {
  try {
    const myEver = new MyEver();
    const providerRpcClient = myEver.ever();

    const contract = new provider.Contract(
      collectionAbi,
      new Address(COLLECTION_ADDRESS)
    );

    const nftCodeHash = await getNftCodeHash(
      providerRpcClient,
      collection_address
    );
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

    // if (!nftAddresses || !nftAddresses.accounts.length) {
    //   if (nftAddresses && !nftAddresses.accounts.length) setListIsEmpty(true);
    //   return;
    // }

    const nftURLs = await getCollectionItems(provider, result.data.accounts);
    return {
      nfts: nftURLs,
      continuation:
        result.data.accounts[result.data.accounts.length - 1].last_paid,
    };
  } catch (e) {
    console.error(e);
  }
};

export const loadNFTs_user = async (
  provider,
  ownerAddress,
  last_paid,
  client,
  onChainFilterNFT
) => {
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
          limit: 25
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
    const nfts = await getNftsByIndexes(provider, result.data.accounts);
    return {
      nfts,
      continuation:
        result.data.accounts[result.data.accounts.length - 1].last_paid,
    };
  } catch (e) {
    console.error(e);
  }
};

export const create_nft_database = async (
  data,
  nft_address,
  signer_address
) => {
  let obj = {
    NFTAddress: nft_address,
    ownerAddress: data.owner._address,
    managerAddress: data.manager._address,
    imageURL: data.preview.source,
    metadata: data.files[0].source,
    name: data.name,
    description: data.description,
    properties: data.attributes,
    NFTCollection: data.collection._address,
    signer_address: signer_address,
  };
  createNFT(obj);
};

export const create_nft = async (data, signer_address, venomProvider) => {
  try {
    const contract = new venomProvider.Contract(
      collectionAbi,
      new Address(data.collection ? data.collection : COLLECTION_ADDRESS)
    );

    // const subscriber = new Subscriber(venomProvider);
    // const contractEvents = contract.events(subscriber);

    // contractEvents.on(async (event) => {
    //   let obj = {
    //     NFTAddress: event.data.nft._address,
    //     ownerAddress: signer_address,
    //     managerAddress: signer_address,
    //     imageURL: data.image,
    //     title: data.title,
    //     description: data.description,
    //     properties: data.properties,
    //     NFTCollection: data.collection,
    //   };
    //   createNFT(obj);
    // });

    const nft_json = JSON.stringify({
      type: "Basic NFT",
      name: data.name,
      description: data.description,
      preview: {
        source: data.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
        mimetype: "image/png",
      },
      files: [
        {
          source: data.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
          mimetype: "image/png",
        },
      ],
      attributes: data.properties,
      external_url: "https://venomart.io"
    });

    const outputs = await contract.methods
      .mint({
        _json: nft_json,
      })
      .send({
        from: new Address(signer_address),
        amount: "2000000000",
      });
    return true;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

export const has_minted = async (collection_address, signer_address, venomProvider) => {
  if (collection_address == "" || signer_address == "") return;
  const contract = new venomProvider.Contract(
    collectionAbi,
    collection_address
  );
  const _has_minted = await contract.methods
    .hasMinted({ answerId: 0, account: signer_address })
    .call();

  return _has_minted.value0;
};

export const create_launchpad_nft = async (
  data,
  signer_address,
  venomProvider
) => {
  try {
    const contract = new venomProvider.Contract(
      collectionAbi,
      data.collectionAddress
    );

    const { count: id } = await contract.methods
      .totalSupply({ answerId: 0 })
      .call();

    const ipfs_image = data.image;

    const nft_json = JSON.stringify({
      type: "Venom Testnet",
      id: id,
      name: `${data.name} #${id}`,
      description: data.description,
      preview: {
        source: ipfs_image.replace("ipfs://", "https://ipfs.io/ipfs/"),
        mimetype: "image/gif",
      },
      files: [
        {
          source: ipfs_image.replace("ipfs://", "https://ipfs.io/ipfs/"),
          mimetype: ipfs_image.replace("ipfs://", "https://ipfs.io/ipfs/"),
        },
      ],
      attributes: data.properties,
      external_url: "https://venomart.io",
      nft_image: ipfs_image,
      collection_name: data.collectionName,
    });

    const outputs = await contract.methods.mint({ _json: nft_json }).send({
      from: new Address(signer_address),
      amount: (data.mintPrice * 1000000000).toString(),
    });

    return true;
  } catch (error) {
    console.log(error.message);
  }
};

export const create_launchpad_nft_latest = async (
  jsonURL,
  collection_address,
  signer_address,
  venomProvider
) => {
  try {
    let nftData;
    const response = await fetch(jsonURL);
    if (response.ok) {
      nftData = await response.json();
    }

    const contract = new venomProvider.Contract(
      collectionAbi,
      collection_address
    );

    const { count: id } = await contract.methods
      .totalSupply({ answerId: 0 })
      .call();

    const nft_json = JSON.stringify({
      type: "NFT",
      name: `${nftData.name}`,
      description: nftData.description,
      preview: {
        source: nftData?.image?.replace("ipfs://", "https://ipfs.io/ipfs/"),
        mimetype: "image/gif",
      },
      files: [
        {
          source: jsonURL,
          mimetype: "metadata/json",
        },
      ],
      attributes: data.attributes,
      external_url: "https://venomart.io/",
    });

    const outputs = await contract.methods.mint({ _json: nft_json }).send({
      from: new Address(signer_address),
      amount: (data.mintPrice * 1000000000).toString(),
    });

    return true;
  } catch (error) {
    if (error instanceof TvmException) {
      console.log(`TVM Exception: ${error.code}`);
    }
    console.log(error.message);
  }
};

export const list_nft = async (
  standalone,
  prev_nft_Owner,
  prev_nft_Manager,
  nft_address,
  collection_address,
  price,
  venomProvider,
  signer_address,
  nft,
  onchainNFTData,
  finalListingPrice,
  newFloorPrice,
  stampedFloor,
  client,
  royaltyPercent,
  royaltyAddress
) => {
  try {
    // checking nft owners across database and onchain
    if (!onchainNFTData) {
      const nft_onchain = await get_nft_by_address(standalone, nft_address);
      let OnChainOwner = nft_onchain?.owner?._address;
      let OnChainManager = nft_onchain?.manager?._address;

      if (
        OnChainOwner != prev_nft_Owner ||
        OnChainManager != prev_nft_Manager
      ) {
        const updateNFTData = await update_verified_nft_data(
          OnChainOwner,
          OnChainManager,
          nft_address
        );
        alert("This NFT is not owned by you!");
        return false;
      }
    }

    if (onchainNFTData) {
      const createNFTInDatabase = await create_nft_database(
        nft,
        nft_address,
        signer_address
      );
    }

    const factory_contract = new venomProvider.Contract(
      FactoryDirectSell,
      FactoryDirectSellAddress
    );

    const listing_fee = await factory_contract.methods
      .get_listing_fee({ answerId: 0 })
      .call();

    const load = await client.abi.encode_boc({
      params: [
        { name: "price", type: "uint128" },
        { name: "royalty", type: "uint128" },
        { name: "royalty_address", type: "address" },
      ],
      data: {
        price: parseFloat(price) * 1000000000,
        royalty: parseFloat(royaltyPercent) * 1000,
        royalty_address: royaltyAddress,
      },
    });

    const nft_contract = new venomProvider.Contract(nftAbi, nft_address);
    const output = await nft_contract.methods
      .changeManager({
        newManager: FactoryDirectSellAddress,
        sendGasTo: new Address(signer_address),
        callbacks: [
          [
            FactoryDirectSellAddress,
            { value: listing_fee.value0, payload: load.boc },
          ],
        ],
      })
      .send({
        from: new Address(signer_address),
        amount: (parseFloat(listing_fee.value0) + 100000000).toString(),
      });

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    if (output) {
      await wait(5000);
      const nft_onchain = await get_nft_by_address(standalone, nft_address);
      let OnChainManager = nft_onchain?.manager?._address;
      let obj = {
        NFTAddress: nft_address,
        isListed: true,
        price: finalListingPrice,
        demandPrice: price,
        new_manager: OnChainManager,
        hash: output ? output?.id?.hash : "",
        from: signer_address,
        to: OnChainManager,
        saleprice: finalListingPrice,
        type: "list",
        wallet_id: signer_address,
        nft_address: nft_address,
        collection_address: collection_address,
        newFloorPrice: parseFloat(newFloorPrice),
        stampedFloor: parseFloat(stampedFloor),
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

export const cancel_listing = async (
  standalone,
  prev_nft_Owner,
  prev_nft_Manager,
  nft_address,
  collection_address,
  venomProvider,
  signer_address,
  stampedFloor
) => {
  try {
    // checking nft owners across database and onchain
    const nft_onchain = await get_nft_by_address(standalone, nft_address);
    let OnChainOwner = nft_onchain?.owner?._address;
    let OnChainManager = nft_onchain?.manager?._address;

    if (OnChainOwner != prev_nft_Owner || OnChainManager != prev_nft_Manager) {
      const updateNFTData = await update_verified_nft_data(
        OnChainOwner,
        OnChainManager,
        nft_address
      );
      alert("This NFT is not owned by you!");
      return false;
    }

    const DirectSellContract = new venomProvider.Contract(
      prev_nft_Manager == MARKETPLACE_ADDRESS ? marketplaceAbi : DirectSell,
      new Address(prev_nft_Manager)
    );

    let output;
    if (prev_nft_Manager == MARKETPLACE_ADDRESS) {
      output = await DirectSellContract.methods
        .cancel_listing({
          nft_address,
        })
        .send({
          from: new Address(signer_address),
          amount: "100000000",
        });
    } else {
      output = await DirectSellContract.methods.cancel_listing().send({
        from: new Address(signer_address),
        amount: "100000000",
      });
    }

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
        stampedFloor: parseFloat(stampedFloor),
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

export const buy_nft = async (
  provider,
  standalone,
  prev_nft_Owner,
  prev_nft_Manager,
  nft_address,
  collection_address,
  salePrice,
  price,
  signer_address,
  royalty,
  royalty_address,
  stampedFloor
) => {
  try {
    // checking nft owners across database and onchain
    const nft_onchain = await get_nft_by_address(standalone, nft_address);
    let OnChainOwner = nft_onchain?.owner?._address;
    let OnChainManager = nft_onchain?.manager?._address;

    if (OnChainOwner != prev_nft_Owner || OnChainManager != prev_nft_Manager) {
      const updateNFTData = await update_verified_nft_data(
        OnChainOwner,
        OnChainManager,
        nft_address
      );
      alert("This NFT is already sold out!");
      return false;
    }

    const DirectSellContract = new provider.Contract(
      prev_nft_Manager == MARKETPLACE_ADDRESS ? marketplaceAbi : DirectSell,
      new Address(prev_nft_Manager)
    );

    const fees = (parseInt(price) + 1000000000).toString();

    // const nft_price = await DirectSellContract.methods
    //   .nft_price_cal({ answerId: 0 })
    //   .call();

    const subscriber = new Subscriber(provider);
    const contractEvents = DirectSellContract.events(subscriber);
    contractEvents.on(async (event) => {
      console.log(event);
    });

    let output;
    if (prev_nft_Manager == MARKETPLACE_ADDRESS) {
      output = await DirectSellContract.methods
        .buyNft({
          sendRemainingGasTo: new Address(signer_address),
          nft_address: new Address(nft_address),
          royalty: royalty,
          royalty_address: new Address(royalty_address),
        })
        .send({
          from: new Address(signer_address),
          amount: fees,
        });
    } else {
      output = await DirectSellContract.methods
        .buyNft({
          new_nft_holder: new Address(signer_address),
        })
        .send({
          from: new Address(signer_address),
          amount: fees,
        });
    }

    if (output) {
      let obj = {
        NFTAddress: nft_address,
        isListed: false,
        price: "0",
        demandPrice: 0,
        new_owner: signer_address,
        new_manager: signer_address,
        hash: output ? output?.id?.hash : "",
        from: prev_nft_Owner,
        to: signer_address,
        saleprice: salePrice,
        type: "sale",
        wallet_id: signer_address,
        nft_address: nft_address,
        collection_address: collection_address,
        newFloorPrice: 0,
        stampedFloor: parseFloat(stampedFloor),
      };
      const updateNFTData = await updateNFTsale(obj);
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
