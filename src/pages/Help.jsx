import Head from 'next/head'
import Link from 'next/link'
import React, { useState } from 'react'

const Help = ({ theme, signer_address }) => {

    const [faq1, set_faq1] = useState(true);
    const [faq2, set_faq2] = useState(true);
    const [faq3, set_faq3] = useState(true);

    return (
        <div className={`${theme}`}>
            <Head>
                <title>Help - Venomart Marketplace</title>
                <meta
                    name="description"
                    content="Get help related to buy/sell NFTs on venom blockchain via venomart"
                />
                <meta
                    name="keywords"
                    content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.png" />
            </Head>

            <section className="relative pt-40 pb-24 dark:bg-jacarta-900">
                <div className="container">
                    <h1 className="mb-10 text-center font-display text-xl font-medium text-jacarta-700 dark:text-white">
                        Help Center
                    </h1>
                    <div className="mb-16 grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3">
                        <a
                            href="#"
                            className="rounded-2lg border border-jacarta-100 bg-white p-6 text-center transition-shadow hover:shadow-lg dark:border-jacarta-600 dark:bg-jacarta-700"
                        >
                            <h3 className="mb-2 font-display text-base font-semibold text-jacarta-700 dark:text-white">
                                Getting started
                            </h3>
                            <p className="dark:text-jacarta-300">
                                Learn how to create an account, set up your wallet, and what you can do.
                            </p>
                        </a>
                        <a
                            href="#"
                            className="rounded-2lg border border-jacarta-100 bg-white p-6 text-center transition-shadow hover:shadow-lg dark:border-jacarta-600 dark:bg-jacarta-700"
                        >
                            <h3 className="mb-2 font-display text-base font-semibold text-jacarta-700 dark:text-white">Buying</h3>
                            <p className="dark:text-jacarta-300">
                                Learn how to start buying NFTs on venom blockchain via venomart
                            </p>
                        </a>
                        <a
                            href="#"
                            className="rounded-2lg border border-jacarta-100 bg-white p-6 text-center transition-shadow hover:shadow-lg dark:border-jacarta-600 dark:bg-jacarta-700"
                        >
                            <h3 className="mb-2 font-display text-base font-semibold text-jacarta-700 dark:text-white">Selling</h3>
                            <p className="dark:text-jacarta-300">
                                Start selling your own NFTs on venom blockchain via venomart
                            </p>
                        </a>
                    </div>

                    <h2 className="mb-10 text-center font-display text-xl font-medium text-jacarta-700 dark:text-white">
                        Frequently asked questions
                    </h2>
                    <p className="mx-auto mb-10 max-w-md text-center text-lg text-jacarta-300">
                        Join our community now to get free updates and also alot of freebies / airdrops are waiting for you or
                        <Link href="/Contact" className="text-accent ml-2">Contact Support</Link>
                    </p>

                    <div className="accordion mx-auto max-w-[35rem]">

                        <div className="accordion-item mb-5 overflow-hidden rounded-lg border border-jacarta-100 dark:border-jacarta-600">
                            <h2 className="accordion-header">
                                <button onClick={() => (set_faq1(!faq1))} className={`accordion-button ${faq1 && "collapsed"} relative flex w-full items-center justify-between bg-white px-4 py-3 text-left font-display text-jacarta-700 dark:bg-jacarta-700 dark:text-white`}>
                                    <span>How do I create an NFT?</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        className="accordion-arrow h-4 w-4 shrink-0 fill-jacarta-700 transition-transform dark:fill-white"
                                    >
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z"></path>
                                    </svg>
                                </button>
                            </h2>
                            <div className={`accordion-collapse ${faq1 && "collapse"}`}>
                                <div className="accordion-body border-t border-jacarta-100 bg-white p-4 dark:border-jacarta-600 dark:bg-jacarta-700">
                                    <p className="dark:text-jacarta-200">
                                        To create your own NFT on venom blockchain, head to <a href='/mint/CreateNFT' target='_blank' className='text-accent'>Create NFT</a> page, upload your NFT image and fill other details like NFT name, description, props etc and click on create NFT and wait for a while, congratulations you just created your first NFT on venom which you can find in your profile
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="accordion-item mb-5 overflow-hidden rounded-lg border border-jacarta-100 dark:border-jacarta-600">
                            <h2 className="accordion-header">
                                <button onClick={() => (set_faq2(!faq2))} className={`accordion-button ${faq2 && "collapsed"} relative flex w-full items-center justify-between bg-white px-4 py-3 text-left font-display text-jacarta-700 dark:bg-jacarta-700 dark:text-white`}>
                                    <span>Is it safe to buy NFT on venomart?</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        className="accordion-arrow h-4 w-4 shrink-0 fill-jacarta-700 transition-transform dark:fill-white"
                                    >
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z"></path>
                                    </svg>
                                </button>
                            </h2>
                            <div className={`accordion-collapse ${faq2 && "collapse"}`}>
                                <div className="accordion-body border-t border-jacarta-100 bg-white p-4 dark:border-jacarta-600 dark:bg-jacarta-700">
                                    <p className="dark:text-jacarta-200">
                                        Yes it is 100% safe to trade NFTs on venomart. We soley operate our marketplace and do not use any third party services.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="accordion-item mb-5 overflow-hidden rounded-lg border border-jacarta-100 dark:border-jacarta-600">
                            <h2 className="accordion-header">
                                <button onClick={() => (set_faq3(!faq3))} className={`accordion-button ${faq3 && "collapsed"} relative flex w-full items-center justify-between bg-white px-4 py-3 text-left font-display text-jacarta-700 dark:bg-jacarta-700 dark:text-white`}>
                                    <span>Does venomart charges fees on NFT trading?</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        className="accordion-arrow h-4 w-4 shrink-0 fill-jacarta-700 transition-transform dark:fill-white"
                                    >
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z"></path>
                                    </svg>
                                </button>
                            </h2>
                            <div className={`accordion-collapse ${faq3 && "collapse"}`}>
                                <div className="accordion-body border-t border-jacarta-100 bg-white p-4 dark:border-jacarta-600 dark:bg-jacarta-700">
                                    <p className="dark:text-jacarta-200">
                                        Yes venomart charges very minimal listing fees when user lists any NFT for sale and charges 2.5% platform fees when user buys any NFT on venomart. please check our <a href='/legal/Terms&Conditions' target='_blank' className='text-accent'>terms and conditions</a> for more information.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Help