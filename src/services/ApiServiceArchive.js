import makeApolloClient from './utils/makeApolloClient';
import gql from 'graphql-tag';

const CREATE_BANNED_ACCOUNTS = gql`
  mutation CreateBannedAccounts($objects: [banned_accounts_insert_input!]!) {
    insert_banned_accounts(objects: $objects) {
      affected_rows
    }
  }
`;

const CREATE_HISTORY_ITEMS = gql`
  mutation CreateHistoryItems($objects: [history_items_insert_input!]!) {
    insert_history_items(objects: $objects) {
      affected_rows
    }
  }
`;

const CREATE_SCHEDULER_INFO = gql`
  mutation CreateSchedulerInfo($objects: [scheduler_account_info_insert_input!]!) {
    insert_scheduler_account_info(objects: $objects) {
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

  createHistoryItems = async (objects) => {
    try {
      const result = await this.client.mutate({
        mutation: CREATE_HISTORY_ITEMS,
        variables: {
          objects,
        },
      });
      console.log(result);
    } catch (err) {
      console.error('ERROR createHistoryItems:', err);
    }
  };

  createSchedulerInfo = async (objects) => {
    try {
      const result = await this.client.mutate({
        mutation: CREATE_SCHEDULER_INFO,
        variables: {
          objects,
        },
      });
      console.log(result);
    } catch (err) {
      console.error('ERROR createSchedulerInfo:', err);
    }
  };
}

const client = makeApolloClient(
  process.env.REACT_APP_API_ARCHIVE_URL,
  process.env.REACT_APP_API_ARCHIVE_WS_URL,
  localStorage.getItem('adminArchiveSecret')
);
const apiServiceArchive = new ApiServiceArchive(client);
export default apiServiceArchive;
