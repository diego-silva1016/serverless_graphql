import { gql } from "@apollo/client";

export const QUERY_ENQUETES = gql`query Enquetes {
    enquetes{
      title,
      votes {
        option,
        votes
      }
    }
  }`

export const MUTATION_ADD_ENQUETE = gql`
mutation Mutation($title: String, $options: [String]) {
  addEnquete(title: $title, options: $options) {
    title,
    votes {
      option,
      votes
    }
  }
}
`

export const MUTATION_VOTE_ENQUETE = gql`
mutation Mutation($title: String, $option: String) {
    voteEnquete(title: $title, option: $option) {
      title,
      votes {
        option,
        votes
      }
    }
  }
`

export const SUBSCRIPTION_CREATE_ENQUETE = gql`
subscription Subscription {
enqueteCreated {
  title,
  votes {
    option,
    votes
  }
}
}
`

export const SUBSCRIPTION_VOTE_ENQUETE = gql`
 subscription Subscription {
          enqueteUpdated {
            title,
            votes {
              option,
              votes
            }
          }
        }
`