import {OConfig} from './froop/O.js';
import { MntCfg, MountActions, MountProps, PMP, ProPMP } from './ts-refs/trans-render/types.js'; 
export const MntCfgMxn: OConfig<MountProps, MountActions> = {
    propInfo:{
        clonedTemplate: {
            type: 'Object',
            ro: true,
        },
        hydrated: {
            type: 'Boolean',
            ro: true,
        },
        deferHydration: {
            type: 'Boolean',
            parse: true,
            attrName: 'defer-hydration'
        }

    },
    actions:{
        cloneMT: {
            ifAllOf: 'csr'
        },
        initCSRXform: {
            ifAllOf: ['clonedTemplate'],
            ifAtLeastOneOf: ['xform', 'xxform'],
            ifNoneOf: ['deferHydration'],
        },
        mountClone: {
            ifAllOf: ['clonedTemplate', 'hydrated'],
        },
        initSSRXform: {
            ifAllOf: ['xform'],
            ifNoneOf: ['csr', 'deferHydration'],
        },
        onNoXForm:{
            ifNoneOf: ['xform']
        }
    }
}