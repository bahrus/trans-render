import { PEAUnionSettings, PSettings, PESettings } from './types.js';
import {applyP} from './applyP.js';
import {applyPE} from './applyPE.js';
import { camelToLisp } from './camelToLisp.js';

export async function applyPEA<T extends Partial<Element> = Element>(host: Element, target: Element, pea: PEAUnionSettings<T>) {
    await applyP(target, pea as PSettings<T>);
    await applyPE(host, target, pea as PESettings<T>);
    const attribSettings = pea[2];
    if (attribSettings !== undefined) {
        const {A} = await import ('../froop/A.js');
        A(attribSettings, target);
    }
}