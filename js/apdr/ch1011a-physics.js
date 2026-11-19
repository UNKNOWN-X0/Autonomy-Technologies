/* Pure, deterministic traces for the APDR 1011a advanced OOP lab. */
(function (root) {
  function trace(topic, choice) {
    const data = {
      alias: {
        assignment: ["a and b refer to the same list", "b.append(2) mutates that list", "Both names now show [1, 2]"],
        shallow: ["The outer list is copied", "The nested dictionary is still shared", "A nested mutation is visible through both lists"],
        deep: ["A new outer list is made", "Supported nested values are copied recursively", "Custom copy rules may preserve selected shared values"],
        identity: ["An implementation may reuse immutable objects", "Identity can vary across contexts", "Use == for value equality and is for identity"],
      },
      lookup: {
        property: ["The class supplies a property data descriptor", "The instance dictionary has the same name", "The property getter takes precedence"],
        function: ["The class stores a normal function", "The instance dictionary has the same name", "The instance value can shadow this non-data descriptor"],
        slots: ["The class declares __slots__ = ('x',)", "No base class supplies __dict__", "Assigning an undeclared y raises AttributeError"],
        precedence: ["Search the class for a data descriptor", "Then consult the instance dictionary", "Then use a non-data descriptor or class value"],
      },
      contracts: {
        protocol: ["A function needs write(text)", "A logger provides a compatible write method", "A static checker can accept it without named inheritance"],
        runtime: ["A parameter is annotated with a Protocol", "Annotations are not automatic runtime validation", "An incompatible value can still reach the function"],
        variance: ["The base accepts any object", "The subtype accepts only strings", "The subtype narrows valid inputs and breaks substitution"],
        virtual: ["An ABC registers an unrelated virtual subclass", "isinstance may recognise the registration", "The ABC is not inserted into the class MRO"],
      },
      mro: {
        diamond: ["B and C inherit from A", "D declares bases B, C", "C3 order: D, B, C, A, object"],
        super: ["Mixin is next after Leaf in the MRO", "Mixin calls super().save()", "The next class after Mixin handles save"],
        local: ["D declares bases B, C", "C3 preserves the local base order", "B is searched before C"],
        conflict: ["One branch requires X before Y", "Another branch requires Y before X", "No consistent C3 order exists; class creation fails"],
      },
      descriptor: {
        method: ["A.f accesses the function on the class", "A().f accesses it through an instance", "The second access returns a bound method"],
        property: ["The class stores a property descriptor", "Reading obj.value invokes its getter", "The stored descriptor controls the returned value"],
        classmethod: ["Subclass calls an inherited classmethod", "The descriptor supplies the accessing class", "The method receives the subclass as cls"],
        hook: ["A base only needs to register subclasses", "Class creation calls __init_subclass__", "A custom metaclass is not needed for this rule"],
      },
      design: {
        strategy: ["A client needs one sorting operation", "Two algorithms share the same operation contract", "Inject or swap a strategy without rewriting the client"],
        family: ["A UI needs matching buttons and checkboxes", "The platform choice selects both products", "An abstract factory keeps the product family compatible"],
        default: ["A list default is created at function definition", "Calls append through the same default object", "Use None and create a fresh list per call"],
        closure: ["Loop variable i reaches its final value", "Each lambda reads the captured name when called", "Capture each value with lambda i=i: i"],
      },
    };
    if (!data[topic] || !data[topic][choice]) throw new RangeError("unknown OOP trace");
    return data[topic][choice];
  }
  const api = { trace };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.APDR1011A = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
