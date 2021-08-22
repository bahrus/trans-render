import {CE} from './CE.js';
import {PropInfo, DefineArgs, Action} from './types.js';
export { Action, PropInfo} from './types.js';

export function define<MCProps = any, MCActions = MCProps, TPropInfo = PropInfo, TAction extends Action<MCProps> = Action<MCProps>>(args: DefineArgs<MCProps, MCActions, TPropInfo, TAction>): {new(): MCProps & MCActions}{
    return (new CE<MCProps, MCActions, TPropInfo, TAction>()).def(args);
}