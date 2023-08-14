require("./config/db");
const express = require("express");
const app = express();
var { graphqlHTTP } = require("express-graphql")
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolver');
const cookieParser = require('cookie-parser');

app.use(
    '/graphql',
    graphqlHTTP((req, res) => ({
      schema: schema,
      rootValue: resolvers,
      graphiql: true,
      context: { req, res },
      credentials: 'include'
    })));
app.use(cookieParser());

const port = process.env.PORT;
app.listen(port, () => {
  console.log("server listening on port " + port);
});