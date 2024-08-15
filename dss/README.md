# Data Flow Mind Reading

The microdata standard employs some "mind reading" as far as determining the "value" of an element. This idea can make developer productivity a bit higher, if conventions can be assumed unless overridden by necessity.

The following describes how we extend that concept, in a way that is predictable and easy to learn (hopefully).

consumers vs producers vs traders

When we interface with a DOM element, we may want to view it as a consumer of our state that we wish to share with it, or as a producer of state we wish to absorb, or a combination.  It can be a "passive" consumer vs an active consumer.

| term 1                | term 2             | term 3                       | term 4                       | term 5
------------------------|--------------------|------------------------------|------------------------------|
| Targeting Producer    | Active Consumer    | Mediators                    | Passive Consumer             | Public Producer
|                       | HeteroTrophs       | Pollinator Carnivorous Plant |                  | AutoTrophs
| Dispatchers           | Listeners          | Equalizers
| Emitters              | Subscribers        |
| Sharer/Setter         | Observers          | Coordinator       | Receptacle/Receiver

