import { createServer } from "https";
import { readFileSync } from "fs";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(
    {
      key: readFileSync("./localhost-key.pem"),
      cert: readFileSync("./localhost.pem"),
    },
    (req, res) => handle(req, res)
  ).listen(4000, () => {
    console.log("🚀 HTTPS server running at https://localhost:4000");
  });
});