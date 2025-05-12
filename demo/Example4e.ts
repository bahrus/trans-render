import {Transform} from '../Transform.js';
import { IshConfig, RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface AddressProps {
    zipCode: string;
}

interface AddressMethods {

}
interface Props {
    name: string;
    address: AddressProps;
}

interface Methods {

}

type Model = Props & Methods;

const model = {
    name: 'Bob',
    address: {
        zipCode: '12345'
    }
} as Model & RoundaboutReady;

const div = document.querySelector('div')!;

Transform<Props & Methods>(div, model, {
    '| address': {
        $: {
            name: 'address-prop',
            config: {
                propInfo: {
                    zipCode: {}
                },
                xform: {
                    '| zipCode': 0
                }
            } as IshConfig<AddressProps, AddressMethods>
        }
    }
});