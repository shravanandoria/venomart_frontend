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
  const venomTPS = 99400;
  const currency = "VENOM";
  const blockChain = "Venom Testnet";
  const webURL = "https://venomart.io/";
  const blockURL = "https://testnet.venomscan.com/";
  const apiFetchURL = "https://testnet-api.venomscan.com/v1/accounts";
  const defaultCollectionAddress = COLLECTION_ADDRESS;
  const defTheme = "dark";

  // other values
  const adminAccount = [
    "0:481b34e4d5c41ebdbf9b0d75f22f69b822af276c47996c9e37a89e1e2cb05580",
    "0:f9a0684d617dd1379ed7c6dc0926b0f34a4e8941b14673f7e6244990db5cfeab",
  ];
  const MintNFTStatus = true;
  const MintCollectionStatus = false;

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

  // custom array of all launches
  const customLaunchpad = [
    {
      id: 0,
      Cover:
        "https://ipfs.io/ipfs/QmdhUuDUXrAfHEwx7tEWw6LnFRhTx4DurmieaBW5WvFARu/20230729_204210.jpg",
      Logo: "https://ipfs.io/ipfs/QmNRgw61q81mUb2dRarA6NBFqdE3E9rsYYhRWfdfgcPMnL/earlypass.gif",
      Name: "Venomart Passes",
      Description: "Exclusive Passes On Venomart Marketplace",
      mintPrice: "1",
      status: "Sold Out",
      supply: 3000,
      CollectionAddress:
        "0:9a49dc04f979f0ed7b0b465fc2d9266e57025406497ad5038e4ff61259eaf9d2",
      customLink: "custom/venomartPass",
      verified: true,
    },
    {
      id: 1,
      Cover:
        "https://ipfs.io/ipfs/QmQNUSRnqAuzNmkNWVZu83qyC4Cna46TxeceA6e6QmikqN/tt.jpg",
      Logo: "https://ipfs.io/ipfs/QmSA7ZFxyE9ZqvNj55ffwf5GLWnRDNLFheL5XP3Cb59xHe/ravegrp.gif",
      Name: "Rave - Passports",
      Description:
        "Introducing An NFT car racing metaverse game on venom | Collect, rave and earn 🏎 | Mint this passport and get access to several features 🚀",
      mintPrice: "2",
      status: "Sold Out",
      CollectionAddress:
        "0:aae4225bcd3f7cec286b3496abbaf91b213b8c1f024dc3a3189ecd148363d277",
      customLink: "custom/rave",
      pageName: "rave",
      supply: "3000",
      twitterUserName: "ravegamenft",
      twitter: "https://twitter.com/ravegamenft",
      tweetID: "1691335365494480896",
      discord: "https://discord.com/invite/CyHyDa5ZYv",
      instagram: "",
      telegram: "",
      website: "https://ravegame.net/",
      startDate: "08/15/2023 12:00:00 GMT+0530",
      endDate: "08/19/2023 12:00:00 GMT+0530",
      verified: true,
    },
    {
      id: 2,
      Cover:
        "https://ipfs.io/ipfs/Qmc3PfRuUGrNWhAiuxg5TXg9yqhhJxnQyfbijCKsg5gZnK/back.jpg",
      Logo: "https://ipfs.io/ipfs/QmPoEvU9hZTxEDv3bbXaSenFqmxU7YMnSxi5AiKJ2VU1Q7/gif.gif",
      Name: "Venom Lions",
      Description:
        "Introducing venom lions | 5555 Lions have spawned from a wild forest | First Racing P2E Game on #venom | Stake your Lions and earn $LION token 🦁",
      mintPrice: "2",
      status: "Upcoming",
      CollectionAddress: "",
      customLink: "launch/venomLions",
      pageName: "venomLions",
      supply: "5555",
      twitterUserName: "",
      twitter: "",
      tweetID: "",
      discord: "",
      instagram: "",
      telegram: "",
      website: "",
      startDate: "10/10/2023 12:00:00 GMT+0530",
      endDate: "10/15/2023 12:00:00 GMT+0530",
      verified: false,
    },
    {
      id: 3,
      Cover:
        "https://ipfs.io/ipfs/QmTspXusdN5SAwsutgvdrWF9bPDA6u61dKkcmZ74xPGVmx/back.jpg",
      Logo: "https://ipfs.io/ipfs/QmZm1KvzwKWZUtsLLQBsFepkVFs5GC9GNnrnhwzQBnE2Fr/nft.gif",
      Name: "Devenlabs",
      Description:
        "DeVenLabs is the home of degens and will build mini-games and usecases for the native token on the Venom Network.",
      mintPrice: "2",
      status: "Ended",
      CollectionAddress:
        "0:f93547a42e465d07c5ce641f133270cbfa0ac4b44b0990b29f455af025e4efff",
      customLink: "launch/devenlabs",
      pageName: "devenlabs",
      supply: "4000",
      twitterUserName: "devenlabs",
      twitter: "https://twitter.com/devenlabs",
      tweetID: "1699287014246396405",
      discord: "https://discord.gg/BgNGfFB3uN",
      instagram: "",
      telegram: "",
      website: "",
      startDate: "09/06/2023 16:00:00 GMT+0530",
      endDate: "09/10/2023 12:00:00 GMT+0530",
      verified: true,
    },
    {
      id: 4,
      Cover:
        "https://ipfs.io/ipfs/QmfGw8fVugGR7WDyhT41ThhvPtvwqy28ZjM8jNs4p9Zi34/back.jpg",
      Logo: "https://ipfs.io/ipfs/QmRe3HoHZyBYQkddbXtQP2oLWYseVx5mK6FqtTQgLb3Pqn/nft.gif",
      Name: "Venompumpy",
      Description:
        "Venompumpy is a memecoin built with classic NFT on Venom Network to reward users with up to 5% daily staking rewards",
      mintPrice: "1",
      status: "Ended",
      CollectionAddress:
        "0:4fa80560bd17c65026874719fe398151e59efe2614fb1e8e95ba2ca443f7d704",
      customLink: "launch/venompumpy",
      pageName: "venompumpy",
      supply: "2000",
      twitterUserName: "venommemepumpy",
      twitter: "https://twitter.com/venommemepumpy",
      tweetID: "1704439639472488525",
      discord: "https://discord.gg/p8g94pXSzp",
      instagram: "",
      telegram: "",
      website: "",
      startDate: "09/20/2023 15:30:00 GMT+0530",
      endDate: "09/24/2023 15:30:00 GMT+0530",
      verified: true,
    },
    {
      id: 5,
      Cover:
        "https://ipfs.io/ipfs/QmZrvwhwXfsxtPiowTrmXRpNoSQ6viKTpMevujFZRL4TmU/1500x500.jpg",
      Logo: "https://ipfs.io/ipfs/QmedApN5MhBQhkXJKoD4RHrLq31Ho4xgJPZtyqCAbVtwTW/venomons.jpg",
      Name: "Venomons",
      Description:
        "Web3 Bros sssliding into decentralized realms. The Venomons' Sanctuary awaits you 🐍",
      mintPrice: "1",
      status: "Sold Out",
      CollectionAddress:
        "0:f269fddbe59ea50f57451d7434e411d4f6cfed9a1f8cda83f575263eae3095d9",
      customLink: "launch/venomons",
      pageName: "venomons",
      supply: "1000",
      twitterUserName: "VenomonsNFT",
      twitter: "https://twitter.com/VenomonsNFT",
      tweetID: "1709094106117345676",
      discord: "",
      instagram: "",
      telegram: "",
      website: "",
      startDate: "10/5/2023 12:00:00 GMT+0530",
      endDate: "10/9/2023 12:00:00 GMT+0530",
      verified: true,
    },
    {
      id: 6,
      Cover:
        "https://ipfs.io/ipfs/QmcGVH8wAJxVoeKavcaniUsvCcwnhcCgDQ25BoTRZXB1Yg/chads.jpg",
      Logo: "https://ipfs.io/ipfs/QmRdJmCipSd8Xsf8KSjqpzufrmD5zBBZF6vkzA3uVdbhU1/chadpass.jpg",
      Name: "Venomchad WL pass",
      Description: "Chad Art, Chad Utility, Chad Community. 'Be A Chad'",
      mintPrice: "1",
      status: "Sold Out",
      CollectionAddress:
        "0:ef4d10ea86a02a1ac6b2e0c7d226b39745424f79a8d70ecd021572b1d73e7de3",
      customLink: "launch/venomchads",
      pageName: "venomchads",
      supply: "2000",
      twitterUserName: "VenomChads",
      twitter: "https://twitter.com/VenomChads",
      tweetID: "1709094106117345676",
      discord: "https://discord.gg/HCPEsu6VAh",
      instagram: "",
      telegram: "",
      website: "",
      startDate: "10/12/2023 12:00:00 GMT+0530",
      endDate: "10/15/2023 12:00:00 GMT+0530",
      verified: true,
    },
    {
      id: 7,
      Cover:
        "https://ipfs.io/ipfs/QmPLFmbAsPgbUHuHpjYEJvgokUL26X8zX4XvabeC5xGuM8/cover.jpg",
      Logo: "https://ipfs.io/ipfs/QmR6CYvsQ87rahPmqTJzAUH1VztzCAGPDhj1k8Gh5AFJrH/nft.jpg",
      Name: "Venom Turkiye",
      Description:
        "Asynchronous blockchain building an interconnected future. Community Focused - VenomFoundation Approved by! 🇹🇷",
      mintPrice: "1",
      status: "Sold Out",
      CollectionAddress:
        "0:6e3315bc1fe4973867233098f11331d270bb36cb99c97adf70eb81ace8713b15",
      customLink: "launch/venomturkiye",
      pageName: "venomturkiye",
      supply: "2000",
      twitterUserName: "Venom_Turkiye",
      twitter: "https://twitter.com/Venom_Turkiye",
      tweetID: "",
      discord: "",
      instagram: "",
      telegram: "",
      website: "",
      startDate: "10/13/2023 21:30:00 GMT+0530",
      endDate: "10/17/2023 21:30:00 GMT+0530",
      verified: true,
    },
  ];

  // featured collections
  const featuredCollections = [
    {
      id: 1,
      collectionName: "Venomons",
      collectionAddress:
        "0:f269fddbe59ea50f57451d7434e411d4f6cfed9a1f8cda83f575263eae3095d9",
      items: 1000,
      coverImage:
        "https://ipfs.io/ipfs/QmedApN5MhBQhkXJKoD4RHrLq31Ho4xgJPZtyqCAbVtwTW/venomons.jpg",
      collectionLogo:
        "https://ipfs.io/ipfs/QmZzvNhQbz8T5aRuBrjf44tAFYrWvjhwnU9kCDJBB4QMdw/logo.jpg",
      className: "mb-6 md:flex md:w-1/2 md:items-center",
    },
    {
      id: 2,
      collectionName: "Venom Alligators",
      collectionAddress:
        "0:c36c4939e3ae582f4e9f7215f36bc39e89a1796e6a32260dec762cf53c137dd2",
      items: 2000,
      coverImage:
        "https://ipfs.io/ipfs/QmUP4egVXhGqxdvVBbs95cdiBTV6R2ayRoHszcdcgZ7d1G/alilogo.gif",
      collectionLogo:
        "https://ipfs.io/ipfs/QmUP4egVXhGqxdvVBbs95cdiBTV6R2ayRoHszcdcgZ7d1G/alilogo.gif",
      className: "mb-6 md:flex md:w-1/2 md:items-center",
    },
  ];

  // web stats
  const websiteStats = [
    {
      nftCollection: 55,
      mintedNFTs: 313800,
      mintVolume: 51780,
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
        MintNFTStatus={MintNFTStatus}
        MintCollectionStatus={MintCollectionStatus}
        blockURL={blockURL}
        vnmBalance={vnmBalance}
        setVnmBalance={setVnmBalance}
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
          MintNFTStatus={MintNFTStatus}
          MintCollectionStatus={MintCollectionStatus}
          adminAccount={adminAccount}
          customLaunchpad={customLaunchpad}
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
        adminAccount={adminAccount}
        MintNFTStatus={MintNFTStatus}
        MintCollectionStatus={MintCollectionStatus}
        venomPrice={venomPrice}
        venomTPS={venomTPS}
        venomProvider={venomProvider}
        connectWallet={connect_wallet}
      />
    </ThirdwebProvider>
  );
}
