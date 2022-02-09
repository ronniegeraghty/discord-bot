# discord-bot<!-- omit in toc -->

A discord bot to run and host yourself to bring music playback to your discord server.

## Contents<!-- omit in toc -->

- [Set Up](#set-up)
  - [Create Bot](#create-bot)
  - [RunTime Env](#runtime-env)
    - [Container](#container)
      - [Pull from GHCR](#pull-from-ghcr)
      - [Build from Source](#build-from-source)
    - [Node](#node)
  - [Add Bot to Discord Channel](#add-bot-to-discord-channel)
  - [Add Slash Commands](#add-slash-commands)
- [Features](#features)

## Set Up

### Create Bot

### RunTime Env

#### Container

##### Pull from GHCR

##### Build from Source

#### Node

To run the bot in a Node.js environment follow these steps. _Note: Requires [Node.js](https://nodejs.org/en/download/) v16 or higher & and MongoDB database._

- Run the following commands in a terminal.

  - ```shell
    git clone https://github.com/ronniegeraghty/discord-bot.git
    cd discord-bot
    npm i
    .\ci\postInstallFixes.sh
    npm run build
    mv .env.example .env
    ```

- Edit the .env file with the specifics for your bot. For the Node.js runtime you'll only need to fill out the environment variables in the `#Discord Bot Config` & `#Mongo DB Config` sections.
- Run the start command in the terminal.

  - ```shell
    npm run start
    ```

### Add Bot to Discord Channel

### Add Slash Commands

## Features

- Music Playback: Play audio of youtube videos in a discord voice channel.
  - Ex: `/play url:https://www.youtube.com/watch?v=5aopMm7UGYA&ab_channel=BaconAkin`
