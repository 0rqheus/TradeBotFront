import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import fetch from 'cross-fetch';

function getHttpLink(httpURL: string, token: string) {
  return new HttpLink({
    uri: httpURL,
    fetch,
    // headers: token ? { Authorization: token } : {},
  });
}

export default function makeApolloClient(httpURL: string, token: string = '') {
  const httpLink: HttpLink = getHttpLink(httpURL, token);
  const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });

  return client;
}
