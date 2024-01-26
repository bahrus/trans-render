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
const div = document.querySelector('div') as HTMLDivElement;


Transform<Props, Actions, HTMLDivElement>(div, model, {
    '-o greeting -s ariaLabel': 0,
    '-o msg1 -s ariaRoleDescription': 0
});

