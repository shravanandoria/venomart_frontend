import Link from "next/link";
import React, { useState } from "react";
import Loader from "@/components/Loader";
import { useRouter } from "next/router";
import Head from "next/head";
import { create_nft } from "@/utils/user_nft";
import { useStorage } from "@thirdweb-dev/react";

const CreateNFT = ({
  defaultCollectionAddress,
  theme,
  signer_address,
  venomProvider,
  connectWallet,
  MintNFTStatus,
  MintCollectionStatus,
}) => {
  const router = useRouter();
  const storage = useStorage();
  const [loading, set_loading] = useState(false);
  const [propModel, setPropModel] = useState(false);
  const [preview, set_preview] = useState("");
  const [user_collections, set_user_collections] = useState([]);

  const [properties, set_properties] = useState([{ type: "", value: "" }]);
  const [data, set_data] = useState({
    image: "",
    name: "",
    description: "",
    collection: defaultCollectionAddress,
    properties: [{ type: "", value: "" }],
  });

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
      properties: [...data.properties, { type: "", value: "" }],
    });
  };

  const handle_remove_field = (index) => {
    const values = [...data.properties];
    values.splice(index, 1);
    set_data({ ...data, properties: values });
  };

  const handle_submit = async (e) => {
    e.preventDefault();
    if (!signer_address) {
      connectWallet();
      return;
    }
    set_loading(true);
    const ipfs_image = await storage.upload(data.image);

    let obj = { ...data, image: ipfs_image };
    await create_nft(obj, signer_address, venomProvider);
    set_loading(false);
  };

  return (
    <div className={`${theme}`}>
      <Head>
        <title>Create NFT - Venomart Marketplace</title>
        <meta
          name="description"
          content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain"
        />
        <meta
          name="keywords"
          content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>
      {loading ? (
        <Loader theme={theme} />
      ) : (
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
                    <div className="group relative flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-jacarta-100 bg-white py-20 px-5 text-center dark:border-jacarta-600 dark:bg-jacarta-700">
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
                    className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${
                      theme == "dark"
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
                    className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${
                      theme == "dark"
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
                    className={`dropdown my-1 cursor-pointer w-[100%] ${
                      theme == "dark"
                        ? "dark:bg-jacarta-900 dark:text-white"
                        : "bg-white text-black"
                    }`}
                    required
                  >
                    <option>Select Collection</option>
                    <option value={defaultCollectionAddress}>
                      Venomart Marketplace Collection
                    </option>
                    {user_collections?.map((e, index) => {
                      return (
                        <option key={index} value={e.collection_address}>
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
                                  value={data.properties[index].type}
                                  name="type"
                                  type="text"
                                  className={`h-12 w-full border border-jacarta-100 focus:ring-inset focus:ring-accent ${
                                    theme == "dark"
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
                                  className={`h-12 w-full rounded-r-lg border border-jacarta-100 focus:ring-inset focus:ring-accent ${
                                    theme == "dark"
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
                  Create NFT
                </button>
              </div>
            </div>
          ) : (
            <div className="container">
              <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                Creating NFT is disabled
              </h1>
              <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                We will notify once this page goes live again, stay tuned!!
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default CreateNFT;
