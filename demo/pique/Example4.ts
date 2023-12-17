import {Transformer} from '../../index.js';

interface IModel{
    msg1: string;
    rO: boolean;
    num: number;
}

const div = document.querySelector('div')!;
const model: IModel = {
    msg1: 'hello',
    rO: true,
    num: 7
};
const et = new EventTarget();

const transform = new Transformer<IModel>(div, model, {
    piqueMap: {
        input: {
            p: ['msg1', 'rO', 'num'],
            u: {
                readOnly: 1,
                tabIndex: 2,
                value: 0,
                type: 'number',
                disabled: true
            } 
        }
    }
}, et);

setTimeout(() => {
    const input = document.createElement('input');
    div.appendChild(input);
}, 1000);
setTimeout(() => {
    model.msg1 = 'bye';
    et.dispatchEvent(new Event('msg1'));
}, 2000);
