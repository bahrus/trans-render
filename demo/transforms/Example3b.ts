import {Transform} from '../../Transform.js';

interface Props{
    msg1: string;
    msg2: string;
}

interface Methods{
    computeMessage(self: Props & Methods): string,
}

const div = document.querySelector('div')!;
const model: Props & Methods = {
    msg1: 'hello',
    msg2: 'world',
    computeMessage: ({msg1, msg2}: Props & Methods) => {
        return `msg1: ${msg1}, msg2: ${msg2}`
    }
};
const et = new EventTarget();

Transform<Props & Methods>(div, model, {
    span: {
        o: ['msg1', 'msg2'],
        d: 'computeMessage'
    }
}, et);

setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.msg1 = 'bye';
    et.dispatchEvent(new Event('msg1'));
}, 2000);
