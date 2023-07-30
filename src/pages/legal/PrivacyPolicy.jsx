import Head from 'next/head'
import React from 'react'

const PrivacyPolicy = ({ theme }) => {
    return (
        <div className={`${theme}`}>
            <Head>
                <title>Privacy Policy - Venomart Marketplace</title>
                <meta
                    name="description"
                    content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain"
                />
                <meta
                    name="keywords"
                    content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.png" />
            </Head>
            <section className="relative pt-48 pb-16 dark:bg-jacarta-800 md:pb-24">
                <div className="container">
                    <h1 className="text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                        Privacy Policy
                    </h1>
                    <div className="article-content mx-auto max-w-[48.125rem]">
                        <p>Last Updated: July 30, 2023</p>
                        <p>
                            Venomart was built with your privacy in mind. This Privacy Policy (“Policy”) describes how we at Venomart collect, use, share, and secure your Personal Data when you visit the Venomart Platform (https://venomart.space/ , Application and Services) (the “Platform”) or use it by creating, buying, transfering, or trading unique Venomart Goods in our Market (the “Market”).
                        </p>
                        <p>
                            By accessing the Platform or trading Venomart goods through the Marketplace services, you consent to following this Privacy Policy and our Terms of Use.
                        </p>
                        <h2 className="text-base">Personal Information We Collect</h2>
                        <p>
                            We collect information capable of identifying you as an individual (“Personal Information”). When ordering or registering on our Platform you may be asked to enter email address or other details to help you with your experience
                        </p>

                        <p>
                            Creating a User Account : If you sign up to use our Platform, we collect your Venom wallet address, username, and email address. The User has the possibility to provide their full name, location, biographical information, and social network link.
                        </p>

                        <p>
                            Applying as an Artist : If you want to join the world’s top digital artists in our Marketplace, we collect your first and last name, email address, a short application video, Venom wallet address, and information about your art.
                        </p>

                        <p>
                            Visiting the Site, Marketplace, App : We collect basic analytics data when you access or use the Venomart Platform. See our Cookies Policy below for more information about the Cookies we use and what data they may collect.
                        </p>

                        <h2>How do we use your information ?</h2>

                        <p>
                            We use the Personal Information we collect to: <br />
                            1) To quickly identify and process your transactions <br />
                            2) Personalize your experience and allow us to deliver the type of content and product offerings in which you are most interested <br />
                            3) Notify and inform you with critical updates, confirmations, security alerts or about products, services news or promotional opportunities we think might interest you <br />
                            4) Provide support or respond to your comments or questions <br />
                            5) Analyze and improve our Platform to better serve you. <br />
                        </p>

                        <h2>How do we protect your information?</h2>

                        <p>
                            Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential. In addition, all sensitive/credit information you supply is encrypted via Secure Socket Layer (SSL) technology.
                        </p>
                        <p>
                            We implement a variety of security measures when a user enters, submits, or accesses their information to maintain the safety of your personal information.

                        </p>

                        <h2>Third-party disclosure</h2>

                        <p>
                            We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential. We may also release information when it's release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property or safety.
                        </p>

                        <h2>Your Rights</h2>

                        <p>
                            You may contact us at venomart.space@gmail.com to update or correct any Personal Information we collected about you. <br />
                            If at any time you would like to unsubscribe from receiving future emails, you can email us at venomart.space@gmail.com  and we will promptly remove you from ALL correspondence.
                        </p>

                        <h2>Changes to this Policy</h2>
                        <p>
                            Our commitment to preserving your privacy will not change, but our Platform may evolve. The most current version of this policy will be posted on the Site with the “Last Updated” date at the top of the policy changed.If we make material changes to this Privacy Policy, we will use reasonable means to inform you and, where necessary, obtain your consent.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default PrivacyPolicy