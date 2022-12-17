import { MainTransforms } from './MainTransforms.js';
export function HomeIn(self, { hydratingTransform, DTRCtor, homeInOn }, fragment) {
    for (const key in homeInOn) {
        const host = self[key];
        if (!(host instanceof EventTarget)) {
            throw `Property ${key} not of type EventTarget`;
        }
        const transformPacket = homeInOn[key];
        const base = {
            DTRCtor,
            ...transformPacket,
        };
        MainTransforms(host, base, fragment);
    }
}
