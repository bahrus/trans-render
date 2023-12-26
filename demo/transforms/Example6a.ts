import {Transform} from '../../Transform.js';
import { EngagementCtx } from '../../types.js';

interface Props{
    msg1: string;
    rO: boolean;
    num: number;
}

interface Methods{
    hydrateInputElement: (m:Props & Methods, el: Element, ctx: EngagementCtx<Props>) => void;
    cleanupInputElement: (m:Props & Methods, el: Element, ctx: EngagementCtx<Props>) => void;
}

const div = document.querySelector('div')!;
const model: Props & Methods = {
    msg1: '123',
    rO: true,
    num: 7,
    hydrateInputElement:(model: Props & Methods, el: Element, ctx: EngagementCtx<Props>) => {
        console.log({model, el, ctx})
    },
    cleanupInputElement:(model: Props & Methods, el: Element, ctx: EngagementCtx<Props>) => {
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
                forget: 'cleanupInputElement',
                with: {
                    beCommitted: true
                }
            }
        }
    ]
}, propagator);

setTimeout(() => {
    const input = document.createElement('input');
    div.appendChild(input);
}, 1000);
setTimeout(() => {
    model.msg1 = '456';
    propagator.dispatchEvent(new Event('msg1'));
}, 2000);
setTimeout(() => {
    div.innerHTML = '';
}, 15000)
