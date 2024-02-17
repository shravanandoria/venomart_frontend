import Link from "next/link";
import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { useRouter } from "next/router";
import Head from "next/head";
import { create_nft, nft_minting_fees } from "../../utils/user_nft";
import { useStorage } from "@thirdweb-dev/react";
import Image from "next/image";
import venomLogo from "../../../public/venomBG.webp";
import { GoArrowUpRight } from "react-icons/go";
import { BsFillShareFill } from "react-icons/bs";
import { get_user_collections } from "../../utils/mongo_api/collection/collection";

const CreateNFT = ({
    defaultCollectionAddress,
    theme,
    signer_address,
    venomProvider,
    connectWallet,
    MintNFTStatus,
    MintCollectionStatus,
    setAnyModalOpen
}) => {
    const router = useRouter();
    const storage = useStorage();

    const [loading, set_loading] = useState(false);
    const [propModel, setPropModel] = useState(false);
    const [mintModal, setMintModal] = useState(false);
    const [mintSuccessModal, setMintSuccessModal] = useState(false);

    const [preview, set_preview] = useState("");
    const [user_collections, set_user_collections] = useState([]);

    const [data, set_data] = useState({
        collection: defaultCollectionAddress,
        properties: [{ trait_type: "", value: "" }],
    });

    // getting user collections
    const getting_user_collections = async () => {
        if (!signer_address) return;
        const res = await get_user_collections(signer_address, 0);
        if (res) {
            set_user_collections(res);
        }
    };

    const handleChange = (e) => {
        set_data({ ...data, [e.target.name]: e.target.value });
    };

    const handle_change_input = (index, e) => {
        const values = [...data.properties];
        values[index][e.target.name] = e.target.value;
        set_data({ ...data, properties: values });
    };

    const handle_add_field = () => {
        set_data({
            ...data,
            properties: [...data.properties, { trait_type: "", value: "" }],
        });
    };

    const handle_remove_field = (index) => {
        const values = [...data.properties];
        values.splice(index, 1);
        set_data({ ...data, properties: values });
    };

    const handle_submit = async (e) => {
        e.preventDefault();
        setMintModal(true);
        setAnyModalOpen(true);
    };

    const handle_nft_mint = async (e) => {
        e.preventDefault();
        if (!signer_address) {
            connectWallet();
            return;
        }
        if (!data.name && !data.description && !data.image)
            return alert("Please fill complete form");
        set_loading(true);

        const ipfs_image = await storage.upload(data.image);

        let obj = { ...data, image: ipfs_image };

        const creatingNFT = await create_nft(obj, signer_address, venomProvider);
        if (creatingNFT) {
            setMintModal(false);
            setMintSuccessModal(true);
        }
        set_loading(false);
    };

    useEffect(() => {
        getting_user_collections();
    }, [signer_address]);

    return (
        <div className={`${theme}`}>
            <Head>
                <title>Create NFT - Venomart Marketplace</title>
                <meta
                    name="description"
                    content="Create your own NFTs on venom blockchain via venomart create NFT feature"
                />
                <meta
                    name="keywords"
                    content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.webp" />
            </Head>

            {mintModal && (
                <div className="backgroundModelBlur backdrop-blur-lg"></div>
            )}
            {mintSuccessModal && (
                <div className="backgroundModelBlur backdrop-blur-lg"></div>
            )}

            <form
                onSubmit={handle_submit}
                className={`relative py-24 dark:bg-jacarta-900`}
            >
                {MintNFTStatus ? (
                    <div className="container">
                        <h1 className="py-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                            Create NFT
                        </h1>
                        <div className="mx-auto max-w-[48.125rem]">
                            {/* <!-- File Upload --> */}
                            <div className="mb-6">
                                <label className="mb-2 block font-display text-jacarta-700 dark:text-white">
                                    Select Image Or Video
                                    <span className="text-red">*</span>
                                </label>
                                <p className="mb-3 text-2xs dark:text-jacarta-300">
                                    Drag or choose your file to upload
                                </p>

                                {preview ? (
                                    <>
                                        <div>
                                            <img
                                                src={preview}
                                                alt=""
                                                className="h-44 rounded-lg border-2 border-gray-500"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="group relative flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-jacarta-100 bg-white py-20 px-5 text-center dark:border-jacarta-600 dark:bg-jacarta-700 ">
                                        <div className="relative z-10 cursor-pointer">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                width="24"
                                                height="24"
                                                className="mb-4 inline-block fill-jacarta-500 dark:fill-white"
                                            >
                                                <path fill="none" d="M0 0h24v24H0z" />
                                                <path d="M16 13l6.964 4.062-2.973.85 2.125 3.681-1.732 1-2.125-3.68-2.223 2.15L16 13zm-2-7h2v2h5a1 1 0 0 1 1 1v4h-2v-3H10v10h4v2H9a1 1 0 0 1-1-1v-5H6v-2h2V9a1 1 0 0 1 1-1h5V6zM4 14v2H2v-2h2zm0-4v2H2v-2h2zm0-4v2H2V6h2zm0-4v2H2V2h2zm4 0v2H6V2h2zm4 0v2h-2V2h2zm4 0v2h-2V2h2z" />
                                            </svg>
                                            <p className="mx-auto max-w-xs text-xs dark:text-jacarta-300">
                                                JPG, PNG, GIF, SVG. Max size: 100 MB
                                            </p>
                                        </div>
                                        <div className="absolute inset-4 cursor-pointer rounded bg-jacarta-50 opacity-0 group-hover:opacity-100 dark:bg-jacarta-600"></div>
                                        <input
                                            onChange={(e) => {
                                                set_preview(URL.createObjectURL(e.target.files[0]));
                                                set_data({ ...data, image: e.target.files[0] });
                                            }}
                                            type="file"
                                            name="image"
                                            accept="image/*,video/*,audio/*,webgl/*,.glb,.gltf"
                                            id="file-upload"
                                            className="absolute inset-0 z-20 cursor-pointer opacity-0"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* <!-- Name --> */}
                            <div className="mb-6">
                                <label
                                    htmlFor="item-name"
                                    className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                >
                                    Name<span className="text-red">*</span>
                                </label>
                                <input
                                    onChange={handleChange}
                                    name="name"
                                    type="text"
                                    id="item-name"
                                    className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                        ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                        : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                        } `}
                                    placeholder="Item name"
                                    required
                                />
                            </div>

                            {/* <!-- Description --> */}
                            <div className="mb-6">
                                <label
                                    htmlFor="item-description"
                                    className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                >
                                    Description
                                    <span className="text-red">*</span>
                                </label>
                                <p className="mb-3 text-2xs dark:text-jacarta-300">
                                    The description will be included on the nft detail page.
                                </p>
                                <textarea
                                    onChange={handleChange}
                                    name="description"
                                    id="item-description"
                                    className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                        ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                        : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                        } `}
                                    rows="4"
                                    required
                                    placeholder="Provide a detailed description of your item."
                                ></textarea>
                            </div>

                            {/* select collection  */}
                            <div className="relative">
                                <div>
                                    <label className="mb-2 block font-display text-jacarta-700 dark:text-white">
                                        Collection
                                    </label>
                                    <div className="mb-3 flex items-center space-x-2">
                                        <p className="text-2xs dark:text-jacarta-300">
                                            This is the collection where your nft will appear.{" "}
                                            {MintCollectionStatus && (
                                                <Link
                                                    href="/mint/CreateNFTCollection"
                                                    className="underline"
                                                >
                                                    Create a new collection{" "}
                                                </Link>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <select
                                    name="collection"
                                    value={data.collection}
                                    onChange={handleChange}
                                    className={`dropdown my-1 cursor-pointer w-[100%] ${theme == "dark"
                                        ? "dark:bg-jacarta-900 dark:text-white"
                                        : "bg-white text-black"
                                        }`}
                                    required
                                >
                                    <option value={defaultCollectionAddress}>
                                        venomart venom collection
                                    </option>
                                    {user_collections?.map((e, index) => {
                                        return (
                                            <option key={index} value={e.contractAddress}>
                                                {e.name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* <!-- Properties --> */}
                            <div className="relative border-b border-jacarta-100 py-6 dark:border-jacarta-600 mb-6 mt-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width="24"
                                            height="24"
                                            className="mr-2 mt-px h-4 w-4 shrink-0 fill-jacarta-700 dark:fill-white"
                                        >
                                            <path fill="none" d="M0 0h24v24H0z" />
                                            <path d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zM3 14v-2.5h2V11H3v-1h3v2.5H4v.5h2v1H3zm2 5.5H3v-1h2V18H3v-1h3v4H3v-1h2v-.5zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" />
                                        </svg>

                                        <div>
                                            <label className="block font-display text-jacarta-700 dark:text-white">
                                                Properties
                                            </label>
                                            <p className="dark:text-jacarta-300">
                                                Textual traits that show up as rectangles.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-accent bg-white hover:border-transparent hover:bg-accent dark:bg-jacarta-700"
                                        type="button"
                                        id="item-properties"
                                        data-bs-toggle="modal"
                                        data-bs-target="#propertiesModal"
                                        onClick={() => setPropModel(!propModel)}
                                    >
                                        {!propModel ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                width="24"
                                                height="24"
                                                className="fill-accent group-hover:fill-white"
                                            >
                                                <path fill="none" d="M0 0h24v24H0z" />
                                                <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                width="24"
                                                height="24"
                                                className="h-6 w-6 fill-jacarta-500 group-hover:fill-white"
                                            >
                                                <path fill="none" d="M0 0h24v24H0z"></path>
                                                <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"></path>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* <!-- Properties Modal --> */}
                            {propModel && (
                                <div>
                                    <div className="max-w-2xl mb-4">
                                        <div className="modal-content">
                                            <div className="modal-body p-6">
                                                {data.properties.map((e, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative my-3 flex items-center"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => handle_remove_field(index)}
                                                            className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-l-lg border border-r-0 border-jacarta-100 bg-jacarta-50 hover:bg-jacarta-100 dark:border-jacarta-600 dark:bg-jacarta-700"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                width="24"
                                                                height="24"
                                                                className="h-6 w-6 fill-jacarta-500 dark:fill-jacarta-300"
                                                            >
                                                                <path fill="none" d="M0 0h24v24H0z"></path>
                                                                <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"></path>
                                                            </svg>
                                                        </button>

                                                        <div className="flex-1">
                                                            <input
                                                                onChange={(e) =>
                                                                    handle_change_input(index, e)
                                                                }
                                                                value={data.properties[index].trait_type}
                                                                name="trait_type"
                                                                type="text"
                                                                className={`h-12 w-full border border-jacarta-100 focus:ring-inset focus:ring-accent ${theme == "dark"
                                                                    ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                                    : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                                    }`}
                                                                placeholder="Type"
                                                            />
                                                        </div>

                                                        <div className="flex-1">
                                                            <input
                                                                onChange={(e) =>
                                                                    handle_change_input(index, e)
                                                                }
                                                                value={data.properties[index].value}
                                                                name="value"
                                                                type="text"
                                                                className={`h-12 w-full rounded-r-lg border border-jacarta-100 focus:ring-inset focus:ring-accent ${theme == "dark"
                                                                    ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                                    : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                                    }`}
                                                                placeholder="Value"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={handle_add_field}
                                                    className="mt-2 rounded-full border-2 border-accent py-2 px-8 text-center text-sm font-semibold text-accent transition-all hover:bg-accent hover:text-white"
                                                >
                                                    Add More
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* <!-- Submit nft form --> */}
                            <button
                                type="submit"
                                className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white transition-all cursor-pointer"
                            >
                                Mint NFT
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="container">
                        <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                            Minting NFT is disabled
                        </h1>
                        <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                            We will notify once this page goes live again, stay tuned!!
                        </p>
                    </div>
                )}
            </form>

            {mintModal && (
                <div className="afterMintDiv">
                    <form onSubmit={handle_nft_mint} className="modal-dialog max-w-2xl">
                        <div className="modal-content shadow-2xl dark:bg-jacarta-800">
                            <div className="modal-header">
                                <h5 className="modal-title" id="placeBidLabel">
                                    Confirm NFT Minting
                                </h5>
                                {!loading && (
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                        onClick={() => (
                                            setMintModal(false), setAnyModalOpen(false)
                                        )}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width="24"
                                            height="24"
                                            className="h-6 w-6 fill-jacarta-700 dark:fill-white"
                                        >
                                            <path fill="none" d="M0 0h24v24H0z" />
                                            <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* fees and display section  */}
                            <div className="modal-body p-6">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-display text-jacarta-700 text-sm font-semibold dark:text-white">
                                        You are about to mint
                                    </span>
                                </div>
                                <div className="dark:border-jacarta-600 border-jacarta-100 relative flex items-center py-4">
                                    <div className="mr-5 self-start">
                                        <Image
                                            src={preview}
                                            alt="nftPreview"
                                            width="80"
                                            height="80"
                                            className="rounded-2lg"
                                        />
                                    </div>
                                    <div>
                                        <Link
                                            href={`/collection/${data?.collection}`}
                                            className="text-accent text-sm"
                                        >
                                            {data.collection == defaultCollectionAddress ? "venomart venom collection" : (data?.collection?.slice(0, 5) +
                                                "..." +
                                                data?.collection?.slice(63))}
                                        </Link>
                                        <h3 className="font-display text-jacarta-700 mb-1 text-base font-semibold dark:text-white">
                                            {data?.name}
                                        </h3>
                                        <h3 className="text-jacarta-700 mb-1 text-base dark:text-white">
                                            {data?.description}
                                        </h3>
                                    </div>
                                </div>
                                <div className="dark:border-jacarta-600 border-jacarta-100 mb-2 flex items-center justify-between border-b py-2.5">
                                    <span className="font-display text-jacarta-700 hover:text-accent font-semibold dark:text-white">
                                        Minting Fees
                                    </span>
                                    <div className="ml-auto">
                                        <span className="flex items-center whitespace-nowrap">
                                            <span>
                                                <Image
                                                    src={venomLogo}
                                                    height={100}
                                                    width={100}
                                                    className="h-4 w-4 mr-2"
                                                />
                                            </span>
                                            <span className="text-green font-medium tracking-tight">
                                                {nft_minting_fees / 1000000000}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="buyNowTerms"
                                        className="checked:bg-accent dark:bg-jacarta-600 text-accent border-jacarta-200 focus:ring-accent/20 dark:border-jacarta-500 h-5 w-5 self-start rounded focus:ring-offset-0"
                                        required
                                    />
                                    <label
                                        htmlFor="buyNowTerms"
                                        className="dark:text-jacarta-200 text-sm"
                                    >
                                        I am sure, i want to mint this NFT on venom blockchain{" "}
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <div className="flex items-center justify-center space-x-4">
                                    {loading ? (
                                        <button
                                            disabled
                                            type="button"
                                            className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                        >
                                            Minting{" "}
                                            <svg
                                                aria-hidden="true"
                                                className="inline w-6 h-6 ml-3 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                                viewBox="0 0 100 101"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                    fill="currentColor"
                                                />
                                                <path
                                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                    fill="currentFill"
                                                />
                                            </svg>
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                        >
                                            Confirm Mint
                                        </button>
                                    )}
                                </div>
                            </div>
                            {loading && (
                                <h3 className="px-12 mb-6 text-[14px] dark:text-white text-jacarta-700 text-center">
                                    Please do not refresh or leave this page, you will get
                                    a popup after your NFT is minted successfully, hold
                                    tight!
                                </h3>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {mintSuccessModal && (
                <div className="afterMintDiv">
                    <form className="modal-dialog max-w-2xl">
                        <div className="modal-content shadow-2xl dark:bg-jacarta-800">
                            <div className="modal-header">
                                <h5 className="modal-title" id="placeBidLabel">
                                    Success 🥳
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => (setMintSuccessModal(false), setAnyModalOpen(false))}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        className="h-6 w-6 fill-jacarta-700 dark:fill-white"
                                    >
                                        <path fill="none" d="M0 0h24v24H0z" />
                                        <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                                    </svg>
                                </button>
                            </div>

                            <div className="modal-body p-6">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-display text-[18px] font-semibold text-jacarta-700 dark:text-white">
                                        You have successfully minted the {data.name} 🎉🎉🎉 <br /> View your profile to see the
                                        minted NFT 🤗
                                    </span>
                                </div>
                            </div>

                            <div className="modal-footer" style={{ flexWrap: "nowrap" }}>
                                <div className="flex items-center justify-center space-x-4 m-2">
                                    <Link
                                        href={`/profile/${signer_address}`}
                                        className="flex justify-center rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                    >
                                        View
                                        <GoArrowUpRight className="ml-[5px] mt-[2px] text-[20px]" />
                                    </Link>
                                </div>
                                <div className="flex items-center justify-center space-x-4 m-2">
                                    <a
                                        href={`https://twitter.com/intent/tweet?text=Just%20minted%20my%20first%20custom%20NFT%20on%20Venomart%0ATry%20minting%20yours%20now!!%20%F0%9F%98%84%0AHere%20you%20go%20-%20https://venomart.io/mint/CreateNFT%0A%23Venom%20%23venomart%20%23VenomTestnet%20%23VenomNetwork%20%23VenomFoundation`}
                                        target="_blank"
                                        className="flex justify-center rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                    >
                                        Share
                                        <BsFillShareFill className="ml-[8px] mt-[6px] text-[14px]" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CreateNFT;
