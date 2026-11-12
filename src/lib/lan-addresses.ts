import { networkInterfaces } from "node:os";

// This machine's IPv4 addresses on the local network, so the dev server can
// be opened from a phone or another device (e.g. http://192.168.1.20:3000).
export const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === "IPv4" && !net.internal)
  .map((net) => net!.address);
