import express from 'express';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { registerCommands } from './bot/commands.js';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const ADMIN_ID = process.env.ADMIN_ID;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN is required');
  process.exit(1);
}

const app = express();
app.use(express.json());

const bot = new Telegraf(BOT_TOKEN);

registerCommands(bot, ADMIN_ID);

bot.catch((err, ctx) => {
  console.error(`Bot error for ${ctx.updateType}:`, err);
});

app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body, res);
});

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, async () => {
  console.log(`DY SHOWS bot server running on port ${PORT}`);

  if (WEBHOOK_URL) {
    try {
      await bot.telegram.setWebhook(`${WEBHOOK_URL}/webhook`);
      const info = await bot.telegram.getWebhookInfo();
      console.log('Webhook set:', info.url);
    } catch (err) {
      console.error('Failed to set webhook:', err.message);
    }
  } else {
    console.warn('WEBHOOK_URL not set — webhook not registered');
  }
});
