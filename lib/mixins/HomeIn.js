import { MainTransforms } from './MainTransforms.js';
export function HomeIn(self, { hydratingTransform, transformPlugins, DTRCtor, homeInOn }, fragment) {
    for (const key in homeInOn) {
        const host = self[key];
        if (!(host instanceof EventTarget)) {
            throw `Property ${key} not of type EventTarget`;
        }
        const transformPacket = homeInOn[key];
        const base = {
            transformPlugins,
            DTRCtor,
            ...transformPacket,
        };
        MainTransforms(host, base, fragment);
    }
}
