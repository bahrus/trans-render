export const Localizer = (superclass) => class extends superclass {
    localize(model, transformer, uow, matchingElement) {
        console.log({ matchingElement });
        const { o } = uow;
        const a = o;
        if (a.length !== 1)
            throw 'NI';
        const val = model[a[0]];
        const { localName } = matchingElement;
        switch (typeof val) {
            case 'undefined':
                return val;
            case 'number':
            case 'boolean':
                switch (localName) {
                    case 'data': {
                        return {
                            value: val.toString(),
                            textContent: val.toLocaleString()
                        };
                    }
                }
                return val.toLocaleString();
            default:
                if (val instanceof Date) {
                    switch (localName) {
                        case 'time':
                            return {
                                dateTime: val.toUTCString(),
                                textContent: val.toLocaleString()
                            };
                    }
                }
                else {
                    throw 'NI';
                }
        }
    }
};
