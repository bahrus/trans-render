# Roundabouts vs Signals

The world needs both traffic signals and roundabouts.  This shouldn't be an either or.

Signals:

<img align="right" src="https://github.com/proposal-signals/proposal-signals/blob/main/signals-logo.png" alt="Signals logo" width="100" style="max-width: 100%;">

```JavaScript
const counter = new Signal.State(0);
const isEven = new Signal.Computed(() => (counter.get() & 1) == 0);
const parity = new Signal.Computed(() => isEven.get() ? "even" : "odd");

effect(() => element.innerText = parity.get());

// Simulate external updates to counter...
setInterval(() => counter.set(counter.get() + 1), 1000);
```

Roundabouts:

<img align="right" src="https://www.trafficdepot.ca/wp-content/uploads/2020/08/reg6bb.png" width="100px">

```JavaScript
const checkIfEven = ({counter}) => ({isEven: counter & 1 === 0});
const determineParity = ({isEven}) => ({parity: isEven ? 'even' : 'odd'});
const setInnerText = ({parity}) => ({'?.element?.innerText': parity};
const [vm, propagator] = await roundabout(
    { propagate: {count: 0} }
    [ checkIfEven, determineParity, setInnerText ],
);

setInterval(() => vm.count++, 1000);
```

Same number of statements.  Most statements, where the developer spends more eyeball time, are smaller, easy to test.  One statement is admittedly larger.

All the functions are side effect free and don't do any state mutation at all.  Purely functional.

roundabout can JSON serialize much of the arguments, making parsing the instructions easier on the browser.

roundabout "guesses" when the developer wants to call the functions to compute new values, if not specified, based on the lhs of the arrow expressions.  But developers can take hold of the reigns, and be more explicit:

```JavaScript
const [vm, propagator] = await roundabout(
    {   
        vm: {element, checkIfEven, determineParity, setInnerText},
        propagator,
        onset:{
            count_to_checkIfEven: 0, //call whenever count changes
            isEven_to_determineParity: 1 //only call if isEven is truthy
        },
        actions:{
            setInnerText: {
                ifAllOf: ['count', 'isEven', 'parity']
            }
        },
        
    }
);
```

I suspect this will require less run time analysis?

It certainly benefits from fewer (nested) parenthesis.

State is all in one place -- the vm, which could also be the custom element class instance.

Lower learning curve?

roundabout also doesn't execute code if the field value is unchanged.

No pub/sub required!

No creation of getters/setters required (other than count)!

Basically, what roundabout does is it looks at what subset of properties of the view model is returned from the action methods (checkIfEven, determineParity, setInnerText), and directs traffic accordingly after doing an Object.assignGingerly.

propagator is an EventTarget, that publishes events when the propagate properties are changed (just count).



<!--
roundabout could support deep memoization (parity), which seems like a good idea
-->

## How to be roundabout ready

For a class to be optimized to work most effectively with roundabouts, it should implement interface RoundaboutReady:

```TypeScript
interface RoundaboutReady{
    /**
     * Allow for assigning to read only props via the "backdoor"
     * Bypasses getters / setters, sets directly to (private) memory slots
     * Doesn't do any notification
     * Allows for nested property setting
    */
    covertAssignment(obj: any): void;

    /**
     * fires event with name matching the name of the property when the value changes (but not via covertAssignment)
     * when property is set via public interface, not via an action method's return object
     */
    get propagator() : EventTarget;
}
```

