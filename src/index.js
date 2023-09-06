const { ApolloServer } = require('@apollo/server');

const { makeExecutableSchema } = require('@graphql-tools/schema');

const { expressMiddleware } = require('@apollo/server/express4');
const serverlessExpress = require('@vendia/serverless-express');
const cors = require('cors');
const http = require('http');
const bodyParser  = require('body-parser');
const express = require('express');

import { makeServer } from 'graphql-lambda-subscriptions'

const { initializeApp }  = require("firebase/app");
const firebaseConfig = require("./Firebase/config")

const typeDefs= require("./Types/index")

const querys = require("./Resolvers/querys")
const mutations = require("./Resolvers/mutations")
const subscriptions = require("./Resolvers/subscriptions")

// Initialize Firebase
initializeApp(firebaseConfig);

const app = express();
const httpServer = http.createServer(app);

const resolvers = {
  Query: querys,
  Mutation: mutations,
  Subscription: subscriptions
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

// const wsServer = new WebSocketServer({
//   server: httpServer,
//   path: '/',
// });

// const serverCleanup = useServer({ schema }, wsServer);

const subscriptionServer = makeServer({
  schema,
})

// const server = new ApolloServer({
//   schema,  
//   plugins: [
//     ApolloServerPluginDrainHttpServer({ httpServer }),

//     {
//       async serverWillStart() {
//         return {
//           async drainServer() {
//             await serverCleanup.dispose();
//           },
//         };
//       },
//     },
//   ]
// });

const server = new ApolloServer({
  schema,
  httpServer
});

server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

app.use(
  '/',
  cors(),
  bodyParser.json(),  
  expressMiddleware(server),
);

exports.webSocket = subscriptionServer;
exports.graphqlHandler = serverlessExpress({ app });

// const PORT = 4000;
// // Modified server startup
// new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
