import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from '@apollo/client/core';
import fetch from 'cross-fetch';

function getHttpLink(httpURL, token) {
  return new HttpLink({
    uri: httpURL,
    fetch,
    headers: { 'x-hasura-admin-secret': token },
  });
}

export default function makeApolloClient(httpURL, wsURL, token) {
  const httpLink = getHttpLink(httpURL, token);
  const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
  return client;
}
