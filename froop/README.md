Froop vs Signals:

Signals:

```JavaScript
const counter = new Signal.State(0);
const isEven = new Signal.Computed(() => (counter.get() & 1) == 0);
const parity = new Signal.Computed(() => isEven.get() ? "even" : "odd");

effect(() => element.innerText = parity.get());

// Simulate external updates to counter...
setInterval(() => counter.set(counter.get() + 1), 1000);
```

Froop:

```JavaScript
const isEven = ({counter}) => ({isEven: counter & 1 === 0});
const parity = ({isEven}) => ({parity: isEven ? 'even' : 'odd'});
const innerText = ({parity, element}) => ({'?.element?.innerText': parity}
const [vm] = await froop(
    {count: 0, element, isEven, parity, innerText}, 
    {do_isEven_on: 'counter', do_parity_on: 'isEven', do_innerText_on: 'parity'}
);

setInterval(() => vm.count++, 1000);
```

Same number of lines of code, but froop has one long line.
Froop can JSON serialize one of the arguments.
Froop requires manually figuring out the dependencies ("sources"), but kind of gives the user more transparent power.
That manual calculation could be done during compile time.
Less run time analysis?
Fewer (nested) parenthesis.
Lower learning curve?
Froop also doesn't execute code if the field value is unchanged.
No pub/sub required!
No creation of getters/setters required!

What standard would help?

Being able to publish the dependencies in a uniform way:

```JavaScript
const parity = ({isEven}) => ({parity: isEven ? 'even' : 'odd'});
parity.do = {
    on: 'isEven'
}
```


froop doesn't yet support memoization (parity), which seems like a good idea



What about pulling data in lazily [TODO]

I think, after reading through what the appeal of signals is, and comparing to what FROOP has to offer, that one piece of functionality that is missing is computed properties or methods that return a value, and how to signify dependencies on this when deciding whether to "push" through a change.

I.e. FROOP so far only supports "pushing" changes eagerly, but doesn't yet have a way of declaratively indicating that one of these action methods needs to be invoked, because one of the lazy computed properties or methods that it depends on has changed.

Actually, we can:  simply list it as a dependency in IfAllOf, or ifNoneOf, or ifKeyIn, etc.

But this requires understanding the innards of the computed property / method.

So I think we would benefit from calling subtle.introspectSources to get that list.