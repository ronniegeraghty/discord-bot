# discord-bot<!-- omit in toc -->

A discord bot to run and host yourself to bring music playback to your discord server.

## Contents<!-- omit in toc -->

- [Run](#run)
  - [Create Bot Account](#create-bot-account)
  - [RunTime Env](#runtime-env)
  - [Add Slash Commands](#add-slash-commands)
- [Features](#features)

## Run

### Create Bot Account

- For steps on how to create a Discord Bot Accont and invite it to your discord server follow the steps here: [Create a Bot Account](https://discordpy.readthedocs.io/en/stable/discord.html)

### RunTime Env

- Pull from GHCR _(Note: Requires Docker and Docker Compose)_

  - ```shell
    git clone https://github.com/ronniegeraghty/discord-bot.git
    cd discord-bot
    mv .env.example .env
    ```

  - Edit the .env file with the specifics for your bot. For the Container runtime you'll need to fill out all th eenvironment variables.

  - ```shell
    docker-compose up
    ```

- Build from Source _(Note: Requires Docker and Docker Compose)_

  - Follow the same steps as [Pull from GHCR](#pull-from-ghcr) section but use the following `docker-compose` command:

    - ```shell
      docker-compose up --build
      ```

- Node

  - To run the bot in a Node.js environment follow these steps. _Note: Requires [Node.js](https://nodejs.org/en/download/) v16 or higher & and MongoDB database._

  - ```shell
    git clone https://github.com/ronniegeraghty/discord-bot.git
    cd discord-bot
    npm i
    .\ci\postInstallFixes.sh
    npm run build
    mv .env.example .env
    ```

  - Edit the .env file with the specifics for your bot. For the Node.js runtime you'll only need to fill out the environment variables in the `#Discord Bot Config` & `#Mongo DB Config` sections.

  - ```shell
    npm run start
    ```

### Add Slash Commands

- Once you can see your discord bot active in your discord server, enter this command in a text channel of the discord server.

- `<prefix>add-slash-commands` Where `<prefix>` is the `PREFIX` environment variable you set.

## Features

- Music Playback: Play audio of youtube videos in a discord voice channel.
  - Ex: `/play url:https://www.youtube.com/watch?v=5aopMm7UGYA&ab_channel=BaconAkin`
