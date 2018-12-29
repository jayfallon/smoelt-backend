# Smoelt Backend

This repository works together with the [Smoelt Frontend](https://github.com/jayfallon/smoelt-frontend) to serve as the backend server. It runs a [graphql-yoga](https://github.com/prisma/graphql-yoga) server over [Nodemon](https://nodemon.io/) on your localhost which talsk to a [Prisma](https://www.prisma.io/) service connected to a remotely hosted MySql database.

In order to connect the service, you will need the `variables.env` file located in the root folder of the repository. Normally, this file would not be included but for presentation purposes I have done so.

Currently, there is an issue with the [Apollo Client](https://www.apollographql.com/docs/react/) on the front end that impedes database connectivity on a remote host, so the application must be installed locally.

### Prerequisites

In order to install and run the server, you will need to have [Node.js](https://nodejs.org/en/download/) installed on your local machine.

#### Check Node.js

To see if Node.js is already installed on your machine, enter the following command in your terminal window:

`node --version`

if it responds with something like: `v10.11.0`, then you are good to proceed without installing Node, otherwise you will need to install it.

#### Install Node.js

Node.js can be installed on machines running macOS, Windows or Linux, along with other platforms, and the preferred method is installing the current LTS version via the appropriate platform installer.

You will also need to have Git installed on your machine and a GitHub account, but I'm assuming that is already the case.

### Installing the Smoelt Backend

Once you have Node.js installed on your machine, create a folder for the application using your terminal app:

`mkdir smoelt && cd smoelt`

#### Clone

Next, clone the application:

`git clone https://github.com/jayfallon/smoelt-backend.git`

The repository is private but I have added you as a collaborator and you have access to the repository. If you are unable to clone the repository, please let me know and I will figure out another method to facilitate installation.

#### Install

Once the repository has been cloned, you will need to install the Node modules from the root folder of the Backend repository:

`cd smoelt-backend && npm install`

This should take no more than a moment and you may get some warnings about packages but I've completed a package audit as of 12/29/18 and the server work fine.

#### Run

Once installed all of the node modules, you'll be able to run the server in a dev environment using the following command:

`npm run dev`

and the output on your terminal should read:

```
[nodemon] 1.18.7
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: *.*
[nodemon] starting `node --inspect src/index.js`
Debugger listening on ws://127.0.0.1:9229/0fc55924-550d-47dc-ae92-5b70ec3e27c8
For help, see: https://nodejs.org/en/docs/inspector
Server is now running on port http:/localhost:4444
```

#### Check

If this is the case, your yoga-graphql server is now running on port 4444. To check if this is correct, please go to [http://localhost:4444/](http://localhost:4444/) in your browser where you should see the GraphiQL interface.

In the left pane, you can run the following command to see all of the items currently listed in the database:

```
query {
  items {
    id
    title
  }
}
```

This should produce a long list of items with the following output as a shortened example:

```
{
  "data": {
    "items": [
      {
        "id": "cjpy2umntbvzi0a49nyf7kbd2",
        "title": "Movie Night"
      }
    ]
  }
}
```

#### Install the Smoelt Frontend

Once your server is up and running, you can proceed to install the [Smoelt Frontend](https://github.com/jayfallon/smoelt-frontend).

If this is not case and you are not having any luck, please let me know and I will provide a fix.
