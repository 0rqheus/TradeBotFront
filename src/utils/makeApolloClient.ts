import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from '@apollo/client/core';
import fetch from 'cross-fetch';

export default function makeApolloClient(httpURL: string, token?: string) {
  const httpLink = new HttpLink({
    uri: httpURL,
    fetch,
    headers: token ? { 'x-hasura-admin-secret': token } : undefined,
  })

  const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });

  return client;
}
