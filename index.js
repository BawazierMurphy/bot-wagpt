const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { body, validationResult } = require("express-validator");
const express = require("express");
const cors = require("cors");
const basicAuth = require("express-basic-auth");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5002;

const env = {
  BOT_NUMBER: process.env.BOT_NUMBER,
  CLIENT_NUMBER: process.env.CLIENT_NUMBER,
  BASIC_PASS: process.env.BASIC_PASS,
};

app.use(express.json());
app.use(cors());
app.use(
  basicAuth({
    users: { bot: env.BASIC_PASS },
  })
);

const client = new Client({
  puppeteer: {
    executablePath: "/usr/bin/chromium-browser",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  authStrategy: new LocalAuth({
    clientId: "client-one",
  }),
});

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", (session) => {
  console.log("WHATSAPP WEB => Authenticated");
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (message) => {
  const isFromBot = message.from === env.BOT_NUMBER;
  const isFromClient = message.from === env.CLIENT_NUMBER;
  console.log(`FROM ${message.from}`);
  const text = message.body;

  if (isFromClient) {
    const regex = /^\/ask\s+.+$/;

    if (regex.test(text)) {
      const question = text.split("/ask")[1];
      await client.sendMessage(env.BOT_NUMBER, question);
    }
  }

  if (isFromBot) {
    await client.sendMessage(env.CLIENT_NUMBER, text);
  }
});

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`Port Listen on ${port}`);
});
