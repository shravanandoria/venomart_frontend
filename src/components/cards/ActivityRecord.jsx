import Link from 'next/link'
import React from 'react'

const ActivityRecord = () => {
    return (
        <Link
            href={""}
            style={{ margin: "12px", width: "90%" }}
            className="relative flex items-center rounded-2.5xl border border-jacarta-100 bg-white p-8 transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700"
        >
            {/* nft image url  */}
            {/* <div className="mr-5 self-start">
                <Image src="img/avatars/avatar_2.jpg" alt="avatar 2" className="rounded-2lg" loading="lazy" />
            </div> */}

            <div>
                <h3 className="mb-1 font-display text-base font-semibold text-jacarta-700 dark:text-white">
                    Lazyone Panda
                </h3>
                <span className="mb-3 block text-sm text-jacarta-500">sold for 1.515 ETH</span>
                <span className="block text-xs text-jacarta-300">30 minutes 45 seconds ago</span>
            </div>

            <div className="ml-auto rounded-full border border-jacarta-100 p-3 dark:border-jacarta-600">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="fill-jacarta-700 dark:fill-white"
                >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                        d="M6.5 2h11a1 1 0 0 1 .8.4L21 6v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6l2.7-3.6a1 1 0 0 1 .8-.4zM19 8H5v12h14V8zm-.5-2L17 4H7L5.5 6h13zM9 10v2a3 3 0 0 0 6 0v-2h2v2a5 5 0 0 1-10 0v-2h2z"
                    />
                </svg>
            </div>
        </Link>
    )
}

export default ActivityRecord