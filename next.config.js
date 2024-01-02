/** @type {import('next').NextConfig} */
const nextConfig = {

    // For the "/sign-in" and "/sign-up" to work with the KindeAuth (since there's no page files for these two paths, need to add a destination when the source lands on these url paths). These two paths exits here but need to add redirect to put the user to correct and clean url of the destination.
    async redirects() {
        return [
            {
                // Source paths obtained from "src\components\MobileNav.tsx" and will be redirect to the destination.
                source: "/sign-in",
                // These two destination paths below are from Kinde "NextJS Pages Router SDK v1" so prebuilt paths for login and register. Link: "https://kinde.com/docs/developer-tools/nextjs-prev-sdkv1/#api-endpoints"
                destination: "/api/auth/login", // redirect you to login at the KindeAuth server
                permanent: true,
            },
            {
                source: "/sign-up",
                destination: "/api/auth/register", // redirect you to register at the KindeAuth server
                permanent: true,
            }
        ]
    },

    // NEW - need a custom webpack inside Next.js config. Followed on Document but expanded on github issue (link: https://github.com/wojtekmaj/react-pdf/issues/799). 'config' is a function.
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Disabled for server-side rendering only
        config.resolve.alias.canvas = false // From npm document
        config.resolve.alias.encoding = false // From GitHub
        return config
    },

    // -- Based from 'npm react-pdf' Document. They only include '...canvas = false'
    // webpack: (config) => {
    //     config.resolve.alias.canvas = false;

    //     return config;
    // },
}

module.exports = nextConfig
