/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable Fast Refresh explicitly
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        // Ensure Fast Refresh is enabled
        fastRefresh: true,
    },

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
        
        // Ensure hot reloading works properly
        if (dev) {
            config.watchOptions = {
                ...config.watchOptions,
                ignored: /node_modules/,
                poll: 1000, // Check for changes every second
                aggregateTimeout: 300, // Delay before rebuilding
            };
        }
        
        return config
    },

    // -- Based from 'npm react-pdf' Document. They only include '...canvas = false'
    // webpack: (config) => {
    //     config.resolve.alias.canvas = false;

    //     return config;
    // },

    // Runtime Error: Invalid src prop on `next/image`, hostname "gravatar.com" is not configured under images in your `next.config.js`. From Next.js website, one of the pages leverages the next/image component, passed a "src" value that uses a hostname in the URL that's not defined in the "images.remotePatterns" in "next.config.js"
    // Solution:  Add the protocol, hostname, port, and pathname to the images.remotePatterns config in next.config.js which is below:
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'gravatar.com',
                port: '',
                pathname: '/avatar/**', // The "**" selects all pathnames in this directory 
            },
        ],
    },
}

module.exports = nextConfig
