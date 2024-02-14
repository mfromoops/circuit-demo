# Overview
Circuit Demo is an exploration of possible integrations for https://getcircuit.com/teams. It's built using Qwik.js and it uses a Bun Server to interface with a local Database using bun:sqlite.
## Requirements
To run this project you'll need to have Bun 1.0.26 or greater as well as an API Token from getcircuit.com/teams and an Access Token from your directus user at https://api.loadds.com
### Note
If you are on Windows, you'll need to use WSl to run bun, since the Windows Release is not stable yet (as of Feb 12, 2024).
## Spin up your local environment
Once you get your API token from Circuit, and your access token from directus, you'll need to ad a .env file inside the circuit-ui folder with the following content
```env
CIRCUIT_API_KEY=<YOUR_TOKEN_HERE>
DIRECTUS_TOKEN=<YOUR_TOKEN_HERE>
```
### Running the DB Client
1. cd into the dbClient folder
2. Run `bun install`
1. The first time you run this project, you'll need to configure an sqlite db by running `bun run init.ts`
2. Run `bun run index.ts` from the `dbClient` directory. 
### Running the Circuit UI
1. cd into circuit-ui
2. run `bun install`
3. run `bun dev`



## Dev Docs
https://developer.team.getcircuit.com/api
