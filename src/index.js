import { isPeerJS } from './utils';
import defaults from './defaults';
import Observe from './Observe';

export default {
  install(Vue, peer, options) {
    if (!isPeerJS(peer)) {
      throw new Error('[vue-peerjs] you have to pass a `Peer` instance to the plugin');
    }

    Observe(peer, options);
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$peer = peer;
  },
  defaults,
};
