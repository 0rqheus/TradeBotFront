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
}

const client = makeApolloClient(
  process.env.REACT_APP_CUSTOM_RESOLVERS_URL,
  null
);
const apiServiceCustomResolvers = new ApiServiceCustomerResolvers(client);
export { apiServiceCustomResolvers };
