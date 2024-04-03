Roundabouts vs Signals:

Signals:

```JavaScript
const counter = new Signal.State(0);
const isEven = new Signal.Computed(() => (counter.get() & 1) == 0);
const parity = new Signal.Computed(() => isEven.get() ? "even" : "odd");

effect(() => element.innerText = parity.get());

// Simulate external updates to counter...
setInterval(() => counter.set(counter.get() + 1), 1000);
```

Roundabouts:

![](https://www.trafficdepot.ca/wp-content/uploads/2020/08/reg6bb.png)

```JavaScript
const checkIfEven = ({counter}) => ({isEven: counter & 1 === 0});
const determineParity = ({isEven}) => ({parity: isEven ? 'even' : 'odd'});
const innerText = ({parity, element}) => ({'?.element?.innerText': parity};
const [vm, propagator] = await roundabout(
    {count: 0, element, checkIfEven, determineParity, innerText}, 
    {do_isEven_on: 'counter', do_parity_on: 'isEven', do_innerText_on: 'parity'}
);

setInterval(() => vm.count++, 1000);
```

Same number of lines of code, but roundabout has one long line.

roundabout can JSON serialize one of the arguments.

roundabout requires manually figuring out the dependencies ("sources"), but kind of gives the user more transparent power.

That manual calculation could be done during compile time.

Less run time analysis?

Fewer (nested) parenthesis.

Lower learning curve?

roundabout also doesn't execute code if the field value is unchanged.

No pub/sub required!

No creation of getters/setters required (other than count)!

What standard would help?

Being able to publish the dependencies in a uniform way:

```JavaScript
const parity = ({isEven}) => ({parity: isEven ? 'even' : 'odd'});
parity.do = {
    on: 'isEven'.
    if: [],
    ifOneOf:[],
    ifEquals:[]
}
```

NVM -- just use decorators, maybe?


roundabout doesn't yet support memoization (parity), which seems like a good idea



