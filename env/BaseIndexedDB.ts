export class BaseIndexedDB{
    #db: any;
    get db(){
        return this.#db;
    }
    constructor(public dbName: string, public storeName: string, public version: number){}
   
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
                    this.#db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
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
}