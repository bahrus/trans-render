import { BaseIndexedDB } from "./BaseIndexedDB.js";

class IndexedDBObject<TObject> extends BaseIndexedDB {
    get dbOptions(){
        return { keyPath: 'key'}
    }
  
    async assign(obj: Partial<TObject>){
        for(const key in obj){
          await this.#setItem(key, obj[key]);
        }
    }
  
    async #setItem(key: keyof TObject, value: any) {
        return await this.idbAction('put', {key, value});
      // return new Promise((resolve, reject) => {
      //   const transaction = this.db.transaction([this.storeName], 'readwrite');
      //   const store = transaction.objectStore(this.storeName);
      //   const request = store.put({ key, value });
  
      //   request.onsuccess = () => {
      //     resolve();
      //   };
  
      //   request.onerror = event => {
      //     reject(`Failed to set item: ${event.target.error}`);
      //   };
      // });
    }
  
    async getProperty(key: keyof TObject) {
        return await this.idbAction('get', key);
      // return new Promise((resolve, reject) => {
      //   const transaction = this.db.transaction([this.storeName], 'readonly');
      //   const store = transaction.objectStore(this.storeName);
      //   const request = store.get(key);
  
      //   request.onsuccess = event => {
      //     resolve(event.target.result ? event.target.result.value : null);
      //   };
  
      //   request.onerror = event => {
      //     reject(`Failed to get item: ${event.target.error}`);
      //   };
      // });
    }
  }
  
  // // Usage example
  // (async () => {
  //   const db = new IndexedDBKeyValues('myDatabase', 'myStore');
  //   await db.init();
  //   await db.setItem('myKey', 'myValue');
  //   const value = await db.getItem('myKey');
  //   console.log('Stored value:', value);  // Output: Stored value: myValue
  // })();
  