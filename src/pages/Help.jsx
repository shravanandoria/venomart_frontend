import Link from 'next/link'
import React from 'react'

const Help = ({ theme }) => {
    return (
        <div className={`${theme}`}>
            <section className="relative pt-40 pb-24 dark:bg-jacarta-800">
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
                                Learn how to create an account, set up your wallet, and what you can do.
                            </p>
                        </a>
                        <a
                            href="#"
                            className="rounded-2lg border border-jacarta-100 bg-white p-6 text-center transition-shadow hover:shadow-lg dark:border-jacarta-600 dark:bg-jacarta-700"
                        >
                            <h3 className="mb-2 font-display text-base font-semibold text-jacarta-700 dark:text-white">Selling</h3>
                            <p className="dark:text-jacarta-300">
                                Learn how to create an account, set up your wallet, and what you can do.
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

                    <div className="accordion mx-auto max-w-[35rem]" id="accordionFAQ">
                        {/* loop questions here  */}
                        <div className="accordion-item mb-5 overflow-hidden rounded-lg border border-jacarta-100 dark:border-jacarta-600">
                            <h2 className="accordion-header" id="faq-heading-1">
                                <button
                                    className="accordion-button collapsed relative flex w-full items-center justify-between bg-white px-4 py-3 text-left font-display text-jacarta-700 dark:bg-jacarta-700 dark:text-white"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#faq-1"
                                    aria-expanded="false"
                                    aria-controls="faq-1"
                                >
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
                            <div
                                id="faq-1"
                                className="accordion-collapse collapse"
                                aria-labelledby="faq-heading-1"
                                data-bs-parent="#accordionFAQ"
                            >
                                <div
                                    className="accordion-body border-t border-jacarta-100 bg-white p-4 dark:border-jacarta-600 dark:bg-jacarta-700"
                                >
                                    <p className="dark:text-jacarta-200">
                                        Learn how to create your very first NFT and how to create your NFT collections. Unique, fully 3D and
                                        built to unite the design multiverse. Designed and styled by Digimental.
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