export const doInitTransform = {
    cloneTemplate: {
        ifAllOf: ['mainTemplate'],
        ifKeyIn: ['noshadow', 'waitToInit']
    },
    doInitTransform: {
        ifAllOf: ['clonedTemplate'],
    }
}