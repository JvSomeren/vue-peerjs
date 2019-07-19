/**
 * Extends interfaces in Vue.js
 */
import _Vue from 'vue';
import * as PeerJS from './peerjs';

declare module 'vue/types/options' {
  interface ComponentOptions<V extends _Vue> {
    // @TODO
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $peer: PeerJS;
  }
}
