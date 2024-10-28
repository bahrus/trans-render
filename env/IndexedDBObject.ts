import { BaseIndexedDB } from "./BaseIndexedDB.js";

export class IndexedDBObject<TObject> extends BaseIndexedDB {
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
    }
  
    async getProperty(key: keyof TObject) {
        return ((await this.idbAction('get', key)) as any).value;

    }
  }
  

  