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

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // default values
  const venomPrice = 0.55;
  const venomTPS = 95400;
  const currency = "VENOM";
  const blockChain = "Venom Mainnet";
  const webURL = "https://venomart.io/";
  const blockURL = "https://venomscan.com/";
  const GQLEndpoint = "https://gql.venom.foundation/graphql";
  const apiFetchURL = "https://testnet-api.venomscan.com/v1/accounts";
  const NFTImagesBaseURI = "https://venomart.ipfs.io/ipfs/"; //the base ipfs uri for all the NFT images
  const OtherImagesBaseURI = "https://ipfs.io/ipfs/"; // the base ipfs uri for all the uploads via thirdweb
  const defTheme = "dark";

  // other values
  const adminAccount = [
    "0:8986f472e33d521d4dabf17b1a0e001cd86c876f552b284d6ca0894131a36743", //ani account
    "0:f9a0684d617dd1379ed7c6dc0926b0f34a4e8941b14673f7e6244990db5cfeab", //shravan account
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
  const [vnmBalance, setVnmBalance] = useState(0);

  const [signer_address, set_signer_address] = useState("");
  const [standalone, set_standalone] = useState();

  const [cartNFTs, setCartNFTs] = useState([]);
  const [anyModalOpen, setAnyModalOpen] = useState(false);

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
      setTheme("dark");
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
      endpoints: [GQLEndpoint],
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
        OtherImagesBaseURI={OtherImagesBaseURI}
      />
      <TonClientContextProvider config={config}>
        <Component
          {...pageProps}
          theme={theme}
          standalone={standalone}
          venomProvider={venomProvider}
          signer_address={signer_address}
          blockURL={blockURL}
          blockChain={blockChain}
          currency={currency}
          webURL={webURL}
          copyURL={copyURL}
          connectWallet={connect_wallet}
          EnableMakeOffer={EnableMakeOffer}
          adminAccount={adminAccount}
          anyModalOpen={anyModalOpen}
          setAnyModalOpen={setAnyModalOpen}
          cartNFTs={cartNFTs}
          setCartNFTs={setCartNFTs}
          venomPrice={venomPrice}
          vnmBalance={vnmBalance}
          EnableNFTList={EnableNFTList}
          EnableNFTCancel={EnableNFTCancel}
          EnableNFTSale={EnableNFTSale}
          OtherImagesBaseURI={OtherImagesBaseURI}
          NFTImagesBaseURI={NFTImagesBaseURI}
        />
      </TonClientContextProvider>
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
        OtherImagesBaseURI={OtherImagesBaseURI}
        NFTImagesBaseURI={NFTImagesBaseURI}
      />
    </ThirdwebProvider>
  );
}
