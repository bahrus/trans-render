import {RenderContext, TransformArg} from '../init.d.js';

const test = {
    //init: init,
    transform:{
        '*': x =>({
            matchNextSib: true,
        }),
        header: x => ({
            matchFirstChild: {
                mark: x => 'hello',//this.packageName,
                nav: x => ({
                    matchFirstChild:{
                        a:({target}) =>{
                            (target as HTMLAnchorElement).href = 'hello';
                            //return {}; //TODO remove with dependency update
                        }
                    }
                    
                })
            },
            inheritMatches: true,
        }),
        main: ({target}) => {
            //repeatInit(this._value.tags.length, WCInfoTemplate, target);
            return {
                inheritMatches: true,
                matchFirstChild:{
                    
                }
            };
        }
    }
} as RenderContext;