import makeApolloClient from './utils/makeApolloClient';
import gql from 'graphql-tag';

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

const START_BY_SERVERS = gql`
  mutation SendStartByServers($payload: RabbitPayloadByServers) {
    sendStartByServers(payload: $payload)
  }
`;

class ApiServiceCustomerResolvers {
  client;

  constructor(client) {
    this.client = client;
  }

  sendCommand = async (payload) => {
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
      console.erorr('ERROR:', err);
    }
  };

  sendHttpCommand = async (payload) => {
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

  startByServers = async (payload) => {
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

  sendSolveSbcCommand = async (payload) => {
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
}

const client = makeApolloClient(
  process.env.REACT_APP_CUSTOM_RESOLVERS_URL,
  null
);
const apiServiceCustomResolvers = new ApiServiceCustomerResolvers(client);
export { apiServiceCustomResolvers };
