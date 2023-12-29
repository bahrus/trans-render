import {Transform} from '../Transform.js';

interface Props{
    name: string,
    address: {
        zipCode: string
    }
}

interface Methods{

}

const div = document.querySelector('div')!;
const model: Props & Methods = {
    name: 'Bob',
    address: {
        zipCode: '12345'
    }
};

Transform<Props & Methods>(div, model, {
    '$ address': {

    },
});
// setTimeout(() => {
//     const span = document.createElement('span');
//     div.appendChild(span);
// }, 1000);
// setTimeout(() => {
//     model.greeting = 'bye';
// }, 2000);
