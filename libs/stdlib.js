'use strict';

export const isset = (o) => ('undefined'!==typeof o);
export const useor = (a, b, c = isset) => (c(a) ?a :b);
export const tobool = (b) => (b ?true :false);
export const isstr = (s) => ('string'===typeof s||(isset(s)&&(s instanceof String)));
export const tostr = (s) => (isset(s) ?s.toString() :'');
export const isnum = (n) => (!isNaN(n));
export const isfunc = (f) => ('function'===typeof f);
export const isarray = (a) => (isset(a)&&Array.isArray(a));
export const objKeys = (o) => Object.keys(o);
export const objForEach = (o, f = (()=>{}), t = this) => objKeys(o).forEach((p) => f.call(t, o[p], p, o));
export const iselem = (e) => (isset(e)&&(e instanceof Element||e instanceof Window||e instanceof Document));