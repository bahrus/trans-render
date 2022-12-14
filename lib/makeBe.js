export function makeBe(instance, cssSelector, make) {
    const beHavingOrBeHavings = make[cssSelector];
    const beHavings = Array.isArray(beHavingOrBeHavings) ? beHavingOrBeHavings : [beHavingOrBeHavings];
    for (const beHaving of beHavings) {
        const { be, having } = beHaving;
        const wcName = 'be-' + be;
        const aInstance = instance;
        if (aInstance.beDecorated === undefined)
            aInstance.beDecorated = {};
        aInstance.beDecorated[be] = having;
        if (customElements.get(wcName)) {
            const dem = document.createElement(wcName);
            dem.attach.bind(instance);
        }
        else {
            instance.setAttribute(wcName, '');
        }
    }
}
