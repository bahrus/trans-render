export class Join {
    transformer;
    constructor(transformer, fragment) {
        this.transformer = transformer;
        const childElements = Array.from(fragment.children);
        for (const el of childElements) {
            el.addEventListener('transform-join', async (e) => {
                const { target } = e;
                await transformer.transform([target]);
                transformer.flushCache();
            });
        }
    }
}
