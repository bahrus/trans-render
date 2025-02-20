import {Transform, XForm} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface ListItem{
    myProp: string,
}

interface Props{
    list: Array<ListItem>
}

interface Methods{

}

type Model = Props & Methods;

const model = {
    list: [
        {
            myProp: 'row 1'
        },
        {
            myProp: 'row 2'
        }
    ]
} as Model & RoundaboutReady;

const div = document.querySelector('div')!;

Transform<Props, Methods>(div, model, {
    '$ list': {
        f:{
            xform:{
                '| myProp': 0
            },
            timestampProp: 'myProp',
            outOfRangeProp: 'hidden',
        }
    }
});

setTimeout(() => {
    console.log('update model');
    const list = [
        {
            myProp: 'row 4'
        },
    ];
    model.list = list;
    
}, 2000);

setTimeout(() => {
    console.log('update model');
    const list = [
        ...model.list,
        {
            myProp: 'row 5'
        },
    ];
    model.list = list;
    
}, 4000);

