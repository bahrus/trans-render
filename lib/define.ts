import {CE} from './CE.js';
import {PropInfo, DefineArgs} from './types.js';

export function define<MCProps = any, P = PropInfo, MCActions = MCProps>(args: DefineArgs<MCProps, P, MCActions>): {new(): MCProps}{
    return (new CE<MCProps, P, MCActions>()).def(args);
}