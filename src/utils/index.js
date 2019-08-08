export const isFunction = obj => (
  typeof obj === 'function'
);

export const isPeerJS = obj => (
  !!obj && isFunction(obj.on) && isFunction(obj.call)
);

export const unwrapIfSingle = args => (
  args && args.length <= 1
    ? args[0]
    : args
);

export const pipe = (...fns) => x => (
  fns.reduce((v, f) => f(v), x)
);

export const prefixWith = prefix => string => (
  prefix + string
);
