import { O } from '../froop/O.js';
export class MoodStone extends O {
    static config = {
        name: 'mood-stone'
    };
}
customElements.define(MoodStone.config.name, MoodStone);
