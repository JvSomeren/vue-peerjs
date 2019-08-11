import camelcase from 'camelcase';

export default Object.freeze({
  peerPrefix: {
    action: 'peer_',
    mutation: 'PEER_',
  },
  dataPrefix: {
    action: 'data_',
    mutation: 'DATA_',
  },
  mediaPrefix: {
    action: 'media_',
    mutation: 'MEDIA_',
  },
  eventToMutationTransformer: event => event.toUpperCase(),
  eventToActionTransformer: camelcase,
});
