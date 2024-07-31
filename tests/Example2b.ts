import {Transform} from '../Transform.js';
import { UnitOfWork, ITransformer } from '../ts-refs/trans-render/types.js'; 

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

Transform<Props & Methods>(form, model, {
    '@ greeting': 'appendWorld',
});
setTimeout(() => {
    const section = document.createElement('input');
    section.setAttribute('name', 'greeting');
    form.appendChild(section);
}, 100);
setTimeout(() => {
    model.greeting = 'bye';
}, 200);
