import React, { useEffect, useState } from 'react';
import { get_all_collections_noskip } from '../collection/collection';
import { MyEver } from '../../user_nft';
import collectionAbi from "../../../../abi/CollectionDrop.abi.json";
import axios from 'axios';

const UpdateSupply = () => {
    const [collections, setCollections] = useState([]);
    const [onchainCollections, setOnchainCollections] = useState([]);

    const [collectionAddress, setCollectionAddress] = useState([]);
    const [collectionTotalSupply, setCollectionTotalSupply] = useState([]);

    const fetchCollections = async () => {
        const collectionsJSON = await get_all_collections_noskip();
        if (collectionsJSON) {
            setCollections(collections => [...collections, ...collectionsJSON]);
        }
    };

    const checkAndUpdateSupply = async () => {
        for (let i = 0; i < collections.length; i++) {
            try {
                let myEver = new MyEver();
                const providerRpcClient = myEver.ever();
                const contract = new providerRpcClient.Contract(collectionAbi, collections[i].contractAddress);
                const totalSupply = await contract.methods.totalSupply({ answerId: 0 }).call();
                if (collections[i].TotalSupply < totalSupply.count) {
                    setOnchainCollections(onchainCollections => [...onchainCollections, { contractAddress: collections[i].contractAddress, totalSupply: totalSupply.count }]);
                    setCollectionAddress(collectionAddress => [...collectionAddress, collections[i].contractAddress]);
                    setCollectionTotalSupply(collectionTotalSupply => [...collectionTotalSupply, totalSupply.count]);
                    console.log({ address: collections[i].contractAddress })
                    // console.log({ collectionAddress, collectionTotalSupply })
                }
                if (i === (collections?.length - 1)) {
                    // console.log({ collectionAddress, collectionTotalSupply })
                    const res = await axios({
                        url: `/api/cron/update_supply`,
                        method: "POST",
                        data: {
                            contractAddress: collectionAddress,
                            TotalSupply: collectionTotalSupply,
                        },
                    });
                }
            } catch (error) {
                console.log(error.message);
            }
        }
    }


    useEffect(() => {
        if (collections.length !== 0) return;
        fetchCollections();
    }, []);

    useEffect(() => {
        if (!MyEver) return;
        checkAndUpdateSupply();
    }, [collections, MyEver]);

    useEffect(() => {
        console.log({ collectionAddress })
    }, [collectionAddress]);

    useEffect(() => {
        console.log({ collectionTotalSupply })
    }, [collectionTotalSupply]);

    return (
        <div>
            {collections?.map((e, index) => (
                <div key={index}>
                    {index} Contract Address: {e?.contractAddress}, Total Supply: {e?.TotalSupply}
                </div>
            ))}
        </div>
    );
}

export default UpdateSupply;
