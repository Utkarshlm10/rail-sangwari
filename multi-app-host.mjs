// Rail Sangwari Multi-App Dedicated Host Server
// Serves 3 completely independent applications on 3 distinct ports:
// Port 3000 -> Rail Sangwari Passenger App
// Port 3001 -> Rail Sahayak Partner App (Coolie Driver Portal at root /)
// Port 3002 -> SECR Station Supervisor & DRM Command Portal (at root /)

import http from "node:http";

const NEXTJS_PORT = 3000;
const SAHAYAK_PORT = 3001;
const SUPERVISOR_PORT = 3002;
const ADMIN_PORT = 3003;

function createProxyServer(targetPath, port, appName) {
  const server = http.createServer((req, res) => {
    // If request is root or empty, rewrite to the target route
    let reqUrl = req.url || "/";
    if (reqUrl === "/" || reqUrl === "") {
      reqUrl = targetPath;
    }

    const options = {
      hostname: "127.0.0.1",
      port: NEXTJS_PORT,
      path: reqUrl,
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${NEXTJS_PORT}`,
        "x-forwarded-host": `localhost:${port}`,
        "x-forwarded-proto": "http",
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on("error", (err) => {
      console.error(`[${appName}] Proxy error:`, err.message);
      if (!res.headersSent) {
        res.writeHead(502, { "Content-Type": "text/plain" });
        res.end(`Bad Gateway: Unable to connect to Rail Sangwari core server on port ${NEXTJS_PORT}.`);
      }
    });

    req.pipe(proxyReq, { end: true });
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`[${appName}] Running at http://localhost:${port}/ and http://0.0.0.0:${port}/`);
  });

  return server;
}

// 1. Sahayak Driver App on Port 3001
const sahayakServer = createProxyServer("/sahayak", SAHAYAK_PORT, "App 2: Sahayak Partner App");

// 2. Station Supervisor Portal on Port 3002
const supervisorServer = createProxyServer("/supervisor", SUPERVISOR_PORT, "App 3: Station Supervisor Portal");

// 3. Central Data Management Dashboard on Port 3003
const adminServer = createProxyServer("/admin", ADMIN_PORT, "App 4: Central Data Manager");

console.log("=================================================");
console.log("   RAIL SANGWARI MULTI-APP DEDICATED HOSTING     ");
console.log("=================================================");
console.log(`• App 1 (Passenger):  http://localhost:${NEXTJS_PORT}/`);
console.log(`• App 2 (Sahayak):    http://localhost:${SAHAYAK_PORT}/`);
console.log(`• App 3 (Supervisor): http://localhost:${SUPERVISOR_PORT}/`);
console.log(`• App 4 (Data Admin): http://localhost:${ADMIN_PORT}/`);
console.log("=================================================");
