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

In general, signals involve "busier" syntax less declarative, especially less JSON serializable, but the developer be far less disciplined.  Roundabouts encourage small, loosely coupled functions, which are easy to test (but may suffer from more bouncing around), and the code is far more "clean."  It requires more disciplined patience from the developer, but it allows for a large solutions space of code-free declarative solutions. While the argument against signals weakens if it becomes part of the underlying platform (in particular, escaping the charge of getting stuck in proprietary vendor lock-in land), I still think the argument has some relevance.

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

So to make this concern seem, perhaps, overly alarmist, we add one more "soft" requirement to make the view model be roundabout ready -- the propagator should emit event named ~['abort'](https://github.com/whatwg/dom/issues/784)~ "disconnectedCallback" exclusively when all listeners should be aborted. So emitting this event name in the disconnectedCallback lifecycle event is highly encouraged. 

## Compacts

compacts is a portmanteau of computed actions, and the fully qualified name is really "declarative, computed actions between two members of the view model".

The simplest compacts look as follows:

```TypeScript
export class MoodStone extends O implements IMoodStoneActions {
    static override config: OConfig<IMoodStoneProps, IMoodStoneActions> = {
        ...
        compacts:{
            isHappy_to_isNotHappy: 'negate',
            data_to_dataLength: 'length',
            dataLength_to_echoLength: 'echo',
            age_to_ageChangedToggle: 'toggle',
            age_to_ageChangeCount: 'inc',
        }
    }
    
}
```

So here, the compact is saying "bind the isHappy property of the custom element view model to the isNotHappy, by negating the former and setting that value to the latter.

## Onsets 

Because roundabout creates getter/setters automatically (or more typically a web component library does the same and passes that in as a view model), the developer will find it somewhat inconvenient (but not impossible) to define their own getters and setters manually via the platform ([TODO]: document how).

But the need to interject some calculating logic in the setters is quite common.  This is what "Onsets" provide:  A way of mapping a change of a property to an action method.  If the action method returns an object, that object is merged into the view model.

```TypeScript
interface IMoodStoneProps{
    isHappy: boolean,
    age: number,
    
}

interface IMoodStoneActions{
    incAge(self: this): Partial<IMoodStoneProps>
}

export class MoodStone extends O implements IMoodStoneActions {
    static override config: OConfig<IMoodStoneProps & IMoodStoneETs, IMoodStoneActions, IMoodStoneETs> = {
        ...
        onsets:{
            isHappy_to_incAge: 1
        },
    }

    incAge({age}: this): Partial<IMoodStoneProps> {
        return {
            age: age + 1
        } as Partial<IMoodStoneProps>
    }
}
```

If the RHS is the number "0", then the action method is called every time the watched property changes.  If the RHS is the number "1", then the action method is called only when the property is truthy.

[TODO] Provide an example

## Wiring up EventTarget properties to other methods based on an event.

One example of the kind of complexity that roundabouts can handle cleanly is creating subscriptions between one property that is an eventTarget (or a weak reference to said eventTarget), and a method of the class we want to call when that eventTarget changes, again merging in what the action method returns into the view model.  Once again, the [signals](https://github.com/proposal-signals) proposal warns us about the complexity and danger of using pub/sub (such as EventTargets).  This library sees it as a challenge that using declarative syntax can rise to, because it will be sure to do what is needed to avoid the disaster that that proposal warns us about.

How would this look?  Let's take a look at an example:

[TODO]

## Infractions and Positractions

Infractions and Positractions don't open anything up that couldn't be done with the highly configurable but verbose Actions.  Infractions and Positractions just specialize in some common scenarios, and strive to eliminate boilerplate while continuing to encourage JSON driven configuration (easier to parse) and highly performant reactive analysis, without calling code unnecessarily.

### Infractions

Infractions are inferred actions, where we "parse" the left hand side of the arrow function in order to determine which parameters it depends on.

```Typescript
const calcAgePlus10: PropsToPartialProps<IMoodStoneProps> = ({age}: IMoodStoneProps) => ({agePlus10: age + 10});

export class MoodStone extends O implements IMoodStoneActions {
    static override config: OConfig<IMoodStoneProps> = {
        infractions: [calcAgePlus10]
    }
}
```

It was briefly mentioned before that one of the goals of roundabouts is that they accept as much JSON serializable information as possible.  The config property above isn't serializable as it currently stands.  So to make it JSON serializable, we must burden the developer with an extra step:

```Typescript
const calcAgePlus10: PropsToPartialProps<IMoodStoneProps> = ({age}: IMoodStoneProps) => ({agePlus10: age + 10});

export class MoodStone extends O implements IMoodStoneActions {
    calcAgePlus10 = calcAgePlus10;
    static override config: OConfig<IMoodStoneProps> = {
        infractions: ['calcAgePlus10']
    }
}
```

### Positractions [TODO]

https://youtu.be/W7YoxrKa4f0?si=rRn05JEvWFVpKP7s

Another kind of arrow function roundabout recognizes are "positractions" -- a portmanteau of "positional" and "interactions".  The examples above have relied on linking to functionality that is intimately aware of the structure of the view model.

But much functionality is much more generic.  For example, suppose we want to reuse a function that takes the maximum of two values and applies it to a third value?  We write such functions by way of tuples:

We then bind this generic function to our view model:

```TypeScript
const max = (a: number, b: number) => Math.max(a, b);

export interface IMoodStoneProps{
    age: number,
    heightInInches: number,
    maxOfAgeAndHeightInInches: number,
}
export class MoodStone extends O implements IMoodStoneActions {
    static override config: OConfig<IMoodStoneProps, IMoodStoneActions> = {
        positractions: [
            {
                do: max,
                on: ['age', 'heightInInches'],
                to: ['maxOfAgeAndHeightInInches']
            }
        ]

        
    }
}

export interface MoodStone extends IMoodStoneProps{}
```

Once again, the problem here is we are trying to make  our config as JSON serializable as possible.  To make it serializable, the developer must add a step:


```TypeScript
const max = (a: number, b: number) => ([Math.max(a, b)]);

export interface IMoodStoneProps{
    age: number,
    heightInInches: number,
    maxOfAgeAndHeightInInches: number,
}
export class MoodStone extends O implements IMoodStoneActions {
    max = max;
    static override config: OConfig<IMoodStoneProps, IMoodStoneActions> = {
        positractions: [
            {
                do: 'max',
                on: ['age', 'heightInInches'],
                //pass: ['age', 'heightInInches'],
                assignTo: ['maxOfAgeAndHeightInInches']
            }
        ]

        
    }
}

export interface MoodStone extends IMoodStoneProps{}
```

More complex example:  Looping counter

```TypeScript
const getNextValOfLoop = (currentVal: number, from: number,  to: number, step=1, loopIfMax=false)
    : [number | undefined | null, number, number, number, boolean] => {
    let hitMax = false, nextVal = currentVal, startedLoop = false;
    if(currentVal === undefined || currentVal === null || currentVal < from){
        nextVal = from;
        startedLoop = true;
    }else{
        const possibleNextVal = currentVal + step;
        if(possibleNextVal > to){
            
            if(loopIfMax){
                nextVal = from;
            }else{
                hitMax = true;
            }
        }else{
            nextVal = possibleNextVal;
        }
    }
    return [nextVal, hitMax, startedLoop];
    
}

interface TimeTickerEndUserProps{
    /**
     * Loop the time ticker.
     */
    loop: boolean;
    /**
     * Upper bound for idx before being reset to 0
     */
    repeat: boolean;
    enabled: boolean;
    disabled: boolean;
}

interface TimeTickerAllProps extends TimeTickerEndUserProps{
    ticks: number,
    idx: number,
}


export class TimeTicker{
    getNextValOfLoop = getNextValOfLoop;
    static override config: OConfig<TimeTickerAllProps> = {
        positractions: [
            {
                on: ['ticks'],
                do: 'getNextValOfLoop',
                pass: ['idx', 0, 'repeat', 1, true]
                assignTo: ['idx', 'disabled', 'enabled']
            }
        ]

        
    }
}
```

for string members of the pass array, if the string resolves to a member of the class, dynamically pass that value.  Otherwise, pass the sting literal.  To pass a string literal even if there is a member of the class with that name, wrap the string in a template literal:  '`hello`'

To pass self, use '$0'.


