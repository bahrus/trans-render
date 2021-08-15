export async function def(MyElementClass) {
    let tagName = MyElementClass.is;
    if (tagName === undefined) {
        const { camelToLisp } = await import('trans-render/lib/camelToLisp.js');
        tagName = camelToLisp(MyElementClass.name);
        MyElementClass.is = tagName;
    }
    let n = 0;
    let name = tagName;
    while (true) {
        if (n > 0)
            name = `${tagName}-${n}`;
        const test = customElements.get(name);
        if (test === undefined) {
            MyElementClass.isReally = name;
            customElements.define(name, MyElementClass);
            return;
        }
        else {
            if (test === MyElementClass) {
                MyElementClass.isReally = name;
                return;
            }
        }
        n++;
    }
}
