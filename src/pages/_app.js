// def
import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";

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
import { COLLECTION_ADDRESS } from "@/utils/user_nft";

export default function App({ Component, pageProps }) {
  // default values
  const blockURL = "https://venomart.space/";
  const baseURL = "https://testnet-api.venomscan.com/v1/accounts";
  const defaultCollectionAddress = COLLECTION_ADDRESS;
  const defTheme = "dark";
  const [theme, setTheme] = useState(defTheme);
  const [venomConnect, setVenomConnect] = useState();
  const [venomProvider, setVenomProvider] = useState();

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

  // setting website theme
  useEffect(() => {
    const defThemeLocal = localStorage.getItem("WebsiteTheme");
    setTheme(defThemeLocal);
    init();
  }, []);

  // connect wallet start
  const init = async () => {
    const _venomConnect = await initVenomConnect();
    setVenomConnect(_venomConnect);
  };

  const getAddress = async (provider) => {
    const providerState = await provider?.getProviderState?.();
    return providerState?.permissions.accountInteraction?.address.toString();
  };

  const checkAuth = async (_venomConnect) => {
    const auth = await _venomConnect?.checkAuth();
    if (auth) await getAddress(_venomConnect);
  };

  const onConnect = async (provider) => {
    await onProviderReady(provider);
    setVenomProvider(provider);
  };

  const initStandalone = async () => {
    const standalone = await venomConnect?.getStandalone();
    set_standalone(standalone);
    return standalone;
  };

  const onDisconnect = async () => {
    venomProvider?.disconnect();
    set_signer_address(undefined);
  };

  const onProviderReady = async (provider) => {
    const venomWalletAddress = provider
      ? await getAddress(provider)
      : undefined;
    set_signer_address(venomWalletAddress);
    return venomWalletAddress;
  };

  const connect_wallet = async () => {
    if (!venomConnect) return;
    await venomConnect.connect();
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const off = venomConnect?.on("connect", onConnect);
    if (venomConnect) {
      initStandalone();

      checkAuth(venomConnect);
    }

    return () => {
      off?.();
    };
  }, [venomConnect]);

  // connect wallet end

  return (
    <>
      <Navbar
        theme={theme}
        setTheme={setTheme}
        signer_address={signer_address}
        baseURL={baseURL}
        connectWallet={connect_wallet}
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
