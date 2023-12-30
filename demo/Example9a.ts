import {Transform, XForm} from '../Transform.js';

interface AddressProps{
    zipCode: string
}

interface AddressMethods{}

interface Props{
    name: string,
    address: AddressProps & AddressMethods
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
        '| zipCode': 0
    } as XForm<AddressProps, AddressMethods>,
});
// setTimeout(() => {
//     const span = document.createElement('span');
//     div.appendChild(span);
// }, 1000);
setTimeout(() => {
    model.address.zipCode = '54321';
}, 2000);
