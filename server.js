import { createBot } from 'whatsapp-cloud-api';
import dotenv from "dotenv";

const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}

(async () => {
  try {
    const from = process.env.whatsapp_phone_id;
    const token = process.env.whatsapp_token;
    const webhookVerifyToken = process.env.web_hook_token;

    const bot = createBot(from, token);

    await bot.startExpressServer({
      webhookVerifyToken,
    });

    bot.on('message', async (msg) => {
      console.log(msg);
    });
  } catch (err) {
    console.log(err);
  }
})();
