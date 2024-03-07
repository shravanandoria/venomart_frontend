// def
import { useEffect, useState } from "react";
import { TonClientContextProvider } from "../context/tonclient";

// components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// styles
import "../styles/globals.css";
import "../styles/custom.css";
import "../styles/tailwind.css";
import "../styles/Home.module.css";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

//Wallet Connect
import { initVenomConnect } from "../utils/wallet_connect";
import { COLLECTION_ADDRESS } from "../utils/user_nft";

// mongo imports
import { ThirdwebProvider } from "@thirdweb-dev/react";
import Script from "next/script";
import { useRouter } from "next/router";

// import { ChakraProvider } from "@chakra-ui/react";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // default values
  const venomPrice = 0.19;
  const venomTPS = 98400;
  const currency = "VENOM";
  const blockChain = "Venom Testnet";
  const webURL = "https://venomart.io/";
  const blockURL = "https://testnet.venomscan.com/";
  const apiFetchURL = "https://testnet-api.venomscan.com/v1/accounts";
  const defaultCollectionAddress = COLLECTION_ADDRESS;
  const defTheme = "light";

  // other valuesgit
  const adminAccount = [
    "0:481b34e4d5c41ebdbf9b0d75f22f69b822af276c47996c9e37a89e1e2cb05580",
    "0:f9a0684d617dd1379ed7c6dc0926b0f34a4e8941b14673f7e6244990db5cfeab",
    "0:bf6adad7315850d05e010c55ea46f84e0aecfb4788783a31fc0694a7a6436883",
  ];

  // enable trading on marketplace 
  const EnableMakeOffer = false;
  const EnableNFTCancel = true;
  const EnableNFTList = true;
  const EnableNFTSale = true;

  // variables
  const [theme, setTheme] = useState(defTheme);
  const [venomConnect, setVenomConnect] = useState();
  const [venomProvider, setVenomProvider] = useState();
  const [vnmBalance, setVnmBalance] = useState("");

  const [signer_address, set_signer_address] = useState("");
  const [standalone, set_standalone] = useState();

  const [cartNFTs, setCartNFTs] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [anyModalOpen, setAnyModalOpen] = useState(false);

  // featured collections
  const featuredCollections = [
    {
      id: 1,
      collectionName: "Venomons",
      collectionAddress: "0:f269fddbe59ea50f57451d7434e411d4f6cfed9a1f8cda83f575263eae3095d9",
      items: 1000,
      coverImage: "https://ipfs.io/ipfs/QmedApN5MhBQhkXJKoD4RHrLq31Ho4xgJPZtyqCAbVtwTW/venomons.jpg",
      collectionLogo: "https://ipfs.io/ipfs/QmZzvNhQbz8T5aRuBrjf44tAFYrWvjhwnU9kCDJBB4QMdw/logo.jpg",
      className: "mb-6 md:flex md:w-1/2 md:items-center",
    },
    {
      id: 2,
      collectionName: "Venom Alligators",
      collectionAddress: "0:c36c4939e3ae582f4e9f7215f36bc39e89a1796e6a32260dec762cf53c137dd2",
      items: 2000,
      coverImage: "https://ipfs.io/ipfs/QmUP4egVXhGqxdvVBbs95cdiBTV6R2ayRoHszcdcgZ7d1G/alilogo.gif",
      collectionLogo: "https://ipfs.io/ipfs/QmUP4egVXhGqxdvVBbs95cdiBTV6R2ayRoHszcdcgZ7d1G/alilogo.gif",
      className: "mb-6 md:flex md:w-1/2 md:items-center",
    },
  ];

  // web stats
  const websiteStats = [
    {
      nftCollection: 65,
      mintedNFTs: 1243820,
      mintVolume: 833780,
    },
  ];

  // copyURL function
  function copyURL() {
    const el = document.createElement("input");
    el.value = window.location.href;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    alert("Successfully copied the URL!!");
  }

  // connect wallet start
  const init = async () => {
    const _venomConnect = await initVenomConnect();
    setVenomConnect(_venomConnect);
  };

  const getAddress = async provider => {
    const providerState = await provider?.getProviderState?.();
    return providerState?.permissions.accountInteraction?.address.toString();
  };

  const checkAuth = async _venomConnect => {
    const auth = await _venomConnect?.checkAuth();
    if (auth) await getAddress(_venomConnect);
  };

  const onConnect = async provider => {
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

  const onProviderReady = async provider => {
    const venomWalletAddress = provider ? await getAddress(provider) : undefined;
    set_signer_address(venomWalletAddress);
    return venomWalletAddress;
  };

  const connect_wallet = async () => {
    if (!venomConnect) return;
    await venomConnect.connect();
  };

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

  useEffect(() => {
    const defThemeLocal = localStorage.getItem("WebsiteTheme");
    if (defThemeLocal == null) {
      setTheme("light");
    } else {
      setTheme(defThemeLocal);
    }
    init();
  }, []);

  useEffect(() => {
    if (signer_address == undefined) {
      connect_wallet();
    }
  }, [signer_address]);

  useEffect(() => {
    if (anyModalOpen) {
      document.body.style.overflow = "hidden";
    }
    if (!anyModalOpen) {
      document.body.style.overflow = "scroll";
      document.body.style.overflowX = "hidden";
    }
  }, [anyModalOpen]);

  useEffect(() => {
    setAnyModalOpen(false);
  }, [router.pathname]);

  //GRAPHQL CONFIGS
  const config = {
    network: {
      endpoints: ["https://gql-testnet.venom.foundation/graphql"],
    },
  };

  return (
    <ThirdwebProvider clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENTID}>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />

      <Script strategy="lazyOnload">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
        page_path: window.location.pathname,
        });
    `}
      </Script>
      <Navbar
        theme={theme}
        setTheme={setTheme}
        signer_address={signer_address}
        apiFetchURL={apiFetchURL}
        connectWallet={connect_wallet}
        onDisconnect={onDisconnect}
        blockURL={blockURL}
        vnmBalance={vnmBalance}
        setVnmBalance={setVnmBalance}
        adminAccount={adminAccount}
      />
      {/* <ChakraProvider> */}
      <TonClientContextProvider config={config}>
        <Component
          {...pageProps}
          theme={theme}
          standalone={standalone}
          apiFetchURL={apiFetchURL}
          venomProvider={venomProvider}
          signer_address={signer_address}
          defaultCollectionAddress={defaultCollectionAddress}
          blockURL={blockURL}
          blockChain={blockChain}
          currency={currency}
          webURL={webURL}
          copyURL={copyURL}
          connectWallet={connect_wallet}
          EnableMakeOffer={EnableMakeOffer}
          adminAccount={adminAccount}
          featuredCollections={featuredCollections}
          websiteStats={websiteStats}
          topUsers={topUsers}
          setTopUsers={setTopUsers}
          anyModalOpen={anyModalOpen}
          setAnyModalOpen={setAnyModalOpen}
          cartNFTs={cartNFTs}
          setCartNFTs={setCartNFTs}
          venomPrice={venomPrice}
          vnmBalance={vnmBalance}
          setVnmBalance={setVnmBalance}
          EnableNFTList={EnableNFTList}
          EnableNFTCancel={EnableNFTCancel}
          EnableNFTSale={EnableNFTSale}
        />
      </TonClientContextProvider>
      {/* </ChakraProvider> */}
      <Footer
        cartNFTs={cartNFTs}
        setCartNFTs={setCartNFTs}
        setAnyModalOpen={setAnyModalOpen}
        theme={theme}
        signer_address={signer_address}
        onDisconnect={onDisconnect}
        venomPrice={venomPrice}
        venomTPS={venomTPS}
        venomProvider={venomProvider}
        connectWallet={connect_wallet}
        EnableNFTSale={EnableNFTSale}
      />
    </ThirdwebProvider>
  );
}
