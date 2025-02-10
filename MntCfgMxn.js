export const MntCfgMxn = {
    propInfo: {
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
    actions: {
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
        onNoXForm: {
            ifNoneOf: ['xform']
        }
    }
};
