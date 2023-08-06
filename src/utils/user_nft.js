import { Address } from "everscale-inpage-provider";
import indexAbi from "../../abi/Index.abi.json";
import nftAbi from "../../abi/Nft.abi.json";
import collectionAbi from "../../abi/CollectionDrop.abi.json";
import marketplaceAbi from "../../abi/Marketplace.abi.json";
import { user_info } from "./mongo_api/user/user";

import axios from "axios";

export const COLLECTION_ADDRESS =
  "0:bca1c325a2fc922383c8f519f2d282fa3f538aed910c9afda8d569d7d1cea88a";

export const MARKETPLACE_ADDRESS =
  "0:8a67e6ca3d6b101026238a0c1e0ce1e2e7f11a4773feff934608701f01ec4cfb";

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
      console.log(imgInfo);
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
export const getNftAddresses = async (codeHash, provider) => {
  const addresses = await provider?.getAccountsByCodeHash({
    codeHash,
  });
  return addresses?.accounts;
};

// loading all the nft collection nfts
export const loadNFTs_collection = async (provider, collection_address) => {
  try {
    const nftCodeHash = await getNftCodeHash(provider, collection_address);
    if (!nftCodeHash) {
      return;
    }

    const nftAddresses = await getNftAddresses(nftCodeHash, provider);
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

// Method, that return Index'es addresses by single query with fetched code hash
export const getAddressesFromIndex = async (standaloneProvider, codeHash) => {
  const addresses = await standaloneProvider?.getAccountsByCodeHash({
    codeHash,
  });
  return addresses?.accounts;
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

  const marketplace_contract = new provider.Contract(
    marketplaceAbi,
    MARKETPLACE_ADDRESS
  );

  const res = await marketplace_contract.methods
    .get_nft_by_address({
      nft_address,
    })
    .call();

  let nft = {
    ...JSON.parse(nft_json.json),
    ...getNftInfo,
    isListed: res.value0.currentlyListed,
    price: res.value0.price,
  };
  return nft;
};

export const loadNFTs_user = async (provider, ownerAddress) => {
  try {
    // Take a salted code
    const saltedCode = await saltCode(provider, ownerAddress);
    // Hash it
    const codeHash = await provider.getBocHash(saltedCode);
    if (!codeHash) {
      return;
    }
    // Fetch all Indexes by hash
    const indexesAddresses = await getAddressesFromIndex(provider, codeHash);
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

export const create_nft = async (data, signer_address, venomProvider) => {
  const contract = new venomProvider.Contract(
    collectionAbi,
    COLLECTION_ADDRESS
  );

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

    const outputs = await contract.methods.mintNft({ json: nft_json }).send({
      from: new Address(signer_address),
      amount: "1000000000",
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const create_launchpad_nft = async (
  data,
  signer_address,
  venomProvider
) => {
  try {
    // const contract = new venomProvider.Contract(
    //   collectionAbi,
    //   data.collectionAddress
    // );

    // const { count: id } = await contract.methods
    //   .totalSupply({ answerId: 0 })
    //   .call();

    const res = await contract.methods.totalMinted({ answerId: 0 }).call();
    console.log(res);

    // const ipfs_image =
    //   typeof data.image == "string"
    //     ? data.image
    //     : await storage.upload(data.image);

    // const nft_json = JSON.stringify({
    //   type: "VenomartPass",
    //   id: id,
    //   name: `${data.name} #${id}`,
    //   description: data.description,
    //   preview: {
    //     source: ipfs_image.replace("ipfs://", "https://ipfs.io/ipfs/"),
    //     mimetype: "image/gif",
    //   },
    //   files: [
    //     {
    //       source: ipfs_image.replace("ipfs://", "https://ipfs.io/ipfs/"),
    //       mimetype: ipfs_image.replace("ipfs://", "https://ipfs.io/ipfs/"),
    //     },
    //   ],
    //   attributes: data.properties.filter((e) => e.type.length > 0),
    //   external_url: "https://venomart.space",
    //   nft_image: ipfs_image,
    //   collection_name: data.collectionName,
    // });
    // const outputs = await contract.methods.mintNft({ json: nft_json }).send({
    //   from: new Address(signer_address),
    //   amount: (data.mintPrice * 1000000000).toString(),
    // });

    // const res = await axios({
    //   url: "/api/user/add_launchpad_user",
    //   method: "POST",
    //   data: {
    //     wallet_id: signer_address,
    //     collection_address: data.collectionAddress,
    //   },
    // });
  } catch (error) {
    console.log(error.message);
  }
};

export const list_nft = async (
  nft_address,
  price,
  venomProvider,
  signer_address
) => {
  const marketplace_contract = new venomProvider.Contract(
    marketplaceAbi,
    MARKETPLACE_ADDRESS
  );

  const nft_contract = new venomProvider.Contract(nftAbi, nft_address);

  const output = await nft_contract.methods
    .changeManager({
      newManager: MARKETPLACE_ADDRESS,
      sendGasTo: signer_address,
      callbacks: [
        {
          nft_price: "2000000000",
          sample_data: "hello world",
        },
      ],
    })
    .send({
      from: new Address(signer_address),
      amount: "200000000",
    });

  const outputs = await marketplace_contract.methods
    .listToken({
      nft_address,
      price,
    })
    .send({
      from: new Address(signer_address),
      amount: "200000000",
    });
};

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

export const buy_nft = async (provider, nft_address, price, signer_address) => {
  const marketplace_contract = new provider.Contract(
    marketplaceAbi,
    MARKETPLACE_ADDRESS
  );

  const res = await marketplace_contract.methods
    .finishAuction({ sendRemainingGasTo: signer_address, nft_address })
    .send({
      from: new Address(signer_address),
      amount: "2000000000",
    });
};
