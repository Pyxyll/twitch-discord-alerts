import express from "express";
import { Webhook, MessageBuilder } from "discord-webhook-node";
import fs from "fs";
import axios from "axios";

//import config json
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

//create webserver
const app = express();

//call twitch title
const res = await axios.get(config.twitch_status);
let data_title = res.data;
console.log(res.data);

//create webhook
const hook = new Webhook(config.webhook_URL);

app.get("/stream/start", async (req, res) => {
  if (config.webhook_name !== "") hook.setUsername(config.webhook_name);
  if (config.webhook_avatar !== "") hook.setAvatar(config.webhook_avatar);

  if (config.use_embed) {
    const embed = new MessageBuilder();
    embed.setTitle(data_title);
    embed.setColor(config.embed_config.color);
    embed.setDescription(config.embed_config.description);
    embed.setImage(config.embed_config.image);
    if (config.embed_config.show_timestamp) embed.setTimestamp();
    if (config.non_embed_text !== "") await hook.send(config.non_embed_text);
    await hook.send(embed);
  } else {
    await hook.send(config.non_embed_text);
  }

  return res.json({
    success: true,
    message: "Stream started, notification sent!",
  });
});

app.listen(config.server_port, () => {
  console.log(`Application is listening on port ${config.server_port}`);
});
