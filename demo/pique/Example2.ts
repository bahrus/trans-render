import {Transformer} from '../../index.js';

interface IModel{
    greeting: string;
}

const div = document.querySelector('div')!;
const model: IModel = {
    greeting: 'hello'
};

const transform = new Transformer<IModel>(div, model, {
    piqueMap: {
        span: {
            p: ['greeting'],
            u: 0
        }
    }
    
});
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
