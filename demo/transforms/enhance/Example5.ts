import {Transform} from '../../../Transform.js';
import { MethodInvocationCallback } from '../../../types.js';

interface Props{
    msg1: string;
    rO: boolean;
    num: number;
}

interface Methods{
    hydrateInputElement:(m:Props & Methods, el: Element, ctx: MethodInvocationCallback<Props>) => void;
}

const div = document.querySelector('div')!;
const model: Props & Methods = {
    msg1: '123',
    rO: true,
    num: 7,
    hydrateInputElement:(model: Props & Methods, el: Element, ctx: MethodInvocationCallback<Props>) => {
        console.log({model, el, ctx})
    }
};
const propagator = new EventTarget();

Transform<Props, Methods>(div, model, {
    input: [
        {o: 'msg1', s: 'value'},
        {o: 'rO',   s: 'readOnly'},
        {o: 'num',  s: 'tabIndex'},
        {o: 'num',  s: '.dataset.num'},
        {
            s: {
                type: 'number',
                disabled: true
            } as Partial<HTMLInputElement>,
            e: {
                do: 'hydrateInputElement',
                with: {
                    beCommitted: true
                }
            }
        }
    ]
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
}, 15000)
