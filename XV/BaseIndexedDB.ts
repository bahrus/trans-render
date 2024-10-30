export abstract class BaseIndexedDB{
    #db: any;
    get db(){
        return this.#db;
    }
    constructor(public dbName: string, public storeName: string){}

    abstract get dbOptions(): IDBObjectStoreParameters;
   
    async openDB(){
        let version = 1;
        
        while(true){
            try{
                await this.openDBVersion(version);
                return;
            }catch{
                version++;
            }
        }

    }
    async openDBVersion(version: number) {
        //const dbs = (await indexedDB.databases()).filter(x => x.name === this.dbName);
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, version);

            request.onupgradeneeded = (event: any) => {
                this.#db = event.target.result;
                if (!this.#db.objectStoreNames.contains(this.storeName)) {
                    this.#db.createObjectStore(this.storeName, this.dbOptions);
                }
            };

            request.onsuccess = async (event: any) => {
                const db = event.target.result;
                if(db.objectStoreNames.contains(this.storeName)){
                    this.#db = db;
                    resolve(db);
                }else{
                    reject();
                }
                

            };

            request.onerror = (event: any) => {
                reject(`Database error: ${event.target.errorCode}`);
            };
        });
    }

    async idbAction(methodName: 'add' | 'get' | 'getAll' | 'count' | 'put', arg1?: any, arg2?: any){
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store[methodName](arg1, arg2);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event: any) => {
                reject(`Add error: ${event.target.errorCode}`);
            };
        });
    }
}