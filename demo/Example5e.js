import { Transform } from '../Transform.js';
const model = {
    openSesame: (e, { model }) => {
        console.log({ e, model });
    }
};
const oMenuItem = document.querySelector('menu-item');
Transform(oMenuItem, model, {
    '@ openSesame': {
        o: [],
        a: 0
    }
});
