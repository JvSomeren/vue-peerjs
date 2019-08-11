import defaults from './defaults';
import { pipe, prefixWith, unwrapIfSingle } from './utils';
import { getRegisteredActions, getRegisteredMutations, trimNamespace } from './utils/vuex';
import { DATA_CONNECTION_EVENTS, MEDIA_CONNECTION_EVENTS, PEER_EVENTS } from './constants';

export default (Peer, { store, ...otherOptions } = {}) => {
  const options = { ...defaults, ...otherOptions };

  const augmentPeerConnect = (handlerFn) => {
    Object.defineProperty(Peer, 'peerConnect', {
      value: Peer.connect,
      writable: true,
    });
    // eslint-disable-next-line no-param-reassign
    Peer.connect = (id, opts = {}) => {
      const dataConnection = Peer.peerConnect(id, opts);

      handlerFn(dataConnection);

      return dataConnection;
    };
  };

  const augmentPeerCall = (handlerFn) => {
    Object.defineProperty(Peer, 'peerCall', {
      value: Peer.call,
      writable: true,
    });
    // eslint-disable-next-line no-param-reassign
    Peer.call = (id, stream, opts = {}) => {
      const mediaConnection = Peer.peerCall(id, stream, opts);

      handlerFn(mediaConnection);

      return mediaConnection;
    };
  };

  const eventToMutation = prefix => pipe(
    options.eventToMutationTransformer,
    prefixWith(prefix.mutation),
  );

  const eventToAction = prefix => pipe(
    options.eventToActionTransformer,
    prefixWith(prefix.action),
  );

  function passToStore(event, payload, prefix = options.peerPrefix) {
    if (!store) return;

    const desiredMutation = eventToMutation(prefix)(event);
    const desiredAction = eventToAction(prefix)(event);
    const mutations = getRegisteredMutations(store);
    const actions = getRegisteredActions(store);
    const unwrappedPayload = unwrapIfSingle(payload);

    mutations
      .filter(namespacedMutation => trimNamespace(namespacedMutation) === desiredMutation)
      .forEach(namespacedMutation => store.commit(namespacedMutation, unwrappedPayload));

    actions
      .filter(namespacedAction => trimNamespace(namespacedAction) === desiredAction)
      .forEach(namespacedAction => store.dispatch(namespacedAction, unwrappedPayload));
  }

  const registerDataConnectionEventHandler = (dataConnection) => {
    DATA_CONNECTION_EVENTS.forEach((eventName) => {
      dataConnection.on(eventName, (...args) => {
        passToStore(eventName, { dataConnection, args }, options.dataPrefix);
      });
    });
  };

  const registerMediaConnectionEventHandler = (mediaConnection) => {
    MEDIA_CONNECTION_EVENTS.forEach((eventName) => {
      mediaConnection.on(eventName, (...args) => {
        passToStore(eventName, { mediaConnection, args }, options.mediaPrefix);
      });
    });
  };

  const registerEventHandler = () => {
    Peer.on('connection', (dataConnection) => {
      registerDataConnectionEventHandler(dataConnection);
    });

    Peer.on('call', (mediaConnection) => {
      registerMediaConnectionEventHandler(mediaConnection);
    });

    PEER_EVENTS.forEach((eventName) => {
      Peer.on(eventName, (...args) => {
        passToStore(eventName, { args }, options.peerPrefix);
      });
    });
  };

  augmentPeerConnect(registerDataConnectionEventHandler);
  augmentPeerCall(registerMediaConnectionEventHandler);
  registerEventHandler();
};
