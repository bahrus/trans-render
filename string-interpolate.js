export function interpolate(s, obj) {
    const split = s.split('|');
    split.forEach((sub, idx) => {
        if (sub.startsWith('.')) {
            split[idx] = obj[sub.substr(1)];
        }
    });
    return split.join('');
}
//# sourceMappingURL=string-interpolate.js.map