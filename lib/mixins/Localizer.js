export const Localizer = (superclass) => class extends superclass {
    localize(model, transformer, uow) {
        const { o } = uow;
        const a = o;
        if (a.length !== 1)
            throw 'NI';
        const val = model[a[0]];
        if (val instanceof Date) {
            return val.toLocaleDateString();
        }
        else if (typeof val === 'number') {
            return val.toLocaleString();
        }
        throw 'NI';
    }
};
