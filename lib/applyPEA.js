import { applyP } from './applyP.js';
import { applyPE } from './applyPE.js';
export async function applyPEA(host, target, pea) {
    await applyP(target, pea);
    await applyPE(host, target, pea);
    const attribSettings = pea[2];
    if (attribSettings !== undefined) {
        const { A } = await import('../froop/A.js');
        A(attribSettings, target);
    }
}
