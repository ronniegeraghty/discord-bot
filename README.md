# discord-bot<!-- omit in toc -->

[![build-and-release](https://github.com/ronniegeraghty/discord-bot/actions/workflows/docker-build-release.yml/badge.svg)](https://github.com/ronniegeraghty/discord-bot/actions/workflows/docker-build-release.yml)

A discord bot to run and host yourself to bring music playback to your discord server.

## Contents<!-- omit in toc -->

- [Run](#run)
- [Features](#features)

## Run

- Create Bot Account: For steps on how to create a Discord Bot Accont and invite it to your discord server follow the steps here: [Create a Bot Account](https://discordpy.readthedocs.io/en/stable/discord.html)

- ```shell
  git clone https://github.com/ronniegeraghty/discord-bot.git
  cd discord-bot
  mv .env.example .env
  ```

- Edit the .env file with the specifics for your bot. For the Container runtime you'll need to fill out all th environment variables. _For the Node.js runtime you'll only need to fill out the environment variables in the `#Discord Bot Config` & `#Mongo DB Config` sections._

- There are 3 ways to run the app. Pull the container image from GHCR, Rebuild the container locally, or run the app in a Node.js env.

  - Pull Container from GHCR:

    - ```shell
      docker-compose up
      ```

  - Rebuild Container Locally:

    - ```shell
      docker-compose up --build
      ```

  - Node.js: _Note: Requires [Node.js](https://nodejs.org/en/download/) v16 or higher & and MongoDB database._

    - ```shell
      npm i
      .\ci\postInstallFixes.sh
      npm run build
      npm run start
      ```

- Once you can see your discord bot active in your discord server, enter this command in a text channel of the discord server.

  - `<prefix>add-slash-commands` Where `<prefix>` is the `PREFIX` environment variable you set.

- You can test the bot by entering th `/ping` command in a text channel. This bot uses slash commands so you should see the command list pop up once you type a `/` in a text channel.

## Features

- Music Playback: Play audio of youtube videos in a discord voice channel.
  - Ex: `/play url:https://www.youtube.com/watch?v=5aopMm7UGYA&ab_channel=BaconAkin`
