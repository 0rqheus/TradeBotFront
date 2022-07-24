import { ApolloClient } from '@apollo/client/core';
import makeApolloClient from './utils/makeApolloClient';
import gql from 'graphql-tag';

const GET_ACCOUNTS = gql`
  query GetAccounts {
    Account {
      email
      activityStatus
      activityStatusDescription
      backups
      currentTask
      gAuthSecret
      notes
      password
      platform
      profileId
      scheduler_config
      shouldRun
      strategy_config
      Proxy {
        host
        id
        password
        port
        username
      }
      Inventory {
        balance
        id
        transfer_list_count
        transfer_targets_count
      }
    }
  }
`;

const CREATE_ACCOUNT = gql`
  mutation CreateAccount(
    $email: String
    $backups: String
    $gAuthSecret: String
    $notes: String
    $password: String
    $platform: String
    $profileId: String
    $scheduler_config: String
    $shouldRun: Boolean
    $strategy_config: String
  ) {
    insert_Account(
      objects: {
        email: $email
        backups: $backups
        gAuthSecret: $gAuthSecret
        notes: $notes
        password: $password
        platform: $platform
        profileId: $profileId
        scheduler_config: $scheduler_config
        shouldRun: $shouldRun
        strategy_config: $strategy_config
        # Proxy: {
        #   data: {
        #     id: 1
        #     host: "123"
        #     password: "123"
        #     port: "123"
        #     username: "ivan"
        #   }
        # }
        # Inventory: {
        #   data: {
        #     id: 1
        #     balance: 0
        #     transfer_list_count: 1
        #     transfer_targets_count: 2
        #   }
        # }
      }
    ) {
      returning {
        email
        backups
        gAuthSecret
        notes
        password
        platform
        profileId
        scheduler_config
        shouldRun
        strategy_config
        # Proxy {
        #   host
        #   id
        #   password
        #   port
        #   username
        # }
        # Inventory {
        #   balance
        #   id
        #   transfer_list_count
        #   transfer_targets_count
        # }
      }
    }
  }
`;

const SUBSCRIBE_ACCOUNTS = gql`
  subscription SubscribeAccounts {
    Account {
      email
      Proxy {
        host
        id
        password
        port
        username
      }
      Inventory {
        balance
        id
        transfer_list_count
        transfer_targets_count
      }
      activityStatus
      activityStatusDescription
      backups
      currentTask
      gAuthSecret
      notes
      password
      platform
      profileId
      scheduler_config
      shouldRun
      strategy_config
    }
  }
`;

const UPDATE_ACCOUNT = gql`
  mutation UpdateAccount(
    $email: String
    $backups: String
    $gAuthSecret: String
    $notes: String
    $password: String
    $platform: String
    $profileId: String
    $scheduler_config: String
    $shouldRun: Boolean
    $strategy_config: String
  ) {
    update_Account(
      where: { email: { _eq: $email } }
      _set: {
        email: $email
        backups: $backups
        gAuthSecret: $gAuthSecret
        notes: $notes
        password: $password
        platform: $platform
        profileId: $profileId
        scheduler_config: $scheduler_config
        shouldRun: $shouldRun
        strategy_config: $strategy_config
      }
    ) {
      returning {
        email
        backups
        gAuthSecret
        notes
        password
        platform
        profileId
        scheduler_config
        shouldRun
        strategy_config
      }
    }
  }
`;

const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($email: String) {
    delete_Account(where: { email: { _eq: $email } }) {
      returning {
        email
        backups
        gAuthSecret
        notes
        password
        platform
        profileId
        scheduler_config
        shouldRun
        strategy_config
      }
    }
  }
`;

class ApiService {
  client;

  constructor(client) {
    this.client = client;
  }

  getAccounts = async () => {
    try {
      const result = await this.client.query({
        query: GET_ACCOUNTS,
      });
      return result.data.Account;
    } catch (err) {
      console.log('ERROR:', err);
    }
  };

  createAccount = async (data) => {
    try {
      const result = await this.client.mutate({
        mutation: CREATE_ACCOUNT,
        variables: {
          email: data.email,
          password: data.password,
          gAuthSecret: data.gAuthSecret,
          backups: data.backups,
          notes: data.notes,
          platform: data.platform,
          profileId: data.profileId,
          shouldRun: data.shouldRun,
          scheduler_config: data.scheduler_config,
          strategy_config: data.strategy_config,
        },
      });
      console.log(result);
      return result.data.Account;
    } catch (err) {
      console.log('ERROR:', err);
    }
  };

  updateAccount = async (data) => {
    try {
      const result = await this.client.mutate({
        mutation: UPDATE_ACCOUNT,
        variables: {
          email: data.email,
          password: data.password,
          gAuthSecret: data.gAuthSecret,
          backups: data.backups,
          notes: data.notes,
          platform: data.platform,
          profileId: data.profileId,
          shouldRun: data.shouldRun,
          scheduler_config: data.scheduler_config,
          strategy_config: data.strategy_config,
        },
      });
      console.log(result);
      return result.data.Account;
    } catch (err) {
      console.log('ERROR:', err);
    }
  };

  deleteAccount = async (email) => {
    try {
      const result = await this.client.mutate({
        mutation: DELETE_ACCOUNT,
        variables: {
          email,
        },
      });
      console.log(result);
      return result.data.Account;
    } catch (err) {
      console.log('ERROR:', err);
    }
  };
}

const client = makeApolloClient(
  process.env.REACT_APP_API_URL,
  process.env.REACT_APP_API_WS_URL
);
const apiService = new ApiService(client);
export { client, apiService, SUBSCRIBE_ACCOUNTS };
