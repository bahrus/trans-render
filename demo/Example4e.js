import { Transform } from '../Transform.js';
const model = {
    name: 'Bob',
    address: {
        zipCode: '12345'
    }
};
const div = document.querySelector('div');
Transform(div, model, {
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
            }
        }
    }
});
setTimeout(() => {
    // model.address = {
    //     zipCode: '54321',
    // }
    model.address.zipCode = '54321';
}, 2000);
