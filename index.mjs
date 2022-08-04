import express from "express";
import { Webhook, MessageBuilder } from "discord-webhook-node";
import fs from "fs";
import axios from "axios";

//import config json
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

//create webserver
const app = express();

//Call for twitch title
const stats = await axios.get(config.twitch_status);
let data_title = stats.data;
console.log(stats.data);

//Call for twitch category/game
const category = await axios.get(config.twitch_category);
let data_category = category.data;
console.log(category.data);

//Call for twitch view count (at the time of posting)
const viewer = await axios.get(config.twitch_viewers);
let data_viewers = viewer.data;
console.log(viewer.data);

//Call for twitch follower count
const follow = await axios.get(config.twitch_follow);
let data_follow = follow.data;
console.log(follow.data);

//create webhook
const hook = new Webhook(config.webhook_URL);

app.get("/stream/start", async (req, res) => {
  if (config.webhook_name !== "") hook.setUsername(config.webhook_name);
  if (config.webhook_avatar !== "") hook.setAvatar(config.webhook_avatar);

  if (config.use_embed) {
    const embed = new MessageBuilder();
    //Non-embed text with premade message and title
    embed.setText(config.non_embed_text + data_title);
    //embedded text title with hyperlink
    embed.setTitle(data_title);
    embed.setURL(config.twitch_url);
    //embed accent color
    embed.setColor(config.embed_config.color);
    //embed.setDescription(config.embed_config.description);
    //description with twitch category data
    embed.setDescription("Category: " + data_category);
    embed.addField("Viewers: ", data_viewers);
    embed.addField("Followers: ", data_follow);
    embed.setImage(config.embed_config.image);
    if (config.embed_config.show_timestamp) embed.setTimestamp();
    hook.send(embed);
  }

  return res.json({
    success: true,
    message: "Stream started, notification sent!",
  });
});

app.listen(config.server_port, () => {
  console.log(`Application is listening on port ${config.server_port}`);
});
