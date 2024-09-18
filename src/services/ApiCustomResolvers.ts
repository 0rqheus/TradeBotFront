import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import makeApolloClient from '../utils/makeApolloClient';
import gql from 'graphql-tag';
import { AccountToDisplay } from './ApiService';
import { chunkArray } from '../utils/utils';

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

  private sendHttpCommand = async (payload: { id: number, email: string, type: string, rabbitUrl: string }) => {
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

  sendCommands = async (accounts: AccountToDisplay[], type: 'STOP' | 'BLOCK' | 'RESET') => {
    const commands = accounts.map((acc) => ({
      id: acc.id,
      email: acc.email,
      type,
      rabbitUrl: localStorage.getItem('rabbitUrl')!,
    }));

    const chunks = chunkArray(commands, 10);
    for (const chunk of chunks) {
      await Promise.all(chunk.map((c) => this.sendHttpCommand(c)))
    }
  }

  startAccounts = async (
    accounts: AccountToDisplay[], 
    type: 'START' | 'KICKSTART', 
    secondsBetweenStart: number,
    maxAccsToStartAtOnce: number
  ) => {
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
      secondsBetween: secondsBetweenStart,
      maxAccsToStart: maxAccsToStartAtOnce,
      // @todo: set in init?
      rabbitUrl: localStorage.getItem('rabbitUrl'),
    });
  }
}

const client = makeApolloClient(process.env.REACT_APP_CUSTOM_RESOLVERS_URL!);
const apiServiceCustomResolvers = new ApiServiceCustomerResolvers(client);
export { apiServiceCustomResolvers };
