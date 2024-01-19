import { Transform } from '../Transform.js';
const form = document.querySelector('form');
const model = {
    greeting: 'hello',
    appendWorld: ({ greeting }, transform, uow) => {
        console.log({ transform, uow });
        return greeting + ', world';
    }
};
Transform(form, model, {
    '@ greeting': {
        d: 'appendWorld',
        w: '.test1'
    }
});
