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
import defLogo from "../../public/deflogo.png";
import defBack from "../../public/defback.png";

//Wallet Connect
import { initVenomConnect } from "@/utils/wallet_connect";
import { COLLECTION_ADDRESS } from "@/utils/user_nft";

// mongo imports 
import { check_user } from "@/utils/mongo_api/user/user";
import { get_collections } from "@/utils/mongo_api/collection/collection";


export default function App({ Component, pageProps }) {
  // default values
  const currency = "VENOM";
  const blockChain = "Venom Testnet";
  const webURL = "https://venomart.space/";
  const blockURL = "https://testnet.venomscan.com/";
  const apiFetchURL = "https://testnet-api.venomscan.com/v1/accounts";
  const defaultCollectionAddress = COLLECTION_ADDRESS;
  const defTheme = "dark";

  // other values 
  const adminAccount = "0:481b34e4d5c41ebdbf9b0d75f22f69b822af276c47996c9e37a89e1e2cb05580";
  const MintNFTStatus = false;
  const MintCollectionStatus = false;

  // variables
  const [theme, setTheme] = useState(defTheme);
  const [venomConnect, setVenomConnect] = useState();
  const [venomProvider, setVenomProvider] = useState();

  const [signer_address, set_signer_address] = useState("");
  const [standalone, set_standalone] = useState();

  const [loading, setLoading] = useState(false);
  const [collections, set_collections] = useState([]);

  // copyURL function 
  function copyURL() {
    const el = document.createElement('input');
    el.value = window.location.href;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert("Successfully copied the URL!!")
  }

  // fetching all collections 
  const fetch_all_collections = async () => {
    setLoading(true);
    const res = await get_collections();
    set_collections(res.data);
    setLoading(false);
  };

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

  useEffect(() => {
    const defThemeLocal = localStorage.getItem("WebsiteTheme");
    if (defThemeLocal == null) {
      setTheme("dark");
    }
    else {
      setTheme(defThemeLocal);
    }
    init();
  }, []);

  useEffect(() => {
    if (signer_address == undefined) return;
    check_user(signer_address);
  }, [signer_address]);

  useEffect(() => {
    fetch_all_collections();
  }, []);


  return (
    <>
      <Navbar
        theme={theme}
        setTheme={setTheme}
        signer_address={signer_address}
        apiFetchURL={apiFetchURL}
        connectWallet={connect_wallet}
        onDisconnect={onDisconnect}
        MintNFTStatus={MintNFTStatus}
        MintCollectionStatus={MintCollectionStatus}
        blockURL={blockURL}
      />
      <Component
        {...pageProps}
        theme={theme}
        standalone={standalone}
        venomProvider={venomProvider}
        signer_address={signer_address}
        defaultCollectionAddress={defaultCollectionAddress}
        blockURL={blockURL}
        blockChain={blockChain}
        currency={currency}
        webURL={webURL}
        copyURL={copyURL}
        collections={collections}
        loading={loading}
        connectWallet={connect_wallet}
        MintNFTStatus={MintNFTStatus}
        MintCollectionStatus={MintCollectionStatus}
        adminAccount={adminAccount}
      />
      <Footer
        theme={theme}
        signer_address={signer_address}
        onDisconnect={onDisconnect}
        adminAccount={adminAccount}
        MintNFTStatus={MintNFTStatus}
        MintCollectionStatus={MintCollectionStatus}
      />
      <Analytics />
    </>
  );
}
