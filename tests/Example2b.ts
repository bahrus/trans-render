import {Transformer} from '../Transform.js';
import { UnitOfWork, ITransformer } from '../types.js';

interface Props{
    greeting: string;
    
}

interface Methods{
    appendWorld: (model: Props & Methods, transform: ITransformer<Props, Methods>, uow: UnitOfWork<Props, Methods>) => string;
}

const form = document.querySelector('form')!;
const model: Props & Methods = {
    greeting: 'hello',
    appendWorld: ({greeting}: Props & Methods, transform: ITransformer<Props, Methods>, uow: UnitOfWork<Props, Methods>) => {
        console.log({transform, uow});
        return greeting + ', world';
    }
};
const propagator = new EventTarget();

const transform = new Transformer<Props & Methods>(form, model, {
    '@ greeting': 'appendWorld',
}, propagator);
setTimeout(() => {
    const section = document.createElement('input');
    section.setAttribute('name', 'greeting');
    form.appendChild(section);
}, 100);
setTimeout(() => {
    model.greeting = 'bye';
    propagator.dispatchEvent(new Event('greeting'));
}, 200);
