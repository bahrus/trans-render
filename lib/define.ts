import {CE} from './CE.js';
import {PropInfo, DefineArgs} from './types.js';
export { Action, PropInfo} from './types.js';

export function define<MCProps = any, MCActions = MCProps, TPropInfo = PropInfo>(args: DefineArgs<MCProps, MCActions, TPropInfo>): {new(): MCProps & MCActions}{
    return (new CE<MCProps, MCActions, TPropInfo>()).def(args);
}