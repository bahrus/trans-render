import {Transformer} from '../../index.js';
import { MethodInvocationCallback } from '../../types.js';

interface IProps{
    msg1: string;
    rO: boolean;
    num: number;
}

interface IActions{
    onInput:(m:IProps, el: Element, ctx: MethodInvocationCallback<IProps>) => void;
}

const div = document.querySelector('div')!;
const model: IProps & IActions = {
    msg1: '123',
    rO: true,
    num: 7,
    onInput:(m:IProps, el: Element, ctx: MethodInvocationCallback<IProps>) => {
        console.log({m, el, ctx})
    }
};
const et = new EventTarget();

const transform = new Transformer<IProps, IActions>(div, model, {
    piqueMap: {
        input: {
            p: ['msg1', 'rO', 'num'],
            u: {
                readOnly: 1,
                tabIndex: 2,
                value: 0,
                type: 'number',
                disabled: true
            },
            e: {
                do: 'onInput',
                with: {
                    beCommitted: true
                }
            } 
        }
    }
}, et);

setTimeout(() => {
    const input = document.createElement('input');
    div.appendChild(input);
}, 1000);
setTimeout(() => {
    model.msg1 = '456';
    et.dispatchEvent(new Event('msg1'));
}, 2000);
setTimeout(() => {
    div.innerHTML = '';
}, 5000)
