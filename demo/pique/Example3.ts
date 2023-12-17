import {Transformer} from '../../index.js';

interface IModel{
    msg1: string;
    msg2: string;
}

const div = document.querySelector('div')!;
const model: IModel = {
    msg1: 'hello',
    msg2: 'world'
};
const et = new EventTarget();

const transform = new Transformer<IModel>(div, model, {
    piqueMap: {
        span: {
            p: ['msg1', 'msg2'],
            u: ['msg1: ', 0, ', msg2: ', 1]
        }
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
