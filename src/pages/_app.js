import '@/styles/globals.css'
import '@/styles/custom.css'
import '@/styles/tailwind.css'
import '@/styles/Home.module.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function App({ Component, pageProps }) {
  const theme = "light";
  return (
    <>
      <Navbar theme={theme} />
      <Component
        {...pageProps}
        theme={theme}
      />
      <Footer theme={theme} />
    </>
  )
}
