import { Address } from "everscale-inpage-provider";
import indexAbi from "../../abi/abi/Index.abi.json";
import nftAbi from "../../abi/abi/Nft.abi.json";
import collectionAbi from "../../abi/abi/Collection.abi.json";
import marketplaceAbi from "../../abi/abi/Marketplace.abi.json";
import { ThirdwebStorage } from "@thirdweb-dev/storage";
import { venomProvider } from "./wallet_info";

const storage = new ThirdwebStorage();

export const COLLECTION_ADDRESS =
  "0:f7a905b222847612294e633e9bbe400972418251450cdff86c9bf42301cbe634";
export const MARKETPLACE_ADDRESS =
  "0:8c87608d6b37163d967d17128c9842b247b0eeb69d478892f982f07a71dbb5f4";

// Extract an preview field of NFT's json
export const getNftImage = async (provider, nftAddress) => {
  const nftContract = new provider.Contract(nftAbi, nftAddress);
  // calling getJson function of NFT contract
  const getJsonAnswer = await nftContract.methods
    .getJson({ answerId: 0 })
    .call();

  const json = JSON.parse(getJsonAnswer.json ?? "{}");
  return json;
};

// Returns array with NFT's images urls
export const getCollectionItems = async (provider, nftAddresses) => {
  return Promise.all(
    nftAddresses.map(async (nftAddress) => {
      const imgInfo = await getNftImage(provider, nftAddress);
      return imgInfo;
    })
  );
};

export const getNftCodeHash = async (provider) => {
  const collectionAddress = new Address(COLLECTION_ADDRESS);
  const contract = new provider.Contract(collectionAbi, collectionAddress);
  const { codeHash } = await contract.methods
    .nftCodeHash({ answerId: 0 })
    .call({ responsible: true });
  // console.log()
  return BigInt(codeHash).toString(16);
};

// Method, that return NFT's addresses by single query with fetched code hash
export const getNftAddresses = async (codeHash) => {
  const addresses = await standaloneProvider?.getAccountsByCodeHash({
    codeHash,
  });
  console.log(addresses);
  return addresses?.accounts;
};

export const loadNFTs_collection = async (provider) => {
  try {
    const nftCodeHash = await getNftCodeHash(provider);
    if (!nftCodeHash) {
      return;
    }
    const nftAddresses = await getNftAddresses(nftCodeHash);
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

  let nft = {
    ...JSON.parse(nft_json.json),
    ...getNftInfo,
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
  console.log({ data: data });
  try {
    const ipfs_image =
      typeof data.image == "string"
        ? data.image
        : await storage.upload(data.image);

    const nft_json = JSON.stringify({
      type: "Basic NFT",
      id: 0,
      name: data.name,
      description: data.description,
      preview: {
        source: ipfs_image.replace("ipfs://", "https://ipfs.io/ipfs/"),
        mimetype: "image/png",
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
      collection_name: data.collection,
    });

    const contract = new venomProvider.Contract(
      collectionAbi,
      COLLECTION_ADDRESS
    );

    const { count: id } = await contract.methods
      .totalSupply({ answerId: 0 })
      .call();

    const outputs = await contract.methods.mintNft({ json: nft_json }).send({
      from: new Address(signer_address),
      amount: "1000000000",
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const list_nft = async (nft_address, venomProvider) => {
  const marektplace_contract = new venomProvider.Contract(
    marketplaceAbi,
    MARKETPLACE_ADDRESS
  );

  const nft_contract = new venomProvider.Contract(nftAbi, nftAbi);
  const outputs = await nft_contract.methods
    .listToken({
      nft_address,
      price,
    })
    .send({
      from: new Address(signer_address),
      amount: "1000000000",
    });
  console.log(outputs);
};
