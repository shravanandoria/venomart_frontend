import Image from 'next/image'
import React from 'react'

const SmallCollectionCard = ({ Logo, theme }) => {
    return (
        <div
            className={`flex rounded-2.5xl border ${theme == "dark" ? "border-jacarta:900" : "border-jacarta-100"} bg-white py-4 px-7 transition-shadow hover:shadow-lg dark:bg-jacarta-800`}>
            <figure className="mr-4 shrink-0">
                <a href="collection.html" className="relative block">
                    <Image src={Logo} alt="avatar 1" className="rounded-2lg h-[60px] w-[auto]" height={100} width={100} loading="lazy" />
                    <div
                        className="absolute -left-3 top-1/2 flex h-6 w-6 -translate-y-2/4 items-center justify-center rounded-full border-2 border-white bg-jacarta-700 text-xs text-white dark:border-jacarta-600">
                        1
                    </div>
                    <div
                        className="absolute -left-3 top-[60%] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green dark:border-jacarta-600"
                        data-tippy-content="Verified Collection">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                            className="h-[.875rem] w-[.875rem] fill-white">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" />
                        </svg>
                    </div>
                </a>
            </figure>
            <div>
                <a href="collection.html" className="block">
                    <span className="font-display font-semibold text-jacarta-700 hover:text-accent dark:text-white">NFT Funny
                        Cat</span>
                </a>
                <span className="text-sm dark:text-jacarta-300">7,080.95 ETH</span>
            </div>
        </div>
    )
}

export default SmallCollectionCard