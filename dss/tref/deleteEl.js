export function deleteEl(el) {
    const children = el.via.itemref.children;
    for (const child of children) {
        deleteEl(child);
    }
    el.remove();
}
