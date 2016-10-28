import ApolloClient, { createNetworkInterface } from 'apollo-client';

// In the browser
import gql from 'graphql-tag';

if (typeof window !== 'undefined') window['gql'] = gql;
if (typeof global !== 'undefined') {
  global['gql'] = gql;
  global['fetch'] = require('isomorphic-fetch');
}

export default (url, { initialState, ...options }) => {
  const networkInterface = createNetworkInterface(url, options);
  return new ApolloClient({
    shouldBatch: true,
    dataIdFromObject: x => x.id,
    ssrForceFetchDelay: options.ssrMode ? undefined : 100,
    networkInterface,
    initialState
  });
}
