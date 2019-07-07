import { gql } from 'apollo-server-express';

export default gql`
  type AuthResponse {
    token: String
    name: String
  }

  input AuthInput {
    accessToken: String!
  }

  extend type Query {
    users: [User!]
    user(id: ID!): User
    me: User
  }

  extend type Mutation {
    signUp(
      username: String!
      email: String!
      password: String!
    ): Token!
    authGoogle(input: AuthInput!): AuthResponse
    signIn(login: String!, password: String!): Token!
    deleteUser(id: ID!): Boolean!
  }

  type Token {
    token: String!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    role: String
    links: [Link!]
  }
`;
