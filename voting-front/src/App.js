import { useQuery, gql, useMutation } from '@apollo/client';
import Subscription from './Components/Subscription';
import SubscriptionVote from './Components/SubscriptionVote';
import { MUTATION_ADD_ENQUETE, MUTATION_VOTE_ENQUETE, QUERY_ENQUETES, SUBSCRIPTION_CREATE_ENQUETE, SUBSCRIPTION_VOTE_ENQUETE } from './Resolvers';

function App() {
  const { subscribeToMore, loading, error, data } = useQuery(QUERY_ENQUETES);

  const [addEnquete, _] = useMutation(MUTATION_ADD_ENQUETE);

  const [voteEnquete, __] = useMutation(MUTATION_VOTE_ENQUETE);

  const createEnquete = () => {
    addEnquete({ variables: { title: "Arquitetura", options: ["Monolito", "Microserviço"] } })
  }

  if (loading)
    return <div></div>

  return (
    <div >
      <button onClick={createEnquete}>Criar enquete</button>
      {data?.enquetes?.map(enquete => (
        <div key={enquete.title}>
          <h2>{enquete.title}</h2>
          <ul>
            {enquete.votes.map(vote => (
              <li key={vote.option}>{vote.option}: {vote.votes} votos <button onClick={() => voteEnquete({ variables: { title: enquete.title, option: vote.option } })}>Votar</button></li>
            ))}
          </ul>
        </div>
      ))}
      <Subscription
        teste={() => subscribeToMore({
          document: SUBSCRIPTION_CREATE_ENQUETE,
          updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) return prev;

            const newEnquete = subscriptionData.data.enqueteCreated;

            return Object.assign({}, prev, {
              enquetes: [newEnquete, ...prev.enquetes]
            });
          }
        })}
      />

      <SubscriptionVote
        teste={() => subscribeToMore({
          document: SUBSCRIPTION_VOTE_ENQUETE,
          updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) return prev;
            const newEnquetes = [...prev.enquetes]

            const enqueteUpdated = subscriptionData.data.enqueteUpdated;

            const index = newEnquetes.findIndex(enq => enq.title === enqueteUpdated.title)

            newEnquetes[index] = enqueteUpdated

            return {enquetes: newEnquetes};
          }
        })}
      />
    </div>
  );
}

export default App;
