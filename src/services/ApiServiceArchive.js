import makeApolloClient from './utils/makeApolloClient';
import gql from 'graphql-tag';

const CREATE_BANNED_ACCOUNTS = gql`
  mutation CreateBannedAccounts($objects: [banned_accounts_insert_input!]!) {
    insert_banned_accounts(objects: $objects) {
      affected_rows
    }
  }
`;

class ApiServiceArchive {
  client;

  constructor(client) {
    this.client = client;
  }

  createBannedAccounts = async (objects) => {
    try {
      const result = await this.client.mutate({
        mutation: CREATE_BANNED_ACCOUNTS,
        variables: {
          objects,
        },
      });
      console.log(result);
    } catch (err) {
      console.error('ERROR createAccount:', err);
    }
  };
}

const client = makeApolloClient(
  process.env.REACT_APP_API_ARCHIVE_URL,
  process.env.REACT_APP_API_ARCHIVE_WS_URL,
  'ARCHIVE'
);
const apiServiceArchive = new ApiServiceArchive(client);
export default apiServiceArchive;
