import {Transform} from '../Transform.js';

interface Model{
    msg1: string;
    rO: boolean;
    num: number;
    propName: string;
    color: string;
}

const div = document.querySelector('div')!;
const model: Model = {
    msg1: '123',
    rO: true,
    num: 7,
    propName: 'test',
    color: 'red'
};

Transform<Model>(div, model, {
    input: [
        {o: 'msg1', s: 'value'},
        {o: 'rO',   s: 'readOnly'},
        {o: 'num',  s: 'tabIndex'},
        {o: 'num',  s: '.dataset.num'}, 
        {o: 'propName', sa: 'itemprop'},
        {o: 'color', ss: 'color'},
        {
            s: {
                type: 'number',
                disabled: true
            } as Partial<HTMLInputElement>
        }
    ]
});

setTimeout(() => {
    const input = document.createElement('input');
    div.appendChild(input);
}, 1000);
setTimeout(() => {
    model.msg1 = '456';
}, 2000);
