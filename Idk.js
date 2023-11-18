const Discord = require('discord.js');
const client = new Discord.Client();

const webhooks = new Map(); // Use a Map to store webhooks for different users
const webhookUsage = new Map(); // Use a Map to store the usage count for each webhook
const MAX_WEBHOOKS = 10; // Maximum number of webhooks to keep

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (message) => {
  // Check if the message was sent by a bot
  if (message.author.bot) return;

  // Check if the message contains a Twitter, Instagram, or "x.com" link
  if (
    message.content.includes('twitter.com') ||
    message.content.includes('instagram.com') ||
    message.content.includes('x.com')
  ) {
    // Delete the original message
    await message.delete();

    // Replace 'twitter.com' or 'instagram.com' with respective values and 'x.com' with 'fixvx.com'
    let modifiedContent = message.content
      .replace(/twitter\.com/g, 'vxtwitter.com')
      .replace(/instagram\.com/g, 'ddinstagram.com')
      .replace(/x\.com/g, 'fixvx.com');

    // Fetch user information
    const member = message.guild.members.cache.get(message.author.id);
    const nickname = member ? member.displayName : message.author.username;
    const avatarURL = message.author.avatarURL();

    // Get or create the webhook for the user
    let webhook = webhooks.get(message.author.id);
    if (!webhook) {
      // Create a new webhook
      webhook = await message.channel.createWebhook(nickname, { avatar: avatarURL });
      webhooks.set(message.author.id, webhook);
      webhookUsage.set(webhook.id, 0); // Initialize usage count
    }

    // Increment usage count for the current webhook
    webhookUsage.set(webhook.id, webhookUsage.get(webhook.id) + 1);

    // Check if the number of webhooks exceeds the limit
    if (webhooks.size > MAX_WEBHOOKS) {
      // Find the least used webhook and delete it
      const leastUsedWebhookId = [...webhookUsage.entries()].sort((a, b) => a[1] - b[1])[0][0];
      const leastUsedWebhook = webhooks.get(leastUsedWebhookId);
      if (leastUsedWebhook) {
        await leastUsedWebhook.delete();
        webhooks.delete(message.author.id);
        webhookUsage.delete(leastUsedWebhookId);
      }
    }

    // Send the modified message using the user's webhook
    await webhook.send(modifiedContent, {
      username: nickname,
      avatarURL: avatarURL,
    });
  }
});

// Replace 'YOUR_BOT_TOKEN' with your actual bot token
client.login('YOUR_BOT_TOKEN');
