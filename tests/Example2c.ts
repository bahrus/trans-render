import {Transform, UnitOfWork, ITransformer} from '../Transform.js';

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
    '@ greeting': {
        d: 'appendWorld',
        w: '.test1'
    }
});

