const { ApolloServer } = require('@apollo/server');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');

const { getDatabase, ref, set, get, child, update } = require("firebase/database");

const { expressMiddleware } = require('@apollo/server/express4');
const serverlessExpress = require('@vendia/serverless-express');
const cors = require('cors');
const http = require('http');
const bodyParser  = require('body-parser');
const express = require('express');

const { PubSub } = require('graphql-subscriptions');

const { startServerAndCreateLambdaHandler, handlers } = require('@as-integrations/aws-lambda');

const { initializeApp }  = require("firebase/app");

const firebaseConfig = {
  apiKey: process.env.NODE_FIREBASE_SECRET,
  authDomain: "letmeask-97faa.firebaseapp.com",
  databaseURL: "https://letmeask-97faa-default-rtdb.firebaseio.com",
  projectId: "letmeask-97faa",
  storageBucket: "letmeask-97faa.appspot.com",
  messagingSenderId: "592076087336",
  appId: "1:592076087336:web:30f490a3e0b48f4a14d51d"
};

// Initialize Firebase
initializeApp(firebaseConfig);

const app = express();
const httpServer = http.createServer(app);

const pubsub = new PubSub();

const typeDefs = `
  type Vote {
    option: String
    votes: Int
  }
  
  type Enquete {
    title: String
    votes: [Vote]
  }

  type Query {
    enquetes: [Enquete]
    enquete(title: String): Enquete
  }

  type Mutation {
    addEnquete(title: String, options: [String]): Enquete,
    voteEnquete(title: String, option: String): Enquete
  }

  type Subscription {
    enqueteCreated: Enquete,
    enqueteUpdated: Enquete
  }
`;

const resolvers = {
  Query: {
    enquetes: async () => {
      const db = getDatabase();

      return await get(child(ref(db), `enquetes`)).then((snapshot) => {
        const obj = snapshot.val()
        return Object.keys(obj).map(key => ({
          title: key,
          ...obj[key]
        }))
      })
    },
    enquete: async (_, { title }) => {
      const db = getDatabase();

      return await get(child(ref(db), `enquetes/${title}`)).then((snapshot) => {
        const obj = snapshot.val()

        return {
          title,
          ...obj
        }
      })
    }
  },
  Mutation: {
    addEnquete(_, { title, options }) {
      const votes = options.map(option => ({
        option,
        votes: 0
      }))

      const db = getDatabase();

      set(ref(db, `enquetes/${title}`), {
        votes: votes
      });

      const enquete = {
        title,
        votes
      }

      pubsub.publish('ENQUETE_CREATED', { enqueteCreated: enquete }); 

      return enquete
    },
    voteEnquete: async (_, { title, option }) => {
      const db = getDatabase();

      await get(child(ref(db), `enquetes/${title}`)).then((snapshot) => {
        if (snapshot.exists()) {
          const newVotes = snapshot.val().votes.map(vote => ({
            option: vote.option,
            votes: vote.option === option ? ++vote.votes : vote.votes
          }))

          update(ref(db, `enquetes/${title}`), {
            votes: newVotes
          });

          pubsub.publish('ENQUETE_UPDATED', { enqueteUpdated: {title, votes: newVotes} }); 

          return snapshot.val()
        } else {
          console.log("No data available");
        }
      })
    },
  },
  Subscription: {
    enqueteCreated: {
      subscribe: () => pubsub.asyncIterator(['ENQUETE_CREATED'])
    },
    enqueteUpdated: {
      subscribe: () => pubsub.asyncIterator(['ENQUETE_UPDATED'])
    }
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/',
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,  
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),

    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ]
});

server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

app.use(
  '/',
  cors(),
  bodyParser.json(),  
  expressMiddleware(server),
);

exports.graphqlHandler = serverlessExpress({ app });



// const PORT = 4000;
// // Modified server startup
// new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
