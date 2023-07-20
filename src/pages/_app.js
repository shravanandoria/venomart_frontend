import '@/styles/globals.css'
import '@/styles/custom.css'
import '@/styles/tailwind.css'
import '@/styles/Home.module.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useState } from 'react'

export default function App({ Component, pageProps }) {
  const defTheme = "light";
  const [theme, setTheme] = useState(defTheme);
  return (
    <>
      <Navbar theme={theme} setTheme={setTheme} />
      <Component
        {...pageProps}
        theme={theme}
      />
      <Footer theme={theme} />
    </>
  )
}
