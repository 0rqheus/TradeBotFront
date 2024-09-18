import dotenv from 'dotenv';
import { generate } from '@genql/cli';

// if (process.env.NODE_ENV === 'development') {
  dotenv.config();
// import fs from 'fs';

// const data = fs.readFileSync('.env', 'utf-8');
// const env = dotenv.parse(data);
// }

generate({
  endpoint: process.env.REACT_APP_API_URL,
  output: 'src/generated/trade',
  verbose: true,
  headers: {
    'x-hasura-admin-secret': process.env.REACT_APP_API_ADMIN_SECRET
  },
  scalarTypes: {
    bigint: 'number',
    numeric: 'number',
    timestamp: 'string',
    uuid: 'string',
    Date: 'Date',
  }
})
