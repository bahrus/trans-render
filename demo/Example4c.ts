import {Transform} from '../Transform.js';
interface Props {
    msg1: string,
    msg2: string,
}
interface Actions {
}
const model: Props & Actions = {
    msg1: 'this is a test',
    msg2: 'this is another test'
}
const form = document.querySelector('form') as HTMLFormElement;


// Transform<Props, Actions, Element>(form, model, {
//     '-o msg1 -o msg2 -s textContent': {
//         d: ['msg1: ', 0, 'msg2: ', 1]
//     }
// });

