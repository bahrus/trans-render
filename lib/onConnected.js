export function onConnected(el) {
    return new Promise(async (resolve) => {
        if (el.isConnected)
            resolve();
        while (!el.isConnected) {
            await sleep(16);
        }
        resolve();
    });
}
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
