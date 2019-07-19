export const isFunction = obj => (
  typeof obj === 'function'
);

export const isPeerJS = obj => (
  !!obj && isFunction(obj.on) && isFunction(obj.call)
);
