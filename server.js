import { createBot } from 'whatsapp-cloud-api';
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set,  push } from "firebase/database";
import axios from "axios";
import * as fs from 'fs';
import {imageStore} from "./image-store.js";


const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}

axios.defaults.headers.common["Authorization"] = "Bearer " + process.env.whatsapp_token;

const firebaseConfig = {
  apiKey: process.env.firebase_api_key,
  databaseURL: process.env.firebase_database_url,
  projectId: process.env.firebase_project_id,
  appId: process.env.firebase_app_id
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
const db = getDatabase();


async function downloadImage (url) {
  const writer = fs.createWriteStream("./imgfile.png");
  const response = await axios({url, method: 'GET', responseType: 'stream'});
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
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
      const msgListRef = ref(db, 'messages');
      const newMessageRef = push(msgListRef);
      if (msg?.data?.mime_type === "image/jpeg") {
        const mediaId = msg?.data?.id;
        const res = await axios.get(`https://graph.facebook.com/v14.0/${mediaId}`);
        const mediaInfo = await res.data;
        await downloadImage(mediaInfo.url);
        const imageUrl = await imageStore.uploadImage("./imgfile.png");
        mediaInfo.imageUrl = imageUrl;
        msg.data.url = imageUrl;
        console.log(mediaInfo);
      }
      set(newMessageRef, {
        msg
      });
    });
  } catch (err) {
    console.log(err);
  }
})();
