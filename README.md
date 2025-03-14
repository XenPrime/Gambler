# Red or Black Discord Bot - Railway Deployment Guide

## Prerequisites

1. A Railway account (https://railway.app/)
2. A GitHub account
3. Your Discord bot token and credentials

## Deployment Steps

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to a GitHub repository
2. Ensure you have a `.env.example` file in your repository
3. Verify `package.json` has the correct start script:
   ```json
   {
     "scripts": {
       "start": "node bot.js"
     }
   }
   ```

### Step 2: Deploy to Railway

1. Log in to Railway using your GitHub account
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your bot repository
5. Click "Deploy Now"

### Step 3: Configure Environment Variables

1. In your Railway project, go to the "Variables" tab
2. Add the following environment variables:
   ```
   DISCORD_BOT_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   CLIENT_SECRET=your_client_secret_here
   GUILD_ID=your_guild_id_here
   INITIAL_BALANCE=1000
   MIN_BET=1
   MAX_BET=10000
   ```

### Step 4: Verify Deployment

1. Go to the "Deployments" tab to check if your bot is deployed successfully
2. Click on "View Logs" to monitor your bot's status
3. Your bot should now be online and ready to use in your Discord server

## Maintenance

- Railway will automatically deploy new changes when you push to your GitHub repository
- You can monitor your bot's performance and logs in the Railway dashboard
- To update environment variables, use the "Variables" tab in your Railway project

## Troubleshooting

1. If your bot is offline:
   - Check the deployment logs for errors
   - Verify your environment variables are set correctly
   - Ensure your Discord bot token is valid

2. If commands aren't working:
   - Check if the bot has the correct permissions in your Discord server
   - Verify the GUILD_ID is correct
   - Look for any error messages in the Railway logs

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Discord.js Guide](https://discordjs.guide/)
- [Discord Developer Portal](https://discord.com/developers/applications)