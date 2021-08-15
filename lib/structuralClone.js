//https://surma.dev/things/deep-copy/index.html
//using history api, hitting upper limit of throttling:
//structuralClone.js:4 Throttling navigation to prevent the browser from hanging. See https://go.microsoft.com/fwlink/?linkid=2048109. Command line switch --disable-ipc-flooding-protection can be used to bypass the protection
//
export function structuralClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
