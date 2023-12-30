import { Transform } from '../Transform.js';
const div = document.querySelector('div');
const model = {
    name: 'Bob',
    address: {
        zipCode: '12345'
    }
};
Transform(div, model, {
    '$ address': {
        '| zipCode': 0
    },
});
// setTimeout(() => {
//     const span = document.createElement('span');
//     div.appendChild(span);
// }, 1000);
setTimeout(() => {
    model.address.zipCode = '54321';
}, 2000);
