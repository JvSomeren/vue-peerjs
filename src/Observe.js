import defaults from './defaults';
import { pipe, prefixWith, unwrapIfSingle } from './utils';
import { getRegisteredActions, getRegisteredMutations, trimNamespace } from './utils/vuex';
import { DATA_CONNECTION_EVENTS, MEDIA_CONNECTION_EVENTS, PEER_EVENTS } from './constants';

export default (Peer, { store, ...otherOptions } = {}) => {
  const options = { ...defaults, ...otherOptions };

  const augmentPeerConnect = (handlerFn) => {
    Object.defineProperty(Peer, 'oldConnect', {
      value: Peer.connect,
      writable: true,
    });
    // eslint-disable-next-line no-param-reassign
    Peer.connect = (id, opts = {}) => {
      const dataConnection = Peer.oldConnect(id, opts);

      handlerFn(dataConnection);

      return dataConnection;
    };
  };

  const augmentPeerCall = (handlerFn) => {
    Object.defineProperty(Peer, 'oldCall', {
      value: Peer.call,
      writable: true,
    });
    // eslint-disable-next-line no-param-reassign
    Peer.call = (id, stream, opts = {}) => {
      const mediaConnection = Peer.oldCall(id, stream, opts);

      handlerFn(mediaConnection);

      return mediaConnection;
    };
  };

  const eventToAction = pipe(
    options.eventToActionTransformer,
    prefixWith(options.actionPrefix),
  );

  const eventToMutation = pipe(
    options.eventToMutationTransformer,
    prefixWith(options.mutationPrefix),
  );

  function passToStore(event, payload) {
    if (!store) return;

    const desiredMutation = eventToMutation(event);
    const desiredAction = eventToAction(event);
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
        passToStore(eventName, { dataConnection, args });
      });
    });
  };

  const registerMediaConnectionEventHandler = (mediaConnection) => {
    MEDIA_CONNECTION_EVENTS.forEach((eventName) => {
      mediaConnection.on(eventName, (...args) => {
        passToStore(eventName, { mediaConnection, args });
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
        passToStore(eventName, args);
      });
    });
  };

  augmentPeerConnect(registerDataConnectionEventHandler);
  augmentPeerCall(registerMediaConnectionEventHandler);
  registerEventHandler();
};
