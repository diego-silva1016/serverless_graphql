const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

module.exports = {
    enqueteCreated: {
      subscribe: () => pubsub.asyncIterator(['ENQUETE_CREATED'])
    },
    enqueteUpdated: {
      subscribe: () => pubsub.asyncIterator(['ENQUETE_UPDATED'])
    }
  }