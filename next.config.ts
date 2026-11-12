import type { NextConfig } from "next";

import { lanAddresses } from "./src/lib/lan-addresses";

// The dev server only serves its dev resources (HMR, client chunks) to
// localhost by default. Allow this machine's own LAN addresses so the app
// hydrates when opened from a phone or another device on the network.

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: lanAddresses,
  experimental: {
    // Dev only. Next streams React debug info over the HMR WebSocket by
    // default; when a navigation is redirected (e.g. /account -> /sign-in),
    // late chunks hit an already-closed stream and Firefox and Safari log
    // "Cannot write to a CLOSED writable stream". Inline it in the RSC
    // payload instead. Remove once fixed upstream.
    reactDebugChannel: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-*",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
