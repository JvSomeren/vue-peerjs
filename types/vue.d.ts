/**
 * Extends interfaces in Vue.js
 */
import Vue from 'vue';
import * as Peer from './peerjs';

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    // @TODO
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $peer: Peer;
  }
}
