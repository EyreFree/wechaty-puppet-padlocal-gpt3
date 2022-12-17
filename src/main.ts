import { WechatyBuilder } from "wechaty";
import { PuppetPadlocal } from 'wechaty-puppet-padlocal';
import { QRCodeTerminal, EventLogger } from 'wechaty-plugin-contrib';
import { ChatGPTBot } from "./chatgpt.js";
import { Config } from "./config.js";

// Wechaty instance
const weChatBot = WechatyBuilder.build({
  name: "wechat-assistant",
  puppet: new PuppetPadlocal({
    token: Config.padLocalToken,
  }),
});
// ChatGPTBot instance
const chatGPTBot = new ChatGPTBot();

async function main() {
  weChatBot.use(QRCodeTerminal({ small: false }))
  weChatBot.use(EventLogger())
  weChatBot
    // login to WeChat desktop account
    .on("login", async (user: any) => {
      console.log(`✅ User ${user} has logged in`);
      chatGPTBot.setBotName(user.name());
      await chatGPTBot.startGPTBot();
    })
    // message handler
    .on("message", async (message: any) => {
      try {
        console.log(`📨 ${message}`);
        // add your own task handlers over here to expand the bot ability!
        // e.g. if a message starts with "Hello", the bot sends "World!"
        if (message.text().startsWith("Hello")) {
          await message.say("World!");
          return;
        }
        // handle message for chatGPT bot
        await chatGPTBot.onMessage(message);
      } catch (e) {
        console.error(`❌ ${e}`);
      }
    });

  try {
    await weChatBot.start();
  } catch (e) {
    console.error(`❌ Your Bot failed to start: ${e}`);
    console.log(
      "🤔 Can you login WeChat in browser? The bot works on the desktop WeChat"
    );
  }
}
main();
