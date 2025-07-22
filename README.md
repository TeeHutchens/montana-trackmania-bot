# **State Trackmania Bot discord.js**

A simple trackmania bot used to fetch state trackmania records within state groups.

## Getting started

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
ALLOWED_COMMANDS =
```

- DISCORD_TOKEN: The discord bot token. This token is located under the `Bot` section in your selected App in the Discord Developer Portal.
- CLIENT_ID:The discord bot Application ID. This is found on the `General Information` page located under your discord bot on the Discover Developer portal.
- GUILD_ID: This is the ID of your Discord server.
- UBI_USERNAME: This is the email address used to login into Ubisoft.
- UBI_PASSWORD: Password used to log into Ubisoft.
- GROUP_UID: This is the group ID for your trackmania state or campaign group. To fetch this information, you might need to use the [Http inspector](https://openplanet.dev/plugin/httpinspect) plugin created by [Miss](https://github.com/sponsors/codecat) to inspect your incoming and outgoing packets to get your group ID.
- ALLOWED_COMMANDS: Comma separated list of slash commands that the bot should register. Defaults to `totdrecords` if not set.

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
| **totdrecords**    | Get the top 5 records for the current Track of the Day (TOTD)                        | /totdrecords                                |
| **trackmania**     | Get region score leaders for the current official campaign                           | /trackmania region:Quebec                   |
