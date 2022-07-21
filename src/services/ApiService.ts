import { ApolloClient } from '@apollo/client/core';
import makeApolloClient from './utils/makeApolloClient';
import gql from 'graphql-tag';

class ApiService {
  protected client: ApolloClient<any>;

  constructor(client: ApolloClient<any>) {
    this.client = client;
  }

  GET_ACCOUNTS = gql`
    query GetAccounts {
      Account {
        email
      }
    }
  `;

  getAccounts = async () => {
    try {
      const result = await this.client.query({
        query: this.GET_ACCOUNTS,
      });
      return result.data.Account;
    } catch (err) {
      console.log('ERROR:', err);
    }
  };
}

const client = makeApolloClient(process.env.REACT_APP_API_URL!);
const apiService = new ApiService(client);
export { apiService };
