// Short builders for path lessons. For mc() and fill(), the FIRST option is the correct one;
// options are shuffled when shown.
export const L = (title, ...steps) => ({ title, steps });
export const info = (h, b) => ({ t: 'info', h, b });
export const mc = (q, o, w, code) => ({ t: 'mc', q, o, w, code });
export const tf = (q, a, w) => ({ t: 'tf', q, a, w });
export const fill = (q, o, w) => ({ t: 'fill', q, o, w });                 // sentence with ___
export const fillc = (q, o, w) => ({ t: 'fill', q, o, w, code: true });    // code with ___
export const type = (q, a, w, code) => ({ t: 'type', q, a: [].concat(a), w, code });
export const order = (q, lines, w) => ({ t: 'order', q, lines, w });
export const match = (q, pairs) => ({ t: 'match', q, pairs });
