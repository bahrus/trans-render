export async function doAttrCC(self, values, propInfos, toCamel, n, ov, nv) {
    if (n === 'defer-hydration' && nv === null && ov !== null) {
        await self.detachQR();
    }
    let propName = toCamel(n);
    const prop = propInfos[propName];
    if (prop !== undefined) {
        if (prop.dry && ov === nv)
            return;
        const aThis = self.inReflectMode ? values : self;
        switch (prop.type) {
            case 'String':
                aThis[propName] = nv;
                break;
            case 'Object':
                if (prop.parse) {
                    if (nv !== null) {
                        let val = nv.trim();
                        try {
                            val = JSON.parse(val);
                        }
                        catch (e) {
                            console.error({ val, e });
                        }
                        aThis[propName] = val;
                    }
                }
                break;
            case 'Number':
                aThis[propName] = Number(nv);
                break;
            case 'Boolean':
                aThis[propName] = nv !== null;
                break;
            case 'RegExp':
                aThis[propName] = new RegExp(nv);
                break;
        }
    }
}
