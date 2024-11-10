import { SavingContext, USL } from "../ts-refs/trans-render/XV/types.js";
import { BaseIndexedDB } from "./BaseIndexedDB.js";

export class IndexedDBObject<TObject> extends BaseIndexedDB {
    get dbOptions(){
        return { keyPath: 'key'}
    }
  
    async assign(obj: Partial<TObject>, ctx?: SavingContext){
        const USLs: Array<USL> = ctx?.USLs ?? [];
        for(const key in obj){
          await this.#setItem(key, obj[key]);
          USLs.push(`idb://${this.dbName}?.${this.storeName}?.${key}` as USL);
        }
        if(ctx === undefined){
            postMessage(USLs);
        }
        
    }
  
    async #setItem(key: keyof TObject & string, value: any) {
        const resp = await this.idbAction('put', {key, value});
        
        return resp;
    }
  
    async getProperty(key: keyof TObject) {
        return ((await this.idbAction('get', key)) as any).value;

    }
  }


  

  