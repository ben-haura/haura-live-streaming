const runtimeCaching = require('next-pwa/cache')

const isProd = process.env.NODE_ENV === 'production'
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

let configObj = {
  publicRuntimeConfig: {
    localeSubpaths: typeof process.env.LOCALE_SUBPATHS === 'string'
      ? process.env.LOCALE_SUBPATHS
      : 'none',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental:{
    // 2 MB data
    largePageDataBytes:2 * 1024 * 1024
  },
  // images: {
  //   domains: [process.env.PUBLIC_URL.replace("http://",'').replace("https://",''),"localhost"],
  // },
}

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === 'production' ? false : true,
  dest: "public",
  register: true,
  skipWaiting: true,
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  runtimeCaching
});


if(isProd && process.env.CDN_URL_FOR_STATIC_RESOURCES ){
  configObj.assetPrefix = process.env.CDN_URL_FOR_STATIC_RESOURCES
}

if(process.env.subFolder.slice(0, -1)){
  configObj.basePath = process.env.subFolder.slice(0, -1)
}

const nextConfig = withPWA(configObj);
module.exports = withBundleAnalyzer(nextConfig)
