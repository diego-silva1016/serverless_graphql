module.exports = `
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
`