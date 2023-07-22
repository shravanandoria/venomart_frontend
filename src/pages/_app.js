// def 
import { useEffect, useState } from 'react'

// components 
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// sty;es 
import '@/styles/globals.css'
import '@/styles/custom.css'
import '@/styles/tailwind.css'
import '@/styles/Home.module.css'

// images 
import testNFT from "../../public/test.jpg";


export default function App({ Component, pageProps }) {

  const blockURL = "https://venomart.space/";
  const signer_address = "ox44";
  const defaultCollectionAddress = "ox44";
  const defTheme = "dark";
  const [theme, setTheme] = useState(defTheme);

  // test collection array 
  const all_collections = [{
    Cover: testNFT,
    Logo: testNFT,
    Name: "cover",
    OwnerAddress: "cover",
    CollectionAddress: "cover",
  }]

  // test collection array 
  const all_nfts = [{
    ImageSrc: testNFT,
    Name: "nft",
    Description: "test descrip",
    Address: "cover",
    tokenId: 1,
    listedBool: true,
    listingPrice: 2,
  }]

  // setting website theme 
  useEffect(() => {
    const defThemeLocal = localStorage.getItem("WebsiteTheme");
    setTheme(defThemeLocal);
  }, [])
  return (
    <>
      <Navbar
        theme={theme}
        setTheme={setTheme}
        signer_address={signer_address}
      />
      <Component
        {...pageProps}
        theme={theme}
        signer_address={signer_address}
        defaultCollectionAddress={defaultCollectionAddress}
        blockURL={blockURL}

        all_collections={all_collections}
        all_nfts={all_nfts}
      />
      <Footer theme={theme} />
    </>
  )
}
