# **State Trackmania Bot discord.js**

This repository contains a small Discord bot built with **discord.js**. The bot interacts with the Trackmania.io API to display player stats and leaderboards right inside a Discord server. It exposes a set of slash commands that query campaigns, Track of the Day information and player profiles. All commands are located in the `commands/` folder and are automatically registered using `deploy-commands.js`.

The bot keeps no persistent state; every command performs live requests against the Trackmania API. Authentication to the Trackmania services is handled in `functions/authentication.js`.

## Getting stated

If you want to quickly get this bot up and running on your environment:

1. Begin to clone this repository to your environment.

```
git clone https://github.com/allanjacob/state-trackmania-bot.git
```
Install the following:

```
npm install discord.js

npm install trackmania-api-node

npm install trackmania.io

npm install dotenv
```

6. Create a file named `.env` in the project home directory (same directory as `index.js`). Copy and paste the contents below to your `.env` file. You will need to fill in following sequence of API keys and tokens:

```
DISCORD_TOKEN =
CLIENT_ID =
GUILD_ID =
UBI_USERNAME =
UBI_PASSWORD =
GROUP_UID =
```

- DISCORD_TOKEN: The discord bot token. This token is located under the `Bot` section in your selected App in the Discord Developer Portal.
- CLIENT_ID:The discord bot Application ID. This is found on the `General Information` page located under your discord bot on the Discover Developer portal.
- GUILD_ID: This is the ID of your Discord server.
- UBI_USERNAME: This is the email address used to login into Ubisoft.
- UBI_PASSWORD: Password used to log into Ubisoft.
- GROUP_UID: This is the group ID for your trackmania state or campaign group. To fetch this information, you might need to use the [Http inspector](https://openplanet.dev/plugin/httpinspect) plugin created by [Miss](https://github.com/sponsors/codecat) to inspect your incoming and outgoing packets to get your group ID.

7. Run the following command to start running the project:

```
node index.js
```

## Commands

| Command            | Description                                                                          | Example                                     |
| ------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| **currentleaders** | Get the current score leaders for your state for the current campaign                | /currentleaders                             |
| **currentrecords** | Get the top 5 records for a particular track in the current campaign                 | /currentrecords 15                          |
| **playerprofile**  | Get a player's profile                                                               | /playerprofile Wirtual                      |
| **records**        | Get records for a particular track in any campaign (this command does not work well) | /records campaign:summer 2020 tracknumber:1 |
| **totdrecords**    | Get the top 5 records for the Track of the Day                                       | /totdrecords                                |
| **weeklyshorts**   | Get embeds for all Weekly Short maps with the top 5 players    | /weeklyshorts                               |
