import Head from 'next/head'
import Link from 'next/link'
import React from 'react'

const Contact = ({ theme }) => {
    return (
        <div className={`${theme}`}>
            <Head>
                <title>Contact us - Team Venomart</title>
                <meta
                    name="description"
                    content="Contact venomart team for any issues or queries"
                />
                <meta
                    name="keywords"
                    content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.png" />
            </Head>

            <section className="relative pt-52 pb-24 dark:bg-jacarta-800">
                <div className="container">
                    <div className="lg:flex">
                        <div className="mb-12 lg:mb-0 lg:w-2/3 lg:pr-12">
                            <h2 className="mb-4 font-display text-xl text-jacarta-700 dark:text-white">Contact Us</h2>
                            <p className="mb-16 text-lg leading-normal dark:text-jacarta-300">
                                Have a question? Need help? Don't hesitate, drop us a line
                            </p>
                            <form id="contact-form" method="post">
                                <div className="flex space-x-7">
                                    <div className="mb-6 w-1/2">
                                        <label for="name" className="mb-1 block font-display text-sm text-jacarta-700 dark:text-white">Name<span className="text-red">*</span></label>
                                        <input
                                            name="name"
                                            className={`contact-form-input w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white dark:placeholder:text-jacarta-300" : "text-black"} `}
                                            id="name"
                                            type="text"
                                            required
                                        />
                                    </div>

                                    <div className="mb-6 w-1/2">
                                        <label for="email" className="mb-1 block font-display text-sm text-jacarta-700 dark:text-white"
                                        >Email<span className="text-red">*</span></label>
                                        <input
                                            name="email"
                                            className={`contact-form-input w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white dark:placeholder:text-jacarta-300" : "text-black"} `}
                                            id="email"
                                            type="email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label for="message" className="mb-1 block font-display text-sm text-jacarta-700 dark:text-white"
                                    >Query<span className="text-red">*</span></label>
                                    <textarea
                                        id="message"
                                        className={`contact-form-input w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white dark:placeholder:text-jacarta-300" : "text-black"} `}
                                        required
                                        name="message"
                                        rows="5"
                                    ></textarea>
                                </div>

                                <div className="mb-6 flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="contact-form-consent-input"
                                        name="agree-to-terms"
                                        className="h-5 w-5 self-start rounded border-jacarta-200 text-accent checked:bg-accent focus:ring-accent/20 focus:ring-offset-0 dark:border-jacarta-500 dark:bg-jacarta-600"
                                    />
                                    <label for="contact-form-consent-input" className="text-sm dark:text-jacarta-200"
                                    >I agree to the <Link href="/legal/Terms&Conditions" className="text-accent">Terms & Conditions</Link></label>
                                </div>

                                <button
                                    type="submit"
                                    className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                    id="contact-form-submit"
                                >
                                    Submit
                                </button>

                                <div
                                    id="contact-form-notice"
                                    className="relative mt-4 hidden rounded-lg border border-transparent p-4"
                                ></div>
                            </form>
                        </div>

                        <div className="lg:w-1/3 lg:pl-5">
                            <h2 className="mb-4 font-display text-xl text-jacarta-700 dark:text-white">Track Us</h2>
                            <p className="mb-6 text-lg leading-normal dark:text-jacarta-300">
                                Track us by following us, raise a ticket on discord if you have any kind of issues or queries.
                            </p>

                            <div className="rounded-2.5xl border border-jacarta-100 bg-white p-10 dark:border-jacarta-600 dark:bg-jacarta-700 overflow-hidden">
                                <div className="mb-6 flex items-center space-x-5">
                                    <span
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-jacarta-100 bg-light-base dark:border-jacarta-600 dark:bg-jacarta-700"
                                    >
                                        <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="discord"
                                            className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" role="img"
                                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                                            <path
                                                d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z">
                                            </path>
                                        </svg>
                                    </span>

                                    <div>
                                        <span className="block font-display text-base text-jacarta-700 dark:text-white">Discord</span>
                                        <a href="https://discord.gg/wQbBr6Xean" className="text-sm hover:text-accent dark:text-jacarta-300">Join Discord</a>
                                    </div>
                                </div>
                                <div className="mb-6 flex items-center space-x-5">
                                    <span
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-jacarta-100 bg-light-base dark:border-jacarta-600 dark:bg-jacarta-700"
                                    >
                                        <svg
                                            className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white"
                                            role="img"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 512 512"
                                        >
                                            <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                                        </svg>
                                    </span>

                                    <div>
                                        <span className="block font-display text-base text-jacarta-700 dark:text-white">Twitter</span>
                                        <a href="https://twitter.com/venomart23" className="text-sm hover:text-accent dark:text-jacarta-300">@venomart23</a>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5">
                                    <span
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-jacarta-100 bg-light-base dark:border-jacarta-600 dark:bg-jacarta-700"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width="24"
                                            height="24"
                                            className="fill-jacarta-400"
                                        >
                                            <path fill="none" d="M0 0h24v24H0z" />
                                            <path
                                                d="M2.243 6.854L11.49 1.31a1 1 0 0 1 1.029 0l9.238 5.545a.5.5 0 0 1 .243.429V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.283a.5.5 0 0 1 .243-.429zM4 8.133V19h16V8.132l-7.996-4.8L4 8.132zm8.06 5.565l5.296-4.463 1.288 1.53-6.57 5.537-6.71-5.53 1.272-1.544 5.424 4.47z"
                                            />
                                        </svg>
                                    </span>

                                    <div>
                                        <span className="block font-display text-base text-jacarta-700 dark:text-white">Email</span>
                                        <a
                                            href="mailto:venomart.space@gmail.com"
                                            className="text-sm not-italic hover:text-accent dark:text-jacarta-300">contact@venomart.io</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Contact