import makeApolloClient from './utils/makeApolloClient';
import gql from 'graphql-tag';

const CREATE_BANNED_ACCOUNTS = gql`
  mutation CreateBannedAccounts($objects: [banned_accounts_insert_input!]!) {
    insert_banned_accounts(objects: $objects) {
      affected_rows
    }
  }
`;

const GET_PROFILES_SERVERS = gql`
  query GetProfilesInfo {
    profiles_info {
      id
      server_ip
      started_at
      server {
        id
      }
    }
  }
`;

class ApiServiceServers {
  client;

  constructor(client) {
    this.client = client;
  }

  getAccountServers = async () => {
    try {
      const result = await this.client.query({
        query: GET_PROFILES_SERVERS,
      });
      console.log(result.data.profiles_info);
      return result.data.profiles_info;
    } catch (err) {
      console.error('ERROR getAccountServers:', err);
    }
  };
}

const client = makeApolloClient(
  process.env.REACT_APP_API_SERVERS_URL,
  process.env.REACT_APP_API_SERVERS_WS_URL,
  localStorage.getItem('adminServersSecret')
);
const apiServiceServers = new ApiServiceServers(client);
export default apiServiceServers;
