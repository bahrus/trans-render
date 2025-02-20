import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';
interface Props {
    greeting: string,
    msg1: string,
}
interface Actions {
}
const model = {
    greeting: 'hello',
    msg1: 'this is a test'
} as Props & Actions & RoundaboutReady;
const form = document.querySelector('form') as HTMLElement;


Transform<Props, Actions, ARIAMixin>(form, model, {
    '-o greeting -s ariaLabel': 0,
    '-o msg1 -s ariaRoleDescription': 0
});

