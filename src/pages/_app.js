// def
import { useEffect, useCallback, useState } from "react";

// components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// sty;es
import "../styles/globals.css";
import "../styles/custom.css";
import "../styles/tailwind.css";
import "../styles/Home.module.css";

//Wallet Connect
import { initVenomConnect } from "../utils/wallet_connect";
import { COLLECTION_ADDRESS } from "../utils/user_nft";

// mongo imports
import { get_collections } from "../utils/mongo_api/collection/collection";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import Script from "next/script";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // default values
  const currency = "VENOM";
  const blockChain = "Venom Testnet";
  const webURL = "https://venomart.io/";
  const blockURL = "https://testnet.venomscan.com/";
  const apiFetchURL = "https://testnet-api.venomscan.com/v1/accounts";
  const defaultCollectionAddress = COLLECTION_ADDRESS;
  const defTheme = "dark";

  // other values
  const adminAccount =
    "0:481b34e4d5c41ebdbf9b0d75f22f69b822af276c47996c9e37a89e1e2cb05580";
  const MintNFTStatus = true;
  const MintCollectionStatus = false;

  // variables
  const [theme, setTheme] = useState(defTheme);
  const [venomConnect, setVenomConnect] = useState();
  const [venomProvider, setVenomProvider] = useState();

  const [signer_address, set_signer_address] = useState("");
  const [standalone, set_standalone] = useState();

  const [topCollections, setTopCollections] = useState([]);
  const [anyModalOpen, setAnyModalOpen] = useState(false);

  // custom array of all collabs
  // status should be Upcoming, Live, Ended, Sold Out and date format is mm/dd/2023 23:59:59
  const collabQuests = [
    {
      id: 0,
      Cover:
        "https://ipfs.io/ipfs/QmamHq9mXQTDkVMrMhHgqZc1xCszcSRVtRqWuzHv85sDs2/cover.jpg",
      Logo: "https://ipfs.io/ipfs/QmSPoW63yLi3aEE4jLEBaLwTbZ79bxwCmXjRHQHHFLPPmA/alligators.gif",
      Name: "Venomart x Alligators",
      Description:
        "Voracious alligators getting set to defend their swamp on the Venom Blockchain",
      mintPrice: "2",
      status: "Sold Out",
      CollectionAddress:
        "0:5a42abb162be813f0d9efd2f350baf77fcafc53acb86366e67a5571cca34d9ba",
      customLink: "custom/venomalligators",
      pageName: "venomalligators",
      supply: "3000",
      twitterUserName: "VenomAlligators",
      twitter: "https://twitter.com/VenomAlligators",
      tweetID: "1691335365494480896",
      discord: "https://discord.gg/MdSDtqyBwd",
      instagram: "",
      telegram: "",
      website: "",
      startDate: "08/07/2023 12:05:00 GMT+0530",
      endDate: "08/11/2023 12:00:00 GMT+0530",
      verified: true,
    },
    {
      id: 1,
      Cover:
        "https://ipfs.io/ipfs/QmXHBc2yztjMjCbkjwa7DNpv9WSzC9somdL68yQZDcj1cV/cover.jpg",
      Logo: "https://ipfs.io/ipfs/QmXAnjyk3us68C1ADJkX54ozFgpFK2Bu8HP4KGSqJ8AJU6/nft.gif",
      Name: "Venomart x Ape Club",
      Description:
        "Presenting venom apes | 3333 rare, random & rad Apes living on the Venom Blockchain",
      mintPrice: "2",
      status: "Sold Out",
      CollectionAddress:
        "0:ae6ab9601f5d75a65851e2a826422de14bb193be0200506d34d1ae4c4c27dba0",
      customLink: "custom/venomapeclub",
      pageName: "venomapeclub",
      supply: "3000",
      twitterUserName: "VenomApe_NFT",
      twitter: "https://twitter.com/VenomApe_NFT",
      tweetID: "1687875245225701376",
      discord: "https://discord.com/invite/venomapeclub",
      instagram: "",
      telegram: "",
      website: "https://venomape.club/",
      startDate: "08/08/2023 12:00:00 GMT+0530",
      endDate: "08/12/2023 12:00:00 GMT+0530",
      verified: true,
    },
    {
      id: 2,
      Cover:
        "https://ipfs.io/ipfs/QmWMSjnNzQMm9u1x8X2DbpVD4uUiDizLvBp4hVJkyy2tPJ/bearcover%20(1).png",
      Logo: "https://ipfs.io/ipfs/QmT6jxgAtUh99X1fhaEbBCuNqKAwMRPqf5LcCzo4YoQVaG/nft.gif",
      Name: "Venomart x Bears",
      Description:
        "Presenting venom bear the cutest collection on the Venom Blockchain",
      mintPrice: "2",
      status: "Sold Out",
      CollectionAddress:
        "0:688c1bfc7415643585c81a0f769f8cc9a1432c5d2348b36eb9f27efad19a0690",
      customLink: "custom/venombears",
      pageName: "venombears",
      supply: "3000",
      twitterUserName: "venombears",
      twitter: "https://twitter.com/VenomBears",
      tweetID: "1687875245225701376",
      discord: "https://discord.com/invite/Ww7bJU8pEQ",
      instagram: "",
      telegram: "",
      website: "https://venom-bears.vercel.app/",
      startDate: "08/09/2023 17:00:00 GMT+0530",
      endDate: "08/13/2023 17:00:00 GMT+0530",
      verified: true,
    },
    {
      id: 3,
      Cover:
        "https://ipfs.io/ipfs/QmVhZToKviQLqScMjrvs5Lnuv8n3aX452b6DrbLzi125gk/back.jpg",
      Logo: "https://ipfs.io/ipfs/QmeKs3c2MJ4jrKxYgHSTZjmeBApbPV3ecSqfoTvC2bNVuB/moky.gif",
      Name: "Venomart x Monkeys",
      Description:
        "Venom Monkeys escaping from venomfoundationLabs 🧪  | Venom Monkeys coming to get you venomized ! 🍌⚡️",
      mintPrice: "2",
      status: "Sold Out",
      CollectionAddress:
        "0:4ec675ffeaab505d84412002333558e0afe9066e038a693ebb72889ce6341498",
      customLink: "custom/venommonkeys",
      pageName: "venommonkeys",
      supply: "3000",
      twitterUserName: "VenomMonkeys",
      twitter: "https://twitter.com/VenomMonkeys",
      tweetID: "1692776935368323257",
      discord: "https://discord.com/invite/ZGWCP4Bsgy",
      instagram: "",
      telegram: "",
      website: "",
      startDate: "08/19/2023 12:00:00 GMT+0530",
      endDate: "08/22/2023 12:00:00 GMT+0530",
      verified: true,
    },
    {
      id: 4,
      Cover:
        "https://ipfs.io/ipfs/QmbYth9zG5Uto89hdyHYJKeiyzHVKVY2DRKahXnZMPQxVC/back.jpg",
      Logo: "https://ipfs.io/ipfs/QmX4trXptRtqc5dEk3qsRsJVbs8bMeaKHqbxFHWHRV4BDV/mushies.gif",
      Name: "Venomart x Mushies",
      Description:
        "Introducing Venom Mushies, Exclusive pack of Mushies NFT coming soon on venom blockchain",
      mintPrice: "2",
      status: "Sold Out",
      CollectionAddress:
        "0:8434fd234c59d904f43594112b57cb0a2b5d65a1c800f9848b0c93a2dd052e7e",
      customLink: "custom/venommushies",
      pageName: "venommushies",
      supply: "3000",
      twitterUserName: "VenomMushies",
      twitter: "https://twitter.com/VenomMushies",
      tweetID: "1696084778284642589",
      discord: "https://discord.com/invite/qusCWJpX3N",
      instagram: "",
      telegram: "",
      website: "",
      startDate: "08/28/2023 14:30:00 GMT+0530",
      endDate: "08/31/2023 14:30:00 GMT+0530",
      verified: true,
    },
    {
      id: 5,
      Cover:
        "https://ipfs.io/ipfs/QmXMAMjLEo396RhK4xAu4CSV4LVQretsP5doX73ZCXbUHF/soda.jpg",
      Logo: "https://ipfs.io/ipfs/Qma92yEfiQzjSeJJEqDSaPsGwiHMgAyN4m81pLuP8ZC8gS/drunksoda.gif",
      Name: "Venomart x Drunksoda",
      Description:
        "Introducing Drunksoda, 4750 blasted sodas who have no idea where they are",
      mintPrice: "2",
      status: "Ended",
      CollectionAddress:
        "0:02bc0d2be19fcb6779b1125fb01f4f9e17ab9e81f76c04f6f45aa747767db74d",
      customLink: "custom/drunksoda",
      pageName: "drunksoda",
      supply: "3000",
      twitterUserName: "drunksodaVenom",
      twitter: "https://twitter.com/drunksodaVenom",
      tweetID: "1696832463086219716",
      discord: "https://discord.com/invite/xgNfmWkHpu",
      instagram: "",
      telegram: "",
      website: "",
      startDate: "08/30/2023 16:00:00 GMT+0530",
      endDate: "09/2/2023 14:00:00 GMT+0530",
      verified: true,
    },
    {
      id: 6,
      Cover:
        "https://ipfs.io/ipfs/QmQQ6WoDoUC8Z3kawG5PDpTYKERAoRp4RxWEWg6MyiFWcD/back.jpg",
      Logo: "https://ipfs.io/ipfs/QmY7DXigXjj5asALu1Eim3HbBnqd1gSKgXPqP5ZnpwXnkU/apacXvenomart.png",
      Name: "Venomart x VenomAPAC",
      Description:
        "Your Gateway to the thrilling World of venom blockchain in Asia-Pacific 🌏 🚀",
      mintPrice: "2",
      status: "Sold Out",
      CollectionAddress:
        "0:d94d30da2da24afc2dde6ae2444299fb3174e86171b81058fd9dbe83ec411e0b",
      customLink: "custom/venomapac",
      pageName: "venomapac",
      supply: "4200",
      twitterUserName: "VenomAPAC",
      twitter: "https://twitter.com/VenomAPAC",
      tweetID: "1697905254204080270",
      discord: "",
      instagram: "",
      telegram: "",
      website: "",
      startDate: "09/2/2023 15:00:00 GMT+0530",
      endDate: "09/6/2023 14:00:00 GMT+0530",
      verified: true,
    },
  ];

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
      mintPrice: "3",
      status: "Upcoming",
      CollectionAddress: "",
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
        connectWallet={connect_wallet}
        MintNFTStatus={MintNFTStatus}
        MintCollectionStatus={MintCollectionStatus}
        adminAccount={adminAccount}
        customLaunchpad={customLaunchpad}
        collabQuests={collabQuests}
        topCollections={topCollections}
        setTopCollections={setTopCollections}
        anyModalOpen={anyModalOpen}
        setAnyModalOpen={setAnyModalOpen}
      />
      <Footer
        theme={theme}
        signer_address={signer_address}
        onDisconnect={onDisconnect}
        adminAccount={adminAccount}
        MintNFTStatus={MintNFTStatus}
        MintCollectionStatus={MintCollectionStatus}
      />
    </ThirdwebProvider>
  );
}
