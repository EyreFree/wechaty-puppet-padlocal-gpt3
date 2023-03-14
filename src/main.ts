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
        // handle message for customized task handlers
        await chatGPTBot.onCustimzedTask(message);
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
