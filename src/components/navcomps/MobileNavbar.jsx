import Link from 'next/link'
import React, { useState } from 'react'

const MobileNavbar = () => {

    const [explore, setExplore] = useState(false);

    return (
        <nav className="navbar w-full bg-white dark:bg-jacarta-800 p-6 mt-[-20px] lg:hidden">
            {/* mobile search  */}
            <form action="search" className="relative mb-8 w-full">
                <input type="search"
                    className="w-full rounded-2xl border border-jacarta-100 py-3 px-4 pl-10 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                    placeholder="Search" />
                <span className="absolute left-0 top-0 flex h-full w-12 items-center justify-center rounded-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                        className="h-4 w-4 fill-jacarta-500 dark:fill-white">
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path
                            d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" />
                    </svg>
                </span>
            </form>
            <ul className="flex flex-col lg:flex-row">
                <li className="group relative">
                    <Link
                        href="#"
                        className=" flex items-center justify-between py-3.5 font-display text-base text-jacarta-700 hover:text-accent focus:text-accent dark:text-white dark:hover:text-accent dark:focus:text-accent lg:px-5"
                        onClick={() => setExplore(!explore)}
                    >
                        Explore
                        <i className="lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                className="h-4 w-4 fill-jacarta-700 dark:fill-jacarta-200">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z" />
                            </svg>
                        </i>
                    </Link>
                    {explore &&
                        <ul
                            className="left-0 top-[85%] z-10 min-w-[200px] gap-x-4 whitespace-nowrap rounded-xl bg-white transition-all will-change-transform group-hover:opacity-100 dark:bg-jacarta-800 lg:absolute lg:grid lg:translate-y-4 lg:py-4 lg:px-2 lg:opacity-0 lg:shadow-2xl lg:group-hover:translate-y-2"
                        >
                            <li>
                                <Link
                                    href="/explore/NFTs"
                                    className="flex items-center rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                                >
                                    <span className="mr-3 rounded-xl bg-light-base p-[0.375rem]">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width="24"
                                            height="24"
                                            className="h-4 w-4 fill-jacarta-700"
                                        >
                                            <path fill="none" d="M0 0h24v24H0z" />
                                            <path d="M22 12.999V20a1 1 0 0 1-1 1h-8v-8.001h9zm-11 0V21H3a1 1 0 0 1-1-1v-7.001h9zM11 3v7.999H2V4a1 1 0 0 1 1-1h8zm10 0a1 1 0 0 1 1 1v6.999h-9V3h8z" />
                                        </svg>
                                    </span>
                                    <span className="font-display text-sm text-jacarta-700 dark:text-white">
                                        All NFTs
                                    </span>
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/explore/Collections"
                                    className="flex items-center rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                                >
                                    <span className="mr-3 rounded-xl bg-[#FDF7EE] p-[0.375rem]">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width="24"
                                            height="24"
                                            className="h-4 w-4 fill-[#FEB240]"
                                        >
                                            <path fill="none" d="M0 0h24v24H0z" />
                                            <path d="M17.5 2a4.5 4.5 0 0 1 2.951 7.897c.355.967.549 2.013.549 3.103A9 9 0 1 1 3.55 9.897a4.5 4.5 0 1 1 6.791-5.744 9.05 9.05 0 0 1 3.32 0A4.494 4.494 0 0 1 17.5 2zm0 2c-.823 0-1.575.4-2.038 1.052l-.095.144-.718 1.176-1.355-.253a7.05 7.05 0 0 0-2.267-.052l-.316.052-1.356.255-.72-1.176A2.5 2.5 0 1 0 4.73 8.265l.131.123 1.041.904-.475 1.295A7 7 0 1 0 19 13c0-.716-.107-1.416-.314-2.083l-.112-.33-.475-1.295 1.04-.904A2.5 2.5 0 0 0 17.5 4zM10 13a2 2 0 1 0 4 0h2a4 4 0 1 1-8 0h2z" />
                                        </svg>
                                    </span>
                                    <span className="font-display text-sm text-jacarta-700 dark:text-white">
                                        All Collections
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    }
                </li>
                <li className="js-nav-dropdown group relative">
                    <Link
                        href="/explore/Rankings"
                        className="dropdown-toggle flex items-center justify-between py-3.5 font-display text-base text-jacarta-700 hover:text-accent focus:text-accent dark:text-white dark:hover:text-accent dark:focus:text-accent lg:px-5"
                        id="navDropdown-1"
                        aria-expanded="false"
                        role="button"
                        data-bs-toggle="dropdown"
                    >
                        Rankings
                    </Link>
                </li>
                <li className="js-nav-dropdown group relative">
                    <Link
                        href="/explore/Launchpad"
                        className="dropdown-toggle flex items-center justify-between py-3.5 font-display text-base text-jacarta-700 hover:text-accent focus:text-accent dark:text-white dark:hover:text-accent dark:focus:text-accent lg:px-5"
                        id="navDropdown-1"
                        aria-expanded="false"
                        role="button"
                        data-bs-toggle="dropdown"
                    >
                        Launchpad
                    </Link>
                </li>
                <li className="js-nav-dropdown group relative">
                    <Link
                        href="/explore/CollabQuests"
                        className="dropdown-toggle flex items-center justify-between py-3.5 font-display text-base text-jacarta-700 hover:text-accent focus:text-accent dark:text-white dark:hover:text-accent dark:focus:text-accent lg:px-5"
                        id="navDropdown-1"
                        aria-expanded="false"
                        role="button"
                        data-bs-toggle="dropdown"
                    >
                        Collab Quests
                    </Link>
                </li>
            </ul>
        </nav>
    )
}

export default MobileNavbar