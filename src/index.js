import { isPeerJS } from './utils';
import defaults from './defaults';

export default {
  install(Vue, peer, options) {
    if (!isPeerJS(peer)) {
      throw new Error('[vue-peerjs] you have to pass a `Peer` instance to the plugin');
    }

    Vue.prototype.$peer = peer;
  },
  defaults,
};
