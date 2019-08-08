import camelcase from 'camelcase';

export default Object.freeze({
  actionPrefix: 'peer_',
  mutationPrefix: 'PEER_',
  eventToMutationTransformer: event => event.toUpperCase(),
  eventToActionTransformer: camelcase,
});
