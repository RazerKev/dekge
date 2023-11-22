/** @type {import('next').NextConfig} */
const nextConfig = {
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
