import '@/styles/globals.css'
import '@/styles/custom.css'
import '@/styles/tailwind.css'
import '@/styles/Home.module.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }) {

  const blockURL = "https://venomart.space/";
  const signer_address = "ox44";
  const defTheme = "dark";
  const [theme, setTheme] = useState(defTheme);

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
        blockURL={blockURL}
      />
      <Footer theme={theme} />
    </>
  )
}
