import {Transform} from '../Transform.js';
interface Props {
    greeting: string,
    msg1: string,
}
interface Actions {
}
const model: Props & Actions = {
    greeting: 'hello',
    msg1: 'thi is a test'
}
const form = document.querySelector('form') as HTMLFormElement;


Transform<Props, Actions, HTMLFormElement>(form, model, {
    '-o greeting -s ariaLabel': 0,
    '-o msg1 -s ariaRoleDescription': 0
});

