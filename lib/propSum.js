export async function propSum({ rhs, target, host }) {
    const sum = rhs.$props.reduce((total, prop) => {
        total += host[prop];
        return total;
    }, 0);
    const to = rhs.to || 'textContent';
    target[to] = sum;
}
