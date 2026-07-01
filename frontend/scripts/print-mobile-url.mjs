import os from "node:os";

function getLanIpv4() {
  const nets = os.networkInterfaces();

  for (const name of ["en0", "en1", "wlan0", "eth0"]) {
    const addresses = nets[name];
    if (addresses === undefined) {
      continue;
    }

    for (const address of addresses) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }

  for (const addresses of Object.values(nets)) {
    if (addresses === undefined) {
      continue;
    }

    for (const address of addresses) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }

  return null;
}

const ip = getLanIpv4();

if (ip !== null) {
  console.log("");
  console.log("  Phone: open this URL on the same Wi‑Fi");
  console.log(`  → http://${ip}:5173/`);
  console.log("");
} else {
  console.log("");
  console.log("  Could not detect LAN IP. Check Vite Network URL below.");
  console.log("");
}
