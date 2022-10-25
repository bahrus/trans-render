export function onConnected(el: Element): Promise<void>{
    return new Promise(async (resolve) => {
        if(el.isConnected) resolve();
        while(!el.isConnected){
            await sleep(16);
        }
        resolve();
    })
}

const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))