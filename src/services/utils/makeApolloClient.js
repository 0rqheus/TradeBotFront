import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
} from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import fetch from 'cross-fetch';
import { WebSocketLink } from '@apollo/client/link/ws';

function getHttpLink(httpURL) {
  return new HttpLink({
    uri: httpURL,
    fetch,
    // headers: token ? { Authorization: token } : {},
  });
}

function getWssLink(wsUrl) {
  return new WebSocketLink({
    uri: wsUrl,
    options: {
      reconnect: true,
      connectionParams: {
        reconnect: true,
      },
    },
  });
}

function getSplittedLink(httpLink, wsLink) {
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  );

  return splitLink;
}

export default function makeApolloClient(httpURL, wsURL, token = '') {
  const httpLink = getHttpLink(httpURL, token);
  const wssLink = getWssLink(wsURL);
  const splitLink = getSplittedLink(httpLink, wssLink);
  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });

  return client;
}
