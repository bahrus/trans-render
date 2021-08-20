import {CE} from './CE.js';
import {PropInfo, DefineArgs} from './types.js';

export function define<T = any, P = PropInfo>(args: DefineArgs<T, P>): {new(): T}{
    return (new CE<T, P>()).def(args);
}