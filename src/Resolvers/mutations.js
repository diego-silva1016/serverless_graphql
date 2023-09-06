const { getDatabase, ref, get, child, update } = require("firebase/database");

const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

module.exports = {
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

                pubsub.publish('ENQUETE_UPDATED', { enqueteUpdated: { title, votes: newVotes } });

                return snapshot.val()
            } else {
                console.log("No data available");
            }
        })
    }
}