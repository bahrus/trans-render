import {Transform, XForm} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

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
const model = {
    name: 'Bob',
    address: {
        zipCode: '12345'
    }
} as Props & Methods & RoundaboutReady;

const transform = await Transform<Props & Methods>(div, model, {
    '$ address': {
        '| zipCode': 0
    } as XForm<AddressProps, AddressMethods>,
});
// setTimeout(() => {
//     const span = document.createElement('span');
//     div.appendChild(span);
// }, 1000);
setTimeout(() => {
    transform.updateModel({
        name: 'Jill',
        address: {
            zipCode: '54321'
        }
    } as any)
}, 2000);
