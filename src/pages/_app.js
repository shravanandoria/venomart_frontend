// def
import { useEffect, useState } from "react";
import { Analytics } from '@vercel/analytics/react';

// components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// sty;es
import "@/styles/globals.css";
import "@/styles/custom.css";
import "@/styles/tailwind.css";
import "@/styles/Home.module.css";

// images
import testNFT from "../../public/test.jpg";

//Wallet Connect
import VenomConnect from "venom-connect";
import { initVenomConnect } from "@/utils/wallet_connect";
import {
  onConnect,
  checkAuth,
  getAddress,
  onDisconnect,
  onProviderReady,
  venomProvider,
} from "@/utils/wallet_info";
import { loadNFTs_user } from "@/utils/user_nft";
import { COLLECTION_ADDRESS } from "@/utils/user_nft";

export default function App({ Component, pageProps }) {

  // default values
  const blockURL = "https://venomart.space/";
  const baseURL = "https://testnet-api.venomscan.com/v1/accounts";
  const defaultCollectionAddress = COLLECTION_ADDRESS;
  const defTheme = "dark";
  const [theme, setTheme] = useState(defTheme);
  const [venomConnect, setVenomConnect] = useState();
  const [signer_address, set_signer_address] = useState("");
  const [standalone, set_standalone] = useState();

  // test collection array
  const all_collections = [
    {
      Cover: testNFT,
      Logo: testNFT,
      Name: "cover",
      OwnerAddress: "cover",
      CollectionAddress: "cover",
    },
  ];

  // test collection array
  const all_nfts = [
    {
      ImageSrc: testNFT,
      Name: "nft",
      Description: "test descrip",
      Address: "cover",
      tokenId: 1,
      listedBool: true,
      listingPrice: 2,
    },
  ];

  // login 
  const init = async () => {
    const _venomConnect = await initVenomConnect();
    setVenomConnect(_venomConnect);
  };

  // logout 
  const onDisconnect = async () => {
    venomProvider?.disconnect();
    set_signer_address(undefined);
  };

  // setting website theme
  useEffect(() => {
    const defThemeLocal = localStorage.getItem("WebsiteTheme");
    setTheme(defThemeLocal);
    init();
  }, []);

  const venom_init = async () => {
    // connect event handler
    const off = await venomConnect?.on("connect", onConnect);
    if (venomConnect) {
      await checkAuth(venomConnect);
      const addr = await getAddress(venomProvider);
      set_signer_address(addr);
    }
    // just an empty callback, cuz we don't need it
    return () => {
      off?.();
    };
  };

  useEffect(() => {
    venom_init();
  }, [venomConnect]);

  useEffect(() => {
    (async () => {
      const standalone = await venomConnect?.getStandalone();
      set_standalone(standalone);

      if (signer_address && standalone)
        loadNFTs_user(standalone, signer_address);
      // if (!signer_address) setListIsEmpty_user(false);
    })();
  }, [signer_address]);

  return (
    <>
      <Navbar
        theme={theme}
        setTheme={setTheme}
        signer_address={signer_address}
        baseURL={baseURL}
        connectWallet={init}
        onDisconnect={onDisconnect}
      />
      <Component
        {...pageProps}
        theme={theme}
        standalone={standalone}
        signer_address={signer_address}
        defaultCollectionAddress={defaultCollectionAddress}
        blockURL={blockURL}
        all_collections={all_collections}
        all_nfts={all_nfts}
      />
      <Footer theme={theme} />
      <Analytics />
    </>
  );
}
