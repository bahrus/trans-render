export const Localizer = (superclass) => class extends superclass {
    localize(model, transformer, uow, matchingElement) {
        console.log({ matchingElement });
        const { o } = uow;
        const a = o;
        if (a.length !== 1)
            throw 'NI';
        const val = model[a[0]];
        if (val instanceof Date) {
            return val.toLocaleDateString();
        }
        else if (typeof val === 'number') {
            const { localName } = matchingElement;
            switch (localName) {
                case 'data': {
                    return {
                        value: val.toString(),
                        textContent: val.toLocaleString()
                    };
                }
            }
            return val.toLocaleString();
        }
        throw 'NI';
    }
};
