import { Address } from "everscale-inpage-provider";
import indexAbi from "../../abi/Index.abi.json";
import nftAbi from "../../abi/Nft.abi.json";
import collectionAbi from "../../abi/CollectionDrop.abi.json";
import marketplaceAbi from "../../abi/Marketplace.abi.json";
import {
  createNFT,
  updateNFTListing,
  cancelNFTListing,
  updateNFTsale,
} from "./mongo_api/nfts/nfts";
import { addActivity } from "./mongo_api/activity/activity";

import { Subscriber } from "everscale-inpage-provider";
import { ProviderRpcClient, TvmException } from "everscale-inpage-provider";
import { EverscaleStandaloneClient } from "everscale-standalone-client";

const ever = () =>
  new ProviderRpcClient({
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

const listing_fees = 100000000;
const platform_fees = "2500";

export const COLLECTION_ADDRESS =
  "0:3ce49eddf4099caa4c10b4869357af642616f3d71c04fd6eca772131ed9ab7c2";

export const MARKETPLACE_ADDRESS =
  "0:30cc7be3f97e69f902e312a1aa90ee291292ef54f0c81a34cf90d94ba2185697";

// Extract an preview field of NFT's json
export const getNftImage = async (provider, nftAddress) => {
  const nftContract = new provider.Contract(nftAbi, nftAddress);
  const getJsonAnswer = await nftContract.methods
    .getJson({ answerId: 0 })
    .call();
  const json = JSON.parse(getJsonAnswer.json ?? "{}");
  return json;
};

// Returns array with NFT's images urls
export const getCollectionItems = async (provider, nftAddresses) => {
  let nfts = [];

  await Promise.all(
    nftAddresses.map(async (nftAddress) => {
      const imgInfo = await getNftImage(provider, nftAddress);
      let obj = { ...imgInfo, nftAddress };
      nfts.push(obj);
    })
  );
  const sorted_nfts = nfts.sort((a, b) => Number(a.id) - Number(b.id));
  return sorted_nfts;
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
  const addresses = await ever().getAccountsByCodeHash({
    codeHash,
    continuation: undefined || last_nft_addr,
    limit: 15,
  });
  return addresses?.accounts;
};

// loading all the nft collection nfts
export const loadNFTs_collection = async (
  provider,
  collection_address,
  last_nft_addr
) => {
  const contract = new provider.Contract(
    collectionAbi,
    new Address(COLLECTION_ADDRESS)
  );

  const nft_ = await contract.methods.nftCodeHash({ answerId: 0 }).call();

  try {
    const nftCodeHash = await getNftCodeHash(provider, collection_address);
    if (!nftCodeHash) {
      return;
    }

    const nftAddresses = await getNftAddresses(
      nftCodeHash,
      provider,
      last_nft_addr
    );
    if (!nftAddresses || !nftAddresses.length) {
      if (nftAddresses && !nftAddresses.length) setListIsEmpty(true);
      return;
    }
    const nftURLs = await getCollectionItems(provider, nftAddresses);
    return nftURLs;
  } catch (e) {
    console.error(e);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FETCHING USER NFT'S
// const [listIsEmpty_user, setListIsEmpty_user] = useState(false);

export const saltCode = async (provider, ownerAddress) => {
  // Index StateInit you should take from github. It ALWAYS constant!
  const INDEX_BASE_64 =
    "te6ccgECIAEAA4IAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAgaK2zUfBAQkiu1TIOMDIMD/4wIgwP7jAvILHAYFHgOK7UTQ10nDAfhmifhpIds80wABn4ECANcYIPkBWPhC+RDyqN7TPwH4QyG58rQg+COBA+iogggbd0CgufK0+GPTHwHbPPI8EQ4HA3rtRNDXScMB+GYi0NMD+kAw+GmpOAD4RH9vcYIImJaAb3Jtb3Nwb3T4ZNwhxwDjAiHXDR/yvCHjAwHbPPI8GxsHAzogggujrde64wIgghAWX5bBuuMCIIIQR1ZU3LrjAhYSCARCMPhCbuMA+EbycyGT1NHQ3vpA0fhBiMjPjits1szOyds8Dh8LCQJqiCFus/LoZiBu8n/Q1PpA+kAwbBL4SfhKxwXy4GT4ACH4a/hs+kJvE9cL/5Mg+GvfMNs88gAKFwA8U2FsdCBkb2Vzbid0IGNvbnRhaW4gYW55IHZhbHVlAhjQIIs4rbNYxwWKiuIMDQEK103Q2zwNAELXTNCLL0pA1yb0BDHTCTGLL0oY1yYg10rCAZLXTZIwbeICFu1E0NdJwgGOgOMNDxoCSnDtRND0BXEhgED0Do6A34kg+Gz4a/hqgED0DvK91wv/+GJw+GMQEQECiREAQ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAD/jD4RvLgTPhCbuMA0x/4RFhvdfhk0ds8I44mJdDTAfpAMDHIz4cgznHPC2FeIMjPkll+WwbOWcjOAcjOzc3NyXCOOvhEIG8TIW8S+ElVAm8RyM+EgMoAz4RAzgH6AvQAcc8LaV4gyPhEbxXPCx/OWcjOAcjOzc3NyfhEbxTi+wAaFRMBCOMA8gAUACjtRNDT/9M/MfhDWMjL/8s/zsntVAAi+ERwb3KAQG90+GT4S/hM+EoDNjD4RvLgTPhCbuMAIZPU0dDe+kDR2zww2zzyABoYFwA6+Ez4S/hK+EP4QsjL/8s/z4POWcjOAcjOzc3J7VQBMoj4SfhKxwXy6GXIz4UIzoBvz0DJgQCg+wAZACZNZXRob2QgZm9yIE5GVCBvbmx5AELtRNDT/9M/0wAx+kDU0dD6QNTR0PpA0fhs+Gv4avhj+GIACvhG8uBMAgr0pCD0oR4dABRzb2wgMC41OC4yAAAADCD4Ye0e2Q==";
  // Gettind a code from Index StateInit
  const tvc = await provider.splitTvc(INDEX_BASE_64);
  if (!tvc.code) throw new Error("tvc code is empty");
  const ZERO_ADDRESS =
    "0:0000000000000000000000000000000000000000000000000000000000000000";
  // Salt structure that we already know
  const saltStruct = [
    { name: "zero_address", type: "address" },
    { name: "owner", type: "address" },
    { name: "type", type: "fixedbytes3" }, // according on standards, each index salted with string 'nft'
  ];
  const { code: saltedCode } = await provider.setCodeSalt({
    code: tvc.code,
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
      const indexContract = new provider.Contract(indexAbi, indexAddress);

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
      nfts.push({ ...getJsonAnswer, ...getNftInfo, ...indexInfo });
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

// Method, that return Index'es addresses by single query with fetched code hash
export const getAddressesFromIndex = async (
  standaloneProvider,
  codeHash,
  last_nft_addr
) => {
  const addresses = await ever().getAccountsByCodeHash({
    codeHash,
    continuation: undefined || last_nft_addr,
    limit: 15,
  });
  return addresses?.accounts;
};

export const loadNFTs_user = async (provider, ownerAddress, last_nft_addr) => {
  try {
    // Take a salted code
    const saltedCode = await saltCode(provider, ownerAddress);
    // Hash it
    const codeHash = await provider.getBocHash(saltedCode);
    if (!codeHash) {
      return;
    }
    // Fetch all Indexes by hash
    const indexesAddresses = await getAddressesFromIndex(
      provider,
      codeHash,
      last_nft_addr
    );
    if (!indexesAddresses || !indexesAddresses.length) {
      if (indexesAddresses && !indexesAddresses.length)
        setListIsEmpty_user(true);
      return;
    }
    // Fetch all image URLs
    const nfts = await getNftsByIndexes(provider, indexesAddresses);
    return nfts;
  } catch (e) {
    console.error(e);
  }
};

export const create_nft_database = async (data, nft_address) => {
  let obj = {
    NFTAddress: nft_address,
    ownerAddress: data.owner._address,
    managerAddress: data.manager._address,
    imageURL: data.preview.source,
    name: data.name,
    description: data.description,
    properties: data.attributes,
    NFTCollection: data.collection._address,
  };
  createNFT(obj);
};

export const create_nft = async (data, signer_address, venomProvider) => {
  const contract = new venomProvider.Contract(
    collectionAbi,
    new Address(data.collection ? data.collection : COLLECTION_ADDRESS)
  );

  const subscriber = new Subscriber(venomProvider);
  const contractEvents = contract.events(subscriber);

  contractEvents.on((event) => {
    console.log({ event });
    let obj = {
      NFTAddress: event.data.nft._address,
      ownerAddress: signer_address,
      managerAddress: signer_address,
      imageURL: data.image,
      title: data.title,
      description: data.description,
      properties: data.properties,
      NFTCollection: data.collection,
    };
    createNFT(obj);
  });

  const { count: id } = await contract.methods
    .totalSupply({ answerId: 0 })
    .call();

  try {
    const nft_json = JSON.stringify({
      type: "Basic NFT",
      id,
      name: data.name,
      description: data.description,
      preview: {
        source: data.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
        mimetype: "image/png",
      },
      files: [
        {
          source: data.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
          mimetype: data.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
        },
      ],
      attributes: data.properties.filter((e) => e.type.length > 0),
      external_url: "https://venomart.space",
      nft_image: data.image,
      collection_name: data.collection,
    });

    const outputs = await contract.methods.mint({ _json: nft_json }).send({
      from: new Address(signer_address),
      amount: "2000000000",
    });

    // contractEvents.unsubscribe();
  } catch (error) {
    console.log(error.message);
  }
};

export const has_minted = async (
  venomProvider,
  collection_address,
  signer_address
) => {
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

    const ipfs_image =
      typeof data.image == "string"
        ? data.image
        : await storage.upload(data.image);

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
      attributes: data.properties.filter((e) => e.type.length > 0),
      external_url: "https://venomart.space",
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

export const list_nft = async (
  nft_address,
  collection_address,
  price,
  venomProvider,
  signer_address,
  nft,
  onchainNFTData
) => {
  if (onchainNFTData) {
    const createNFTInDatabase = await create_nft_database(nft, nft_address);
  }

  const marketplace_contract = new venomProvider.Contract(
    marketplaceAbi,
    MARKETPLACE_ADDRESS
  );

  const _payload = await marketplace_contract.methods
    .generatePayload({ answerId: 0, price: (price * 1000000000).toString() })
    .call();

  const nft_contract = new venomProvider.Contract(nftAbi, nft_address);

  const output = await nft_contract.methods
    .changeManager({
      newManager: new Address(MARKETPLACE_ADDRESS),
      sendGasTo: new Address(signer_address),
      callbacks: [
        [
          new Address(MARKETPLACE_ADDRESS),
          { value: "1000000000", payload: _payload.payload },
        ],
      ],
    })
    .send({
      from: new Address(signer_address),
      amount: (listing_fees + 1000000000).toString(),
    });

  console.log({ output });

  if (output) {
    let obj = {
      NFTAddress: nft_address,
      isListed: true,
      price: price,
      new_manager: MARKETPLACE_ADDRESS,
    };
    await updateNFTListing(obj);

    let activityOBJ = {
      hash: output.id.hash,
      from: signer_address,
      to: MARKETPLACE_ADDRESS,
      price: price,
      type: "list",
      wallet_id: signer_address,
      nft_address: nft_address,
      collection_address: collection_address,
    };
    await addActivity(activityOBJ);
  }
};

export const cancel_listing = async (
  nft_address,
  collection_address,
  venomProvider,
  signer_address
) => {
  const marketplace_contract = new venomProvider.Contract(
    marketplaceAbi,
    MARKETPLACE_ADDRESS
  );

  const output = await marketplace_contract.methods
    .cancel_listing({
      nft_address,
    })
    .send({
      from: new Address(signer_address),
      amount: "100000000",
    });

  console.log({ output });

  if (output) {
    let obj = {
      NFTAddress: nft_address,
      isListed: false,
      price: "0",
      new_manager: signer_address,
    };
    await cancelNFTListing(obj);

    let activityOBJ = {
      hash: output.id.hash,
      from: MARKETPLACE_ADDRESS,
      to: signer_address,
      price: "0",
      type: "cancel",
      wallet_id: signer_address,
      nft_address: nft_address,
      collection_address: collection_address,
    };
    await addActivity(activityOBJ);
  }
};

export const buy_nft = async (
  provider,
  nft_address,
  prev_nft_Owner,
  collection_address,
  salePrice,
  price,
  signer_address,
  royalty,
  royalty_address,
  _platform_fees
) => {
  const marketplace_contract = new provider.Contract(
    marketplaceAbi,
    MARKETPLACE_ADDRESS
  );

  const fees = (parseInt(price) + 1000000000).toString();

  const output = await marketplace_contract.methods
    .buyNft({
      sendRemainingGasTo: new Address(MARKETPLACE_ADDRESS),
      nft_address: new Address(nft_address),
      royalty: royalty,
      royalty_address: new Address(royalty_address),
    })
    .send({
      from: new Address(signer_address),
      amount: fees,
    });

  console.log({ output });

  if (output) {
    let obj = {
      NFTAddress: nft_address,
      isListed: false,
      price: "0",
      new_owner: signer_address,
      new_manager: signer_address,
    };
    await updateNFTsale(obj);

    let activityOBJ = {
      hash: output.id.hash,
      from: prev_nft_Owner,
      to: signer_address,
      price: salePrice,
      type: "sale",
      wallet_id: signer_address,
      nft_address: nft_address,
      collection_address: collection_address,
    };
    await addActivity(activityOBJ);
  }
};

// getting all listed tokens on marketplace
export const get_listed_tokens = async (venomProvider) => {
  const marketplace_contract = new venomProvider.Contract(
    marketplaceAbi,
    MARKETPLACE_ADDRESS
  );

  const res = await marketplace_contract.methods.getAllNFTs().call();
  let nfts = [];

  await Promise.all(
    res.value0.map(async (e) => {
      const nft_contract = new venomProvider.Contract(
        nftAbi,
        e.nft_address._address
      );

      const getNftInfo = await nft_contract.methods
        .getInfo({ answerId: 0 })
        .call();
      const getJsonAnswer = await nft_contract.methods
        .getJson({ answerId: 0 })
        .call();
      let obj = { ...getNftInfo, ...JSON.parse(getJsonAnswer.json), ...e };
      nfts.push(obj);
    })
  );

  return nfts;
};
