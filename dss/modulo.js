export function modulo(el, modulo) {
    switch (modulo) {
        case 'aria-rowindex':
        case 'aria-rowindextext':
            const myRowIndexEl = el.closest(`[${modulo}]`);
            if (myRowIndexEl === null)
                throw 404;
            const myRowIndex = myRowIndexEl.getAttribute(modulo);
            const gridContainer = myRowIndexEl.closest(`table,[role='grid'],[role='treegrid']`);
            if (gridContainer === null)
                throw 404;
            return Array.from(gridContainer.querySelectorAll(`[${modulo}='${myRowIndex}']`));
        default:
            throw 'NI';
    }
}
