import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ThirdwebStorage } from "@thirdweb-dev/storage";
import Loader from "@/components/Loader";
import Head from "next/head";
import { BsDiscord } from "react-icons/bs";
import { update_profile } from "@/utils/mongo_api/user/user";
import { check_user } from "@/utils/mongo_api/user/user";

const EditProfile = ({ signer_address, theme }) => {
  const storage = new ThirdwebStorage();
  const [coverImg_preview, set_coverImg_preview] = useState("");
  const [profImg_preview, set_profImg_preview] = useState("");
  const [loading, set_loading] = useState(false);
  const [data, set_data] = useState({
    user_name: "",
    bio: "",
    email: "",
    walletAddress: signer_address,
    profileImage: "",
    coverImage: "",
    twitter: "",
    discord: "",
    customLink: "",
    isArtist: false,
  });

  const handleChange = (e) => {
    set_data({ ...data, [e.target.name]: e.target.value });
  };

  const handle_submit = async (e) => {
    e.preventDefault();
    await update_profile(data);
  };

  const get_user = async () => {
    const data = await check_user(signer_address);
    console.log({ data });
    set_data({
      ...data.user,
      twitter: data.user.socials[0] ? data.user.socials[0] : "",
      discord: data.user.socials[1] ? data.user.socials[1] : "",
      customLink: data.user.socials[2] ? data.user.socials[2] : "",
    });
  };

  useEffect(() => {
    set_loading(true);
    if (!signer_address) return;
    set_data({ ...data, walletAddress: signer_address });
    get_user();

    set_loading(false);
  }, [signer_address]);

  return loading ? (
    <Loader theme={theme} />
  ) : (
    <>
      <Head>
        <title>Edit Profile - Venomart Marketplace</title>
        <meta
          name="description"
          content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>

      <form onSubmit={handle_submit} className={`${theme}`}>
        {/* <!-- Banner --> */}
        <div className="relative pt-24 dark:bg-jacarta-900">
          {data.coverImage == "" && coverImg_preview == "" ? (
            <Image
              src="/gradient_dark.jpg"
              alt="banner"
              width={100}
              height={100}
              className="h-[18.75rem] w-[100%] object-cover"
            />
          ) : (
            <Image
              src={
                typeof data.coverImage == "string"
                  ? data.coverImage.replace("ipfs://", "https://ipfs.io/ipfs/")
                  : coverImg_preview
              }
              alt="banner"
              width={100}
              height={100}
              className="h-[18.75rem] w-[100%] object-cover"
            />
          )}
          <div className="container relative -translate-y-4">
            <div className="group absolute right-0 bottom-4 flex items-center rounded-lg bg-white py-2 px-4 font-display text-sm hover:bg-accent">
              <input
                onChange={(e) => {
                  set_coverImg_preview(URL.createObjectURL(e.target.files[0]));
                  set_data({ ...data, coverImage: e.target.files[0] });
                }}
                type="file"
                accept="image/*"
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="mr-1 h-4 w-4 fill-jacarta-400 group-hover:fill-white"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z"></path>
              </svg>
              <span className="mt-0.5 block group-hover:text-white">
                Edit cover photo
              </span>
            </div>
          </div>
        </div>

        {/* <!-- Edit Profile --> */}
        <section className="relative py-16 dark:bg-jacarta-800">
          <div className="container">
            <div className="mx-auto max-w-[48.125rem] md:flex">
              {/* left tab  */}
              <div className="mb-12 md:w-1/2 md:pr-8">
                <div className="mb-6">
                  <label
                    htmlFor="profile-username"
                    className="mb-1 block font-display text-sm text-jacarta-700 dark:text-white"
                  >
                    Username<span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="user_name"
                    onChange={handleChange}
                    value={data.user_name}
                    id="profile-username"
                    className="w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent dark:border-jacarta-600 dark:bg-jacarta-700 dark:placeholder:text-jacarta-300 dark:text-jacarta-200"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="profile-bio"
                    className="mb-1 block font-display text-sm text-jacarta-700 dark:text-white"
                  >
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={data.bio}
                    onChange={handleChange}
                    id="profile-bio"
                    className="w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent dark:border-jacarta-600 dark:bg-jacarta-700  dark:placeholder:text-jacarta-300 dark:text-jacarta-200"
                    placeholder="Tell the world your story!"
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="profile-email"
                    className="mb-1 block font-display text-sm text-jacarta-700 dark:text-white"
                  >
                    Email address
                  </label>
                  <p className="mb-3 text-2xs dark:text-jacarta-300">
                    your email address will be safe with us
                  </p>
                  <input
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    id="profile-email"
                    className="w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent dark:border-jacarta-600 dark:bg-jacarta-700 dark:placeholder:text-jacarta-300 dark:text-jacarta-200"
                    placeholder="Enter email"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="profile-email"
                    className="mb-1 block font-display text-sm text-jacarta-700 dark:text-white"
                  >
                    Are you a NFT artist ?
                  </label>
                  <select
                    onChange={() =>
                      set_data({ ...data, isArtist: !data.isArtist })
                    }
                    defaultValue={data.isArtist}
                    name="isArtist"
                    className=" dark:text-jacarta-200 w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 dark:border-jacarta-600 dark:bg-jacarta-700 dark:placeholder:text-jacarta-300"
                  >
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="mb-1 block font-display text-sm text-jacarta-700 dark:text-white">
                    Wallet Address
                  </label>
                  <button
                    type="button"
                    className="flex w-full overflow-hidden text-ellipsis whitespace-nowrap select-none items-center rounded-lg border border-jacarta-100 bg-white py-3 px-4 hover:bg-jacarta-50 dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-jacarta-300 cursor-default"
                  >
                    <span>{signer_address}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="ml-auto mb-px h-4 w-4 fill-jacarta-500 dark:fill-jacarta-300"
                    >
                      <path fill="none" d="M0 0h24v24H0z"></path>
                      <path d="M7 7V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4v3.993c0 .556-.449 1.007-1.007 1.007H3.007A1.006 1.006 0 0 1 2 20.993l.003-12.986C2.003 7.451 2.452 7 3.01 7H7zm2 0h6.993C16.549 7 17 7.449 17 8.007V15h3V4H9v3zM4.003 9L4 20h11V9H4.003z"></path>
                    </svg>
                  </button>
                </div>

                <button
                  type="submit"
                  className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                >
                  Update Profile
                </button>
              </div>

              {/* right tab  */}
              <div className="flex flex-col lg:ml-20">
                <div className="flex space-x-5 flex-wrap">
                  <div className="shrink-0">
                    <div className="relative inline-block">
                      {data.profileImage == "" && profImg_preview == "" ? (
                        <Image
                          src="/deflogo.png"
                          alt="logo"
                          width={100}
                          height={100}
                          className="rounded-xl border-[1px] border-gray-500 dark:border-jacarta-600 h-[130px] w-[auto]"
                        />
                      ) : (
                        <Image
                          src={
                            typeof data.profileImage == "string"
                              ? data.profileImage.replace(
                                  "ipfs://",
                                  "https://ipfs.io/ipfs/"
                                )
                              : profImg_preview
                          }
                          width={100}
                          height={100}
                          alt="logo"
                          className="rounded-xl border-[5px] border-white dark:border-jacarta-600 h-[130px] w-[auto]"
                        />
                      )}
                      <div className="group absolute -right-3 -bottom-2 h-8 w-8 overflow-hidden rounded-full border border-jacarta-100 bg-white text-center hover:border-transparent hover:bg-accent">
                        <input
                          onChange={(e) => {
                            set_profImg_preview(
                              URL.createObjectURL(e.target.files[0])
                            );
                            set_data({
                              ...data,
                              profileImage: e.target.files[0],
                            });
                          }}
                          type="file"
                          accept="image/*"
                          className="absolute top-0 left-0 w-full cursor-pointer opacity-0"
                        />
                        <div className="flex h-full items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="h-4 w-4 fill-jacarta-400 group-hover:fill-white"
                          >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="mb-3 block font-display text-sm text-jacarta-700 dark:text-white">
                      Profile Image
                    </span>
                    <p className="text-sm leading-normal dark:text-jacarta-300">
                      Upload an image or GIF. Max 5mb.
                    </p>
                  </div>
                </div>

                <div className="mb-6 mt-14">
                  <label
                    htmlFor="profile-twitter"
                    className="mb-1 block font-display text-sm text-jacarta-700 dark:text-white"
                  >
                    Social Links
                  </label>
                  <div className="relative">
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fab"
                      data-icon="twitter"
                      className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 fill-jacarta-300 dark:fill-jacarta-400"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                    </svg>
                    <input
                      type="text"
                      name="twitter"
                      value={data.twitter}
                      onChange={handleChange}
                      id="profile-twitter"
                      className="w-full rounded-t-lg border-jacarta-100 py-3 pl-10 hover:ring-2 hover:ring-accent/10 focus:ring-inset focus:ring-accent dark:border-jacarta-600 dark:bg-jacarta-700 dark:placeholder:text-jacarta-300 dark:text-jacarta-200"
                      placeholder="@twitter"
                    />
                  </div>
                  <div className="relative">
                    <BsDiscord className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 fill-jacarta-300 dark:fill-jacarta-400" />
                    <input
                      name="discord"
                      value={data.discord}
                      type="text"
                      onChange={handleChange}
                      id="profile-discord"
                      className="-mt-px w-full border-jacarta-100 py-3 pl-10 hover:ring-2 hover:ring-accent/10 focus:ring-inset focus:ring-accent dark:border-jacarta-600 dark:bg-jacarta-700  dark:placeholder:text-jacarta-300 dark:text-jacarta-200"
                      placeholder="discord username"
                    />
                  </div>
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 fill-jacarta-300 dark:fill-jacarta-400"
                    >
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.29-2.333A17.9 17.9 0 0 1 8.027 13H4.062a8.008 8.008 0 0 0 5.648 6.667zM10.03 13c.151 2.439.848 4.73 1.97 6.752A15.905 15.905 0 0 0 13.97 13h-3.94zm9.908 0h-3.965a17.9 17.9 0 0 1-1.683 6.667A8.008 8.008 0 0 0 19.938 13zM4.062 11h3.965A17.9 17.9 0 0 1 9.71 4.333 8.008 8.008 0 0 0 4.062 11zm5.969 0h3.938A15.905 15.905 0 0 0 12 4.248 15.905 15.905 0 0 0 10.03 11zm4.259-6.667A17.9 17.9 0 0 1 15.973 11h3.965a8.008 8.008 0 0 0-5.648-6.667z" />
                    </svg>
                    <input
                      value={data.customLink}
                      name="customLink"
                      onChange={handleChange}
                      type="url"
                      id="profile-website"
                      className="-mt-px w-full rounded-b-lg border-jacarta-100 py-3 pl-10 hover:ring-2 hover:ring-accent/10 focus:ring-inset focus:ring-accent dark:border-jacarta-600 dark:bg-jacarta-700  dark:placeholder:text-jacarta-300 dark:text-jacarta-200"
                      placeholder="example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </>
  );
};

export default EditProfile;
