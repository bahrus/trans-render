export async function propSum({ rhs, target, host }) {
    console.log({ rhs });
    const sum = rhs.sum.reduce((total, prop) => {
        total += host[prop];
        return total;
    }, 0);
    const to = rhs.to || 'textContent';
    target[to] = sum;
}
