const { gql } = require('apollo-server');
const schema = qql`
    type Aluno{
        id: ID!
        nomeCompleto: String!
        idade: Int
    }
`

module.exports = schema;