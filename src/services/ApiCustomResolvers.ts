import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import makeApolloClient from '../utils/makeApolloClient';
import gql from 'graphql-tag';
import { AccountToDisplay } from './ApiService';

const SEND_COMMAND = gql`
  mutation SendCommand($payload: RabbitPayload!) {
    sendCommand(payload: $payload)
  }
`;

const SEND_HTTP_COMMAND = gql`
  mutation SendCommandHttp($payload: RabbitPayload!) {
    sendCommandHttp(payload: $payload)
  }
`;

const SOLVE_SBC = gql`
  mutation SolveSbcHttp($payload: SBCPayload!) {
    solveSbcHttp(payload: $payload)
  }
`;

const CHANGE_CONFIG = gql`
  mutation ChangeConfig($payload: ChangeConfigPayload) {
    changeConfig(payload: $payload)
  }
`;

const START_BY_SERVERS = gql`
  mutation SendStartByServers($payload: RabbitPayloadByServers) {
    sendStartByServers(payload: $payload)
  }
`;

class ApiServiceCustomerResolvers {
  constructor(
    private readonly client: ApolloClient<NormalizedCacheObject>
  ) {
  }

  sendCommand = async (payload: any) => {
    try {
      const result = await this.client.mutate({
        mutation: SEND_COMMAND,
        variables: {
          payload,
        },
      });
      // console.log(result);
      return result.data;
    } catch (err) {
      console.error('ERROR:', err);
    }
  };

  sendHttpCommand = async (payload: any) => {
    try {
      const result = await this.client.mutate({
        mutation: SEND_HTTP_COMMAND,
        variables: {
          payload,
        },
      });
      // console.log(result);
      return result.data;
    } catch (err) {
      console.error('ERROR:', err);
    }
  };

  startByServers = async (payload: any) => {
    try {
      const result = await this.client.mutate({
        mutation: START_BY_SERVERS,
        variables: {
          payload,
        },
      });
      // console.log(result);
      return result.data;
    } catch (err) {
      console.error('ERROR:', err);
    }
  };

  sendSolveSbcCommand = async (payload: any) => {
    try {
      const result = await this.client.mutate({
        mutation: SOLVE_SBC,
        variables: {
          payload,
        },
      });
      // console.log(result);
      return result.data;
    } catch (err) {
      console.error('ERROR:', err);
    }
  };

  changeConfig = async (data: any) => {
    try {
      const result = await this.client.mutate({
        mutation: CHANGE_CONFIG,
        variables: {
          payload: data,
        },
      });
      // console.log(result);
      return result.data;
    } catch (err) {
      console.log('error while changing config: ' + err);
    }
  };

  private sendRabbitCommand = async (id: number, email: string, status: string) => {
    const toSend = {
      id,
      email: email,
      type: status,
      rabbitUrl: localStorage.getItem('rabbitUrl'),
    };
    await this.sendHttpCommand(toSend);
  }

  startAccounts = async (accounts: AccountToDisplay[], type: 'START' | 'KICKSTART') => {
    const accsToStartByServer = accounts
      .filter((acc) => acc.scheduler_account_info!.service_name)
      .map((acc) => ({
        id: acc.id,
        email: acc.email,
        service_name: acc.scheduler_account_info!.service_name
      }));

    await apiServiceCustomResolvers.startByServers({
      accounts: accsToStartByServer,
      type,
      // @todo: tbd pass??
      secondsBetween: 12,
      maxAccsToStart: 93,
      // @todo: set in init?
      rabbitUrl: localStorage.getItem('rabbitUrl'),
    });
  }

  stopAccounts = async (accounts: AccountToDisplay[]) => {
    // @todo: chunk + Promise.all?
    accounts.forEach(async (acc) => {
      await this.sendRabbitCommand(acc.id, acc.email, 'STOP');
    });
  }

  blockAccounts = async (accounts: AccountToDisplay[]) => {
    accounts.forEach(async (acc) => {
      await this.sendRabbitCommand(acc.id, acc.email, 'BLOCK');
    });
  }

  resetAccounts = async (accounts: AccountToDisplay[]) => {
    accounts.forEach(async (acc) => {
      await this.sendRabbitCommand(acc.id, acc.email, 'RESET');
    });
  }
}

const client = makeApolloClient(process.env.REACT_APP_CUSTOM_RESOLVERS_URL!);
const apiServiceCustomResolvers = new ApiServiceCustomerResolvers(client);
export { apiServiceCustomResolvers };