So yes, we are still "clinging" to the notion that EventTargets are useful, despite the [forewarning](https://github.com/proposal-signals/proposal-signals?tab=readme-ov-file#example---a-vanillajs-counter):

> Unfortunately, not only has our boilerplate code exploded, but we're stuck with a ton of bookkeeping of subscriptions, and a potential memory leak disaster if we don't properly clean everything up in the right way.

So to make this concern seem, perhaps, overly alarmist, we add one more "soft" requirement to make the view model be roundabout ready -- the propagator should emit event named ~['abort'](https://github.com/whatwg/dom/issues/784)~ "unload" exclusively when all listeners should be aborted. So emitting this event name in the disconnectedCallback lifecycle event is highly encouraged. 

## Busses and compacts

Being designed to reduce its carbon footprint, roundabouts has first-class support for both busses and compacts.

compacts is a portmanteau of computed actions, and the fully qualified name is really "declarative, computed actions between two members of the view model".

The simples compacts look as follows:

```TypeScript
export class MoodStone extends O implements IMoodStoneActions {
    static override config: WCConfig<IMoodStoneProps, IMoodStoneActions> = {
        name: 'mood-stone',
        propDefaults:{
            age: 22,
        },
        propInfo:{
            isHappy: {
                def: true,
                attrName: 'is-happy',
                parse: true,
            },
            isNotHappy: {
                type: 'Boolean',
                ro: true,
            }
        },
        actions:{
            incAge: {
                ifAllOf: 'isHappy',
            }
        },
        compacts:{
            isHappy_to_isNotHappy: 'negate'
        }
    }
    incAge({age}: this): Partial<IMoodStoneProps> {
        return {
            age: age + 1
        } as Partial<IMoodStoneProps>
    }
}
```

So here, the compact is saying "bind the isHappy property of the custom element view model to the isNotHappy, by negating the former and setting that value to the latter.

## Wiring up EventTarget properties to other methods based on an event.

One example of the kind of complexity that roundabouts can handle cleanly is creating subscriptions between one property that is an eventTarget (or a weak reference to said eventTarget), and a method of the class we want to call when that eventTarget changes.  Once again, the [signals](https://github.com/proposal-signals) proposal warns us about the complexity and danger of using pub/sub (such as EventTargets).  This library sees it as a challenge that using declarative syntax can rise to, because it will be sure to do what is needed to avoid the disaster that that proposal warns us about.

How would this look?  Let's take a look at an example:

```TypeScript
export class TimeTicker extends HTMLElement implements Actions{

    config:{
        name: 'time-ticker',
        propDefaults: {
            ticks: 0,
            idx: -1,
            duration: 1_000,
            repeat: Infinity,
            enabled: true,
            disabled: false,
            loop: false,
            wait: true,
        },
        propInfo:{
            enabled:{
                dry: false,
            },
            repeat: {
                dry: false,
            },
            value: {
                type: 'Object'
            },
            items: {
                notify:{
                    lengthTo:'repeat'
                }
            },
            ticks: {
                notify: {
                    incTo: {
                        key: 'idx',
                        lt: 'repeat',
                        loop: 'loop',
                        notifyWhenMax: {
                            setTo: {
                                key: 'disabled',
                                val: true,
                            },
                        }
                    }
                }
            }
        },
        actions: {
            stop:{
                ifAllOf: ['disabled', 'controller']
            },
            start:{
                ifAllOf: ['duration'],
                ifNoneOf: ['disabled'],
            },
            rotateItem: {
                ifKeyIn: ['repeat', 'loop', 'idx'],
                ifNoneOf: ['disabled'],
            }
        },
        handlers: {
            timeEmitter_to_incTicks_on: 'value-changed'
        }
    }

    async start({duration, ticks, wait, controller}: this) {
        if(controller !== undefined){
            ticks = 0;
            controller.abort();
        }
        const newController = new AbortController();
        const {TimeEmitter} = await import('./TimeEmitter.js');
        const timeEmitter = new TimeEmitter(duration, newController.signal);
        return {
            controller: newController,
            ticks: wait ? ticks : ticks + 1,
            timeEmitter
        } 
    }

    incTicks({ticks}: this){
        return {
            ticks: ticks + 1
        }
    }

    stop({controller}: this) {
        controller.abort();
        return {
            controller: undefined,
        };
    }


    rotateItem({idx, items}: this){
        return {
            value: {
                idx,
                item: (items && items.length > idx) ? items[idx] : undefined,
            }
        };
    }
}

export interface TimeTicker extends AllProps{}

```



