import { createBot } from 'whatsapp-cloud-api';
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { updateStr} from "./firebase-utils.js";
import { child, get, getDatabase, ref, set,  push, runTransaction } from "firebase/database";
const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.firebase_api_key,
  databaseURL: process.env.firebase_database_url,
  projectId: process.env.firebase_project_id,
  appId: process.env.firebase_app_id
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
const db = getDatabase();

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
      const msgListRef = ref(db, 'messages');
      const newMessageRef = push(msgListRef);
      set(newMessageRef, {
        msg
      });
    });
  } catch (err) {
    console.log(err);
  }
})();
