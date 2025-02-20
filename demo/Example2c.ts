import {Transform, UnitOfWork, ITransformer} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Props{
    greeting: string;
    
}

interface Methods{
    appendWorld: (model: Props & Methods, transform: ITransformer<Props, Methods>, uow: UnitOfWork<Props, Methods>) => string;
}

const form = document.querySelector('form')!;
const model = {
    greeting: 'hello',
    appendWorld: ({greeting}: Props & Methods, transform: ITransformer<Props, Methods>, uow: UnitOfWork<Props, Methods>) => {
        console.log({transform, uow});
        return greeting + ', world';
    }
} as Props & Methods & RoundaboutReady;

Transform<Props & Methods>(form, model, {
    '@ greeting': {
        d: 'appendWorld',
        w: '.test1'
    }
});

