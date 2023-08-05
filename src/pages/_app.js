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

import { ThirdwebProvider } from "@thirdweb-dev/react";

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
  const adminAccount =
    "0:481b34e4d5c41ebdbf9b0d75f22f69b822af276c47996c9e37a89e1e2cb05580";
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

  // custom array of all launches
  const customLaunchpad = [
    // status should be Upcoming, Live, Ended, Sold Out and date format is mm/dd/2023 23:59:59
    {
      id: 0,
      Cover:
        "https://ipfs.io/ipfs/QmdhUuDUXrAfHEwx7tEWw6LnFRhTx4DurmieaBW5WvFARu/20230729_204210.jpg",
      Logo: "https://ipfs.io/ipfs/QmNRgw61q81mUb2dRarA6NBFqdE3E9rsYYhRWfdfgcPMnL/earlypass.gif",
      Name: "venomart Passes",
      Description: "Exclusive Passes On Venomart Marketplace",
      mintPrice: "1",
      status: "Sold Out",
      CollectionAddress:
        "0:9a49dc04f979f0ed7b0b465fc2d9266e57025406497ad5038e4ff61259eaf9d2",
      customLink: "custom/venomartPass",
      verified: true,
    },
    {
      id: 1,
      Cover: "https://ipfs.io/ipfs/QmamHq9mXQTDkVMrMhHgqZc1xCszcSRVtRqWuzHv85sDs2/cover.jpg",
      Logo: "https://ipfs.io/ipfs/QmSPoW63yLi3aEE4jLEBaLwTbZ79bxwCmXjRHQHHFLPPmA/alligators.gif",
      Name: "Venom Alligators",
      Description:
        "Voracious alligators getting set to defend their swamp on the Venom Blockchain",
      mintPrice: "1",
      status: "Upcoming",
      CollectionAddress: "",
      customLink: "custom/venomalligators",
      pageName: "venomalligators",
      supply: "3000",
      twitterUserName: "VenomAlligators",
      twitter: "https://twitter.com/VenomAlligators",
      discord: "https://discord.gg/MdSDtqyBwd",
      instagram: "",
      telegram: "",
      startDate: "08/07/2023 12:00:00",
      endDate: "08/11/2023 12:00:00",
      verified: true,
    },
    {
      id: 2,
      Cover:
        "https://ipfs.io/ipfs/QmWMSjnNzQMm9u1x8X2DbpVD4uUiDizLvBp4hVJkyy2tPJ/bearcover%20(1).png",
      Logo: "https://ipfs.io/ipfs/QmT6jxgAtUh99X1fhaEbBCuNqKAwMRPqf5LcCzo4YoQVaG/nft.gif",
      Name: "Venom Bears",
      Description:
        "Presenting venom bears the cutest collection on the Venom Blockchain",
      mintPrice: "1",
      status: "Upcoming",
      CollectionAddress: "",
      customLink: "custom/venombears",
      pageName: "venombears",
      supply: "3000",
      twitterUserName: "venombears",
      twitter: "",
      discord: "",
      instagram: "",
      telegram: "",
      startDate: "08/09/2023 12:00:00",
      endDate: "08/13/2023 12:00:00",
      verified: false,
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

  // fetching all collections
  const fetch_all_collections = async () => {
    setLoading(true);
    const res = await get_collections();
    // console.log(res);
    set_collections(res);
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
    } else {
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
    <ThirdwebProvider clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENTID}>
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
        customLaunchpad={customLaunchpad}
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
    </ThirdwebProvider>
  );
}
