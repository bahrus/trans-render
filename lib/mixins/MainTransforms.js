import { DTR } from '../DTR.js';
export async function MainTransforms(self, { hydratingTransform, transform, DTRCtor, make }, fragment) {
    if (hydratingTransform !== undefined || make !== undefined) {
        const ctx = {
            host: self,
            match: hydratingTransform,
            make
        };
        const ctor = DTRCtor === undefined ? DTR : DTRCtor;
        const dtr = new ctor(ctx);
        await dtr.transform(fragment);
    }
    if (transform !== undefined) {
        const transforms = Array.isArray(transform) ? transform : [transform];
        for (const t of transforms) {
            const ctx = {
                host: self,
                match: t,
            };
            const ctor = DTRCtor === undefined ? DTR : DTRCtor;
            const dtr = new ctor(ctx);
            if (!self.hasAttribute('defer-rendering')) {
                await dtr.transform(fragment);
            }
            await dtr.subscribe(!!self._isPropagating);
            const { Join } = await import('./Join.js');
            const transJoin = new Join(dtr, fragment);
        }
    }
}
