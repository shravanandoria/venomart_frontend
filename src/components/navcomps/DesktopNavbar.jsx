import Link from 'next/link'
import React from 'react'

const DesktopNavbar = () => {
    return (
        <div className="navbar w-full">
            <ul className="flex flex-col lg:flex-row">
                <li className="js-nav-dropdown group relative">
                    <Link
                        href="#"
                        className="dropdown-toggle flex items-center justify-between py-3.5 font-display text-base text-jacarta-700 hover:text-accent focus:text-accent dark:text-white dark:hover:text-accent dark:focus:text-accent lg:px-5"
                        id="navDropdown-4"
                        aria-expanded="false"
                        role="button"
                        data-bs-toggle="dropdown"
                    >
                        Explore
                    </Link>
                    <ul
                        className="dropdown-menu group-hover:visible lg:invisible left-0 top-[85%] z-10 hidden min-w-[200px] gap-x-4 whitespace-nowrap rounded-xl bg-white transition-all will-change-transform group-hover:opacity-100 dark:bg-jacarta-800 lg:absolute lg:grid lg:translate-y-4 lg:py-4 lg:px-2 lg:opacity-0 lg:shadow-2xl lg:group-hover:translate-y-2"
                        aria-labelledby="navDropdown-4"
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
                </li>

                <li className="js-nav-dropdown group relative">
                    <Link
                        href="#"
                        className="dropdown-toggle flex items-center justify-between py-3.5 font-display text-base text-jacarta-700 hover:text-accent focus:text-accent dark:text-white dark:hover:text-accent dark:focus:text-accent lg:px-5"
                        id="navDropdown-4"
                        aria-expanded="false"
                        role="button"
                        data-bs-toggle="dropdown"
                    >
                        Stats
                    </Link>
                    <ul
                        className="dropdown-menu group-hover:visible lg:invisible left-0 top-[85%] z-10 hidden min-w-[200px] gap-x-4 whitespace-nowrap rounded-xl bg-white transition-all will-change-transform group-hover:opacity-100 dark:bg-jacarta-800 lg:absolute lg:grid lg:translate-y-4 lg:py-4 lg:px-2 lg:opacity-0 lg:shadow-2xl lg:group-hover:translate-y-2"
                        aria-labelledby="navDropdown-4"
                    >
                        <li>
                            <Link
                                href="/explore/Activity"
                                className="flex items-center rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                            >
                                <span className="mr-3 rounded-xl bg-light-base p-[0.375rem]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="h-4 w-4 fill-[#46C7E3]">
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.29-2.333A17.9 17.9 0 0 1 8.027 13H4.062a8.008 8.008 0 0 0 5.648 6.667zM10.03 13c.151 2.439.848 4.73 1.97 6.752A15.905 15.905 0 0 0 13.97 13h-3.94zm9.908 0h-3.965a17.9 17.9 0 0 1-1.683 6.667A8.008 8.008 0 0 0 19.938 13zM4.062 11h3.965A17.9 17.9 0 0 1 9.71 4.333 8.008 8.008 0 0 0 4.062 11zm5.969 0h3.938A15.905 15.905 0 0 0 12 4.248 15.905 15.905 0 0 0 10.03 11zm4.259-6.667A17.9 17.9 0 0 1 15.973 11h3.965a8.008 8.008 0 0 0-5.648-6.667z"></path>
                                    </svg>
                                </span>
                                <span className="font-display text-sm text-jacarta-700 dark:text-white">
                                    Activity
                                </span>
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/explore/rankings/Collections"
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
                                    Top Collections
                                </span>
                            </Link>
                        </li>

                        {/* <li>
                            <Link
                                href="/explore/rankings/Users"
                                className="flex items-center rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                            >
                                <span className="mr-3 rounded-xl bg-[#FDF7EE] p-[0.375rem]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="h-4 w-4 fill-[#8DD059]">
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="M2 3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H2.992A.993.993 0 0 1 2 20.007V3.993zM4 5v14h16V5H4zm2 2h6v6H6V7zm2 2v2h2V9H8zm-2 6h12v2H6v-2zm8-8h4v2h-4V7zm0 4h4v2h-4v-2z"></path>
                                    </svg>
                                </span>
                                <span className="font-display text-sm text-jacarta-700 dark:text-white">
                                    Top Users
                                </span>
                            </Link>
                        </li> */}
                    </ul>
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

                <li className="hideInDesktop js-nav-dropdown group relative">
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
        </div>
    )
}

export default DesktopNavbar