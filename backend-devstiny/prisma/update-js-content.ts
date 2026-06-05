import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Block = { type: "text"; content: string } | { type: "code"; lang?: string; code: string };

// ─── Existing chapters: keyed by current DB title ─────────────────────────────

const existingChapters: Record<string, { newTitle: string; newOrder: number; topics: string[]; sections: Block[] }> = {

  "Variables & Types": {
    newTitle: "Variables & Data Types",
    newOrder: 2,
    topics: ["var, let, const", "Primitive Types", "Reference Types", "typeof", "Type Coercion", "Truthy & Falsy"],
    sections: [
      {
        type: "text",
        content: `**var, let, and const**

JavaScript has three variable declaration keywords with important differences:

• **var** — function-scoped, hoisted to the top of its containing function (or global), can be re-declared and reassigned. Avoid in modern code.
• **let** — block-scoped (within the nearest { }), not hoisted in a usable way (Temporal Dead Zone), cannot be re-declared in the same scope, can be reassigned. Use for values that change.
• **const** — block-scoped, cannot be reassigned after declaration, cannot be re-declared. Does not mean immutable — objects and arrays declared with const can still have their contents modified. Use as the default.

**Rule of thumb**: use const by default, let when you need to reassign, never var.

**Primitive Types**

JavaScript has 7 primitive types — simple, immutable values:

• **String** — text: "hello", 'world', or template literal with backticks
• **Number** — all numbers (integers and floats): 42, 3.14, -7, Infinity, -Infinity, NaN
• **BigInt** — arbitrarily large integers: 9007199254740993n (suffix n)
• **Boolean** — true or false
• **Undefined** — a variable that has been declared but not assigned a value
• **Null** — an intentional absence of value (must be assigned explicitly)
• **Symbol** — a unique, immutable identifier (rarely used directly)

Primitives are stored by value. When you assign a primitive to another variable, a copy is made.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// var: function-scoped, avoid
var count = 0;

// let: block-scoped, reassignable
let score = 0;
score = 100; // OK

// const: block-scoped, no reassignment
const MAX_LEVEL = 99;
const player = { name: "Elvar", level: 1 };
player.level = 2;  // OK — we're mutating the object, not reassigning the variable
// player = {};    // TypeError — cannot reassign const

// Primitive types
const name    = "Elvar";        // String
const xp      = 1500;           // Number
const id      = 42n;            // BigInt
const active  = true;           // Boolean
let   rank;                     // undefined
const empty   = null;           // null (intentional)
const uid     = Symbol("uid");  // Symbol — unique

// typeof operator
console.log(typeof name);   // "string"
console.log(typeof xp);     // "number"
console.log(typeof active); // "boolean"
console.log(typeof empty);  // "object" ← famous JS quirk, null reports as "object"
console.log(typeof uid);    // "symbol"
console.log(typeof rank);   // "undefined"`,
      },
      {
        type: "text",
        content: `**Reference Types**

Objects, arrays, and functions are reference types — stored as a reference (pointer) in memory. Two variables can point to the same object.

**Type Coercion**

JavaScript automatically converts types in certain contexts (implicit coercion). This is a common source of bugs:

• \`"5" + 3\` → \`"53"\` (number 3 is coerced to string, then concatenated)
• \`"5" - 3\` → \`2\` (string "5" is coerced to number)
• \`"5" * "3"\` → \`15\` (both coerced to numbers)
• \`0 == false\` → \`true\` (== performs type coercion)
• \`0 === false\` → \`false\` (=== strict, no coercion)

Use \`===\` and \`!==\` (strict equality) in all comparisons. Use explicit conversion functions when you need to convert types: \`Number("42")\`, \`String(42)\`, \`Boolean(0)\`, \`parseInt("42px", 10)\`.

**Truthy and Falsy Values**

Every value in JavaScript is either truthy or falsy. In a boolean context (if statement, &&, ||), falsy values are treated as false.

**Falsy values** (only 8): \`false\`, \`0\`, \`-0\`, \`0n\` (BigInt zero), \`""\` (empty string), \`null\`, \`undefined\`, \`NaN\`

Everything else is truthy — including \`"0"\`, \`[]\`, \`{}\`, negative numbers.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Reference types: variables hold references, not copies
const a = { x: 1 };
const b = a;   // b and a point to the same object
b.x = 99;
console.log(a.x); // 99

// Shallow copy to avoid mutation
const c = { ...a };  // spread creates a new object
c.x = 0;
console.log(a.x); // still 99

// Type coercion traps
console.log("5" + 3);  // "53" — string concatenation
console.log("5" - 3);  // 2    — arithmetic coercion
console.log(1 == "1"); // true  — loose equality, avoid!
console.log(1 === "1");// false — strict equality, always use this

// Explicit conversion
console.log(Number("42"));     // 42
console.log(Number(""));       // 0
console.log(Number("abc"));    // NaN
console.log(parseInt("42px")); // 42 — parses leading number
console.log(String(true));     // "true"
console.log(Boolean(0));       // false
console.log(Boolean(""));      // false
console.log(Boolean([]));      // true — empty array is truthy!

// Truthy / falsy in practice
const username = "";
const display = username || "Guest"; // "Guest" — || returns first truthy
const safe    = username ?? "Guest"; // "Guest" — ?? only for null/undefined`,
      },
    ],
  },

  "Operators": {
    newTitle: "Operators",
    newOrder: 3,
    topics: ["Arithmetic", "Assignment", "Comparison", "Logical", "Nullish Coalescing", "Optional Chaining", "Ternary", "Spread"],
    sections: [
      {
        type: "text",
        content: `**Arithmetic Operators**

Standard math operations: \`+\` (addition / string concatenation), \`-\`, \`*\`, \`/\`, \`%\` (modulo / remainder), \`**\` (exponentiation).

The \`+\` operator is overloaded — if either operand is a string, it concatenates. All other arithmetic operators convert operands to numbers first.

**Assignment Operators**

Short-hand forms combine an arithmetic or logical operation with assignment:
• \`x += 5\` → \`x = x + 5\`
• \`x -= 5\`, \`x *= 5\`, \`x /= 5\`, \`x **= 2\`, \`x %= 3\`
• \`x &&= value\` — assign value only if x is truthy
• \`x ||= value\` — assign value only if x is falsy
• \`x ??= value\` — assign value only if x is null or undefined

**Comparison Operators**

• \`==\` / \`!=\` — loose equality (performs type coercion). Avoid.
• \`===\` / \`!==\` — strict equality (no coercion). Always use this.
• \`>\`, \`<\`, \`>=\`, \`<=\` — numeric or lexicographic comparison

**Logical Operators**

• \`&&\` (AND) — returns the first falsy value, or the last value if all are truthy
• \`||\` (OR) — returns the first truthy value, or the last value if all are falsy
• \`!\` (NOT) — negates a boolean value
• \`!!\` (double NOT) — converts any value to boolean: \`!!0 === false\`, \`!!"hello" === true\`

Short-circuit evaluation: \`&&\` stops at the first falsy; \`||\` stops at the first truthy. This is commonly used for conditional execution and default values.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Arithmetic
console.log(10 % 3);   // 1  (remainder)
console.log(2 ** 8);   // 256 (exponentiation)
console.log("5" + 3);  // "53" (string concat)
console.log("5" - 3);  // 2   (numeric)

// Assignment shorthand
let xp = 100;
xp += 50;   // 150
xp **= 2;   // 22500

// Logical assignment (ES2021)
let username = null;
username ??= "Guest"; // "Guest" — null/undefined only
let debug = false;
debug ||= true;       // true — falsy fallback

// Nullish coalescing: ?? vs ||
const value1 = 0    ?? "default"; // 0    — 0 is not null/undefined
const value2 = 0    || "default"; // "default" — 0 is falsy
const value3 = null ?? "default"; // "default"

// Optional chaining: ?. — avoids TypeError on null/undefined
const user = null;
console.log(user?.profile?.avatar); // undefined, no error
console.log(user?.getName?.());     // undefined, no error

// Ternary: condition ? valueIfTrue : valueIfFalse
const level = 5;
const rank  = level >= 10 ? "Master" : level >= 5 ? "Adept" : "Novice";
// "Adept"

// Spread operator
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];     // [1, 2, 3, 4, 5]
const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 };   // { a: 1, b: 2 }

// Short-circuit patterns
const isAdmin = true;
isAdmin && console.log("Admin panel"); // runs
const name = "" || "Anonymous";        // "Anonymous"`,
      },
    ],
  },

  "Control Flow": {
    newTitle: "Control Flow",
    newOrder: 4,
    topics: ["if/else/switch", "for/while/do-while", "for...of/for...in", "break/continue", "try/catch/finally", "Error Types"],
    sections: [
      {
        type: "text",
        content: `**Conditional Statements**

**if / else if / else** — evaluates a condition and runs the matching block. Conditions are coerced to boolean (truthy/falsy rules apply).

**switch** — matches a single expression against multiple cases using strict equality (===). Each case needs a \`break\` statement to prevent fall-through to the next case. The \`default\` case runs when no case matches.

**Loops**

• **for** — index-based. Best when you need the index or a known number of iterations.
• **while** — runs while a condition is true. Check condition before each iteration.
• **do...while** — like while, but guarantees at least one execution (checks condition after).
• **for...of** — iterates over any iterable (arrays, strings, Sets, Maps, NodeLists). Gives the value.
• **for...in** — iterates over the enumerable property keys of an object. Not recommended for arrays.

**break** — immediately exits the loop or switch.
**continue** — skips the rest of the current iteration and moves to the next.
**Labeled statements** — rare; allow break/continue to target an outer loop.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// if / else if / else
const xp = 1200;
if (xp >= 2000) {
  console.log("Master");
} else if (xp >= 1000) {
  console.log("Adept");   // this runs
} else {
  console.log("Novice");
}

// switch
const day = "Monday";
switch (day) {
  case "Saturday":
  case "Sunday":
    console.log("Weekend");
    break;
  case "Monday":
    console.log("Back to work");
    break;
  default:
    console.log("Weekday");
}

// for loop
for (let i = 0; i < 5; i++) {
  if (i === 3) continue; // skip 3
  console.log(i);        // 0, 1, 2, 4
}

// while
let hp = 100;
while (hp > 0) {
  hp -= 20;
}

// for...of — arrays, strings, sets
const skills = ["HTML", "CSS", "JS"];
for (const skill of skills) {
  console.log(skill);
}

// for...in — object keys
const stats = { str: 10, dex: 14, int: 18 };
for (const key in stats) {
  console.log(key, stats[key]);
}`,
      },
      {
        type: "text",
        content: `**Error Handling**

JavaScript uses try/catch/finally for structured error handling:

• **try** — the block where errors might occur. If an error is thrown, execution jumps to catch.
• **catch(error)** — receives the thrown error object. The error parameter is optional in modern JS: \`catch { }\`
• **finally** — always executes, whether or not an error occurred. Used for cleanup (closing connections, hiding spinners).

**throw** — throws any value as an error. Best practice is to throw Error objects (or subclasses), not strings.

**Built-in Error Types**

• \`TypeError\` — wrong type: calling a non-function, reading property of null/undefined
• \`ReferenceError\` — variable not defined
• \`SyntaxError\` — invalid code syntax (caught at parse time, not runtime)
• \`RangeError\` — value out of allowed range (e.g. invalid array length)
• \`URIError\` — malformed URI
• \`EvalError\` — related to eval() (rare)

Custom errors extend the Error class. Set the name property to identify the error type programmatically.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// try / catch / finally
async function loadPlayer(id) {
  try {
    const res  = await fetch("/api/players/" + id);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to load player:", error.message);
    return null;
  } finally {
    console.log("Request complete"); // always runs
  }
}

// throw custom errors
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name  = "ValidationError";
    this.field = field;
  }
}

function validateUsername(name) {
  if (typeof name !== "string") throw new TypeError("Username must be a string");
  if (name.length < 3) throw new ValidationError("Too short", "username");
  return name.trim();
}

// Error types
try {
  null.property;          // TypeError
} catch (e) {
  console.log(e instanceof TypeError); // true
  console.log(e.name);   // "TypeError"
  console.log(e.message);
}

// Re-throw if you can't handle it
try {
  riskyOperation();
} catch (e) {
  if (e instanceof ValidationError) {
    showFormError(e.field, e.message);
  } else {
    throw e; // let unknown errors propagate
  }
}`,
      },
    ],
  },

  "Functions": {
    newTitle: "Functions",
    newOrder: 5,
    topics: ["Declaration vs Expression", "Arrow Functions", "Parameters & Rest", "Closures", "Higher-order Functions", "IIFE", "Recursion"],
    sections: [
      {
        type: "text",
        content: `**Function Declaration vs Expression**

**Function declaration** — hoisted entirely (both the name and body are available before the line). Can be called before the line it is defined on.

**Function expression** — assigned to a variable. Not hoisted (only the variable declaration is hoisted, not the function value). Must be defined before use.

**Arrow functions** (\`() => {}\`) — a concise syntax for function expressions with two key differences:
1. **No own \`this\`** — arrow functions inherit \`this\` from their enclosing lexical scope. This makes them ideal for callbacks and methods that need access to the surrounding \`this\`.
2. **Implicit return** — if the body is a single expression with no curly braces, it is returned automatically.

**Parameters**

• **Default parameters** — provide a fallback if the argument is undefined: \`function greet(name = "World")\`
• **Rest parameters** (\`...args\`) — collects all remaining arguments into an array. Must be last.
• **arguments object** — available in regular (non-arrow) functions; an array-like object of all arguments passed. Use rest parameters instead in modern code.

**Closures**

A closure is a function that retains access to variables from its outer scope even after the outer function has finished executing. Every function in JavaScript is a closure — it carries a reference to its surrounding scope chain.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Function declaration — hoisted
console.log(add(2, 3)); // 5 — works before declaration
function add(a, b) { return a + b; }

// Function expression — not hoisted
const multiply = function(a, b) { return a * b; };

// Arrow functions
const square   = x => x * x;                 // single param, implicit return
const greet    = (name) => "Hello, " + name; // parens optional for one param
const makeUser = (name, level) => ({          // returning object needs parentheses
  name,
  level,
});

// Default and rest parameters
function createPlayer(name, level = 1, ...badges) {
  return { name, level, badges };
}
createPlayer("Elvar", 12, "f1", "l1"); // badges = ["f1", "l1"]
createPlayer("Lyra");                  // level = 1, badges = []

// Closures
function makeCounter(start = 0) {
  let count = start; // enclosed variable

  return {
    increment() { count++; },
    decrement() { count--; },
    value()     { return count; },
  };
}
const counter = makeCounter(10);
counter.increment();
counter.increment();
console.log(counter.value()); // 12

// Closure for data privacy
function makeWallet(initial) {
  let balance = initial; // private
  return {
    deposit(amount)  { balance += amount; },
    withdraw(amount) {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
    },
    getBalance() { return balance; },
  };
}`,
      },
      {
        type: "text",
        content: `**Higher-order Functions**

A higher-order function either accepts functions as arguments or returns a function (or both). This is possible because JavaScript treats functions as first-class values — they can be stored in variables, passed as arguments, and returned.

Common built-in higher-order functions: \`Array.map()\`, \`Array.filter()\`, \`Array.reduce()\`, \`setTimeout()\`, \`addEventListener()\`.

**IIFE — Immediately Invoked Function Expression**

An IIFE is a function that is defined and immediately called. Historically used to create a private scope. Less common with modern modules and block scope, but still useful for async IIFE patterns.

**Pure Functions and Side Effects**

A **pure function**: (1) always returns the same output for the same input, (2) has no side effects. Side effects include: modifying external state, writing to the DOM, making HTTP requests, logging, or modifying arguments.

Pure functions are predictable, testable, and composable. Aim for pure functions where practical.

**Recursion**

A function that calls itself. Every recursive function needs: (1) a base case that stops the recursion, (2) a recursive case that moves toward the base case. Without a base case, the function runs until the call stack overflows (stack overflow error).`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Higher-order functions
function applyTwice(fn, value) {
  return fn(fn(value));
}
applyTwice(x => x * 2, 3); // 12

// Returning a function (function factory)
function multiplier(factor) {
  return (number) => number * factor;
}
const double = multiplier(2);
const triple = multiplier(3);
double(5); // 10
triple(5); // 15

// IIFE — Immediately Invoked Function Expression
(function() {
  const secret = "hidden";
  console.log("IIFE runs immediately");
})();

// Async IIFE (common in top-level module code)
(async () => {
  const data = await fetch("/api/status").then(r => r.json());
  console.log(data);
})();

// Pure function — no side effects
const add = (a, b) => a + b;
const sum = [1, 2, 3].reduce(add, 0); // 6

// Impure function — modifies external state
let total = 0;
function addToTotal(n) { total += n; } // side effect

// Recursion
function factorial(n) {
  if (n <= 1) return 1;     // base case
  return n * factorial(n - 1); // recursive case
}
factorial(5); // 120

// Recursion: flatten nested array
function flatten(arr) {
  return arr.reduce((flat, item) =>
    Array.isArray(item)
      ? [...flat, ...flatten(item)]
      : [...flat, item],
    []
  );
}
flatten([1, [2, [3, [4]]]]); // [1, 2, 3, 4]`,
      },
    ],
  },

  "Loops": {
    newTitle: "Scope & Hoisting",
    newOrder: 6,
    topics: ["Global/Function/Block Scope", "Lexical Scoping", "Scope Chain", "Hoisting", "TDZ", "Variable Shadowing", "this keyword", "call/apply/bind"],
    sections: [
      {
        type: "text",
        content: `**Scope in JavaScript**

Scope determines where a variable is accessible. JavaScript has three scope levels:

• **Global scope** — variables declared outside any function or block. Accessible everywhere. In browsers, global variables become properties of \`window\`.
• **Function scope** — variables declared inside a function with \`var\`, or any variable declared inside a function. Accessible only within that function.
• **Block scope** — variables declared with \`let\` or \`const\` inside \`{ }\`. Accessible only within that block (if, for, while, etc.).

**Lexical Scoping**

JavaScript uses lexical (static) scoping — a function's scope is determined by where it is written in the source code, not where it is called from. Inner functions can access variables from their outer scope.

**Scope Chain**

When a variable is referenced, JavaScript looks it up starting from the current scope, then moves outward through each enclosing scope until it finds the variable or reaches the global scope. If not found, it throws a ReferenceError.

**Hoisting**

JavaScript's compilation phase moves declarations to the top of their scope before execution. What gets hoisted:
• \`var\` declarations — hoisted and initialised to \`undefined\`
• Function declarations — hoisted entirely (both name and body)
• \`let\` and \`const\` — hoisted but NOT initialised → Temporal Dead Zone (TDZ)
• Class declarations — hoisted but in TDZ (like let)

**Temporal Dead Zone (TDZ)**

The TDZ is the period between when a \`let\`/\`const\` variable is hoisted and when it is initialised by its declaration. Accessing the variable in this zone throws a \`ReferenceError\`. This is why you cannot use \`let\`/\`const\` before their declaration, even though they are technically hoisted.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Scope levels
var globalVar = "global";         // global scope

function outer() {
  var funcVar = "function";       // function scope

  if (true) {
    let blockVar   = "block";     // block scope
    const alsoBlock = "also";     // block scope
    var notBlock   = "leaks out"; // var ignores block!
  }

  console.log(funcVar);   // "function"
  console.log(notBlock);  // "leaks out" — var hoisted to function scope
  // console.log(blockVar); // ReferenceError
}

// Hoisting
console.log(a); // undefined — var hoisted, not yet assigned
var a = 5;

greet();        // "Hello!" — function declaration fully hoisted
function greet() { console.log("Hello!"); }

// console.log(b); // ReferenceError — TDZ
let b = 10;

// Variable shadowing
let score = 100;
function getScore() {
  let score = 999; // shadows outer score
  return score;
}
console.log(getScore()); // 999
console.log(score);      // 100 — outer unchanged

// Scope chain: inner accesses outer
function outer2() {
  const x = 10;
  function inner() {
    const y = 20;
    console.log(x + y); // 30 — x found via scope chain
  }
  inner();
}`,
      },
      {
        type: "text",
        content: `**The \`this\` Keyword**

\`this\` refers to the execution context — the object that the current code is running "in". Its value depends on how a function is called, not where it is defined (except arrow functions).

• **Global context** — \`this\` is \`window\` (browser) or \`global\` (Node.js); \`undefined\` in strict mode
• **Method call** — \`obj.method()\`: \`this\` is \`obj\`
• **Regular function call** — \`this\` is undefined in strict mode, global object otherwise
• **Arrow function** — \`this\` is inherited from the enclosing lexical scope (does not have its own \`this\`)
• **Constructor call** — \`new Function()\`: \`this\` is the new object being created
• **Event handler** — \`this\` is the element that received the event (for regular functions)

**call(), apply(), and bind()**

These methods explicitly set \`this\` for a function call:
• \`fn.call(thisArg, arg1, arg2)\` — calls fn with \`this\` set to thisArg, args as individual values
• \`fn.apply(thisArg, [arg1, arg2])\` — same, but args as an array
• \`fn.bind(thisArg)\` — returns a new function permanently bound to thisArg; does not call immediately`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// this in methods
const player = {
  name: "Elvar",
  greet() {
    console.log("Hi, I am " + this.name); // this = player
  },
};
player.greet(); // "Hi, I am Elvar"

// Lost context — common bug
const greet = player.greet;
greet(); // "Hi, I am undefined" — this is now global/undefined

// Arrow functions inherit this
const player2 = {
  name: "Lyra",
  getGreeter() {
    return () => "Hi, I am " + this.name; // arrow: this = player2
  },
};
const greeter = player2.getGreeter();
greeter(); // "Hi, I am Lyra"

// call — call with specific this
function introduce(greeting) {
  console.log(greeting + ", I am " + this.name);
}
introduce.call(player, "Hello");      // "Hello, I am Elvar"
introduce.apply(player, ["Greetings"]); // "Greetings, I am Elvar"

// bind — create bound function
const boundIntroduce = introduce.bind(player);
boundIntroduce("Hey"); // "Hey, I am Elvar"

// Practical bind: fixing this in callbacks
class Timer {
  constructor() { this.seconds = 0; }

  start() {
    setInterval(function() {
      this.seconds++; // bug: this = global
    }, 1000);

    setInterval(() => {
      this.seconds++; // fix: arrow inherits this = Timer instance
    }, 1000);
  }
}`,
      },
    ],
  },

  "Objects": {
    newTitle: "Objects",
    newOrder: 7,
    topics: ["Object Literals", "Property Access", "Destructuring", "Spread/Rest", "Object Methods", "Prototypes", "Getters & Setters"],
    sections: [
      {
        type: "text",
        content: `**Object Literals**

Objects store key-value pairs (properties). Keys are strings (or Symbols); values can be any type. Objects are reference types — variables hold a reference to the object, not the object itself.

**Property shorthand** — when the variable name matches the key name, you can omit the value: \`{ name }\` instead of \`{ name: name }\`

**Computed property names** — use \`[expression]\` as a key: \`{ [keyVar]: value }\`

**Accessing Properties**

• **Dot notation** — \`obj.key\` — use when the key is a valid identifier and known at compile time
• **Bracket notation** — \`obj["key"]\` — required for keys with spaces, special characters, or when the key is dynamic (variable)

**Adding, Modifying, and Deleting**

• Add/modify: \`obj.newKey = value\`
• Delete: \`delete obj.key\` — removes the property entirely

**Object Destructuring**

Destructuring extracts properties into variables: \`const { name, level } = player\`

Features:
• **Renaming**: \`const { name: username } = player\` — extract name as username
• **Default values**: \`const { level = 1 } = player\` — use 1 if level is undefined
• **Nested**: \`const { profile: { avatar } } = player\`
• **Rest**: \`const { name, ...rest } = player\` — rest collects remaining properties`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Object literals
const player = {
  name:  "Elvar",
  level: 12,
  active: true,
  "two words": "valid key",
};

// Property shorthand
const name  = "Lyra";
const level = 5;
const npc = { name, level }; // { name: "Lyra", level: 5 }

// Computed property name
const stat = "strength";
const stats = { [stat]: 18 }; // { strength: 18 }

// Accessing properties
console.log(player.name);           // "Elvar"
console.log(player["two words"]);   // "valid key"
const key = "level";
console.log(player[key]);           // 12

// Add, modify, delete
player.guild = "Iron Forge";
player.level = 13;
delete player.active;

// Destructuring
const { name: heroName, level: heroLevel = 1 } = player;
console.log(heroName, heroLevel); // "Elvar", 13

// Nested destructuring
const data = { user: { profile: { avatar: "/img.png" } } };
const { user: { profile: { avatar } } } = data;

// Rest in destructuring
const { name: n, ...attributes } = player;
// attributes = { level: 13, guild: "Iron Forge" }

// Spread: clone and merge
const base  = { hp: 100, mp: 50 };
const extra = { mp: 80, guild: "Mages" };
const merged = { ...base, ...extra }; // { hp: 100, mp: 80, guild: "Mages" }`,
      },
      {
        type: "text",
        content: `**Object Utility Methods**

• \`Object.keys(obj)\` — returns array of enumerable own property keys
• \`Object.values(obj)\` — returns array of enumerable own property values
• \`Object.entries(obj)\` — returns array of [key, value] pairs
• \`Object.assign(target, ...sources)\` — copies properties from sources to target (shallow)
• \`Object.freeze(obj)\` — prevents adding, removing, or modifying properties
• \`Object.seal(obj)\` — prevents adding/removing properties but allows modifying existing values
• \`Object.create(proto)\` — creates a new object with the specified prototype

**Prototypes and the Prototype Chain**

Every JavaScript object has an internal prototype (accessible via \`Object.getPrototypeOf(obj)\`). When you access a property that doesn't exist on an object, JavaScript looks up the prototype chain until it finds it or reaches \`null\` (the end of the chain).

Arrays, for example, inherit from \`Array.prototype\`, which inherits from \`Object.prototype\`, which has \`null\` as its prototype. This is why arrays have methods like \`map()\` and \`push()\` — they are defined on \`Array.prototype\`.

**Getters and Setters**

Getters and setters are special object properties that look like regular properties but run a function when read (get) or written (set). Defined with \`get\` and \`set\` keywords.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Object utility methods
const player = { name: "Elvar", level: 12, guild: "Iron Forge" };

Object.keys(player);    // ["name", "level", "guild"]
Object.values(player);  // ["Elvar", 12, "Iron Forge"]
Object.entries(player); // [["name","Elvar"], ["level",12], ["guild","Iron Forge"]]

// Iterating entries
for (const [key, value] of Object.entries(player)) {
  console.log(key + ":", value);
}

// Object.assign — shallow clone
const clone = Object.assign({}, player);

// Object.freeze — immutable
const config = Object.freeze({ version: "1.0", env: "prod" });
config.version = "2.0"; // silently fails in non-strict; throws in strict

// Prototype chain
const animal = { breathe() { return "breathing"; } };
const dog    = Object.create(animal);
dog.bark = function() { return "woof"; };

console.log(dog.bark());    // "woof"    — own method
console.log(dog.breathe()); // "breathing" — inherited from animal
console.log(Object.getPrototypeOf(dog) === animal); // true

// Getters and setters
const circle = {
  _radius: 5,
  get radius() { return this._radius; },
  set radius(r) {
    if (r < 0) throw new RangeError("Radius must be positive");
    this._radius = r;
  },
  get area() {
    return Math.PI * this._radius ** 2;
  },
};

console.log(circle.area);   // 78.53...
circle.radius = 10;
console.log(circle.area);   // 314.15...`,
      },
    ],
  },

  "Arrays": {
    newTitle: "Arrays",
    newOrder: 8,
    topics: ["Creating Arrays", "Destructuring", "Mutating Methods", "Non-mutating Methods", "Iteration Methods", "Searching", "flat/flatMap", "Array.isArray"],
    sections: [
      {
        type: "text",
        content: `**Arrays**

Arrays store ordered, indexed collections of values. Indices start at 0. Arrays are objects — \`typeof []\` returns \`"object"\`. Use \`Array.isArray(value)\` to check for arrays.

**Creating Arrays**

• **Array literal** — \`const arr = [1, 2, 3]\`
• **Array constructor** — \`new Array(5)\` creates a sparse array with length 5 (not filled with 5s)
• **Array.from(iterable)** — converts any iterable (string, Set, NodeList, arguments, etc.) or array-like into an array. Accepts an optional map function.
• **Array.of(v1, v2)** — creates an array from arguments (unlike new Array, it doesn't have the length ambiguity)

**Mutating Methods** — these modify the original array:

• \`push(...items)\` — adds to end, returns new length
• \`pop()\` — removes from end, returns removed element
• \`unshift(...items)\` — adds to start, returns new length
• \`shift()\` — removes from start, returns removed element
• \`splice(start, deleteCount, ...items)\` — removes and/or inserts at any position
• \`sort(compareFn)\` — sorts in place. Without a compare function, sorts as strings (even numbers). Always provide a compareFn for reliable numeric sort: \`arr.sort((a, b) => a - b)\`
• \`reverse()\` — reverses in place
• \`fill(value, start, end)\` — fills elements with a value`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Creating arrays
const nums  = [1, 2, 3, 4, 5];
const mixed = [1, "two", true, null, { x: 0 }];

// Array.from
Array.from("hello");              // ["h","e","l","l","o"]
Array.from({ length: 5 }, (_, i) => i + 1); // [1, 2, 3, 4, 5]
Array.from(new Set([1, 2, 2, 3])); // [1, 2, 3]

// Mutating methods
const arr = [1, 2, 3];
arr.push(4);         // [1,2,3,4]
arr.pop();           // removes 4 → [1,2,3]
arr.unshift(0);      // [0,1,2,3]
arr.shift();         // removes 0 → [1,2,3]

// splice(start, deleteCount, ...itemsToInsert)
arr.splice(1, 1, 99, 100); // remove index 1, insert 99,100 → [1,99,100,3]

// sort — MUST provide compareFn for numbers
[10, 9, 2, 21].sort();          // [10, 2, 21, 9] — sorted as strings!
[10, 9, 2, 21].sort((a,b) => a - b); // [2, 9, 10, 21] — correct

// Destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first=1, second=2, rest=[3,4,5]

// Swap values
let a = 1, b = 2;
[a, b] = [b, a]; // a=2, b=1

// Spread
const combined = [...[1,2], ...[3,4], 5]; // [1,2,3,4,5]`,
      },
      {
        type: "text",
        content: `**Non-mutating Methods** — return a new array, leaving the original unchanged:

• \`map(fn)\` — transforms each element, returns new array of same length
• \`filter(fn)\` — returns new array of elements for which fn returns truthy
• \`reduce(fn, initialValue)\` — accumulates a single value from all elements
• \`find(fn)\` — returns the first element for which fn returns truthy (or undefined)
• \`findIndex(fn)\` — returns the index of the first matching element (or -1)
• \`slice(start, end)\` — returns a copy of a portion of the array
• \`concat(...arrays)\` — merges arrays into a new one
• \`flat(depth)\` — flattens nested arrays to the specified depth
• \`flatMap(fn)\` — maps then flattens one level (more efficient than map + flat)

**Iteration and Search**

• \`forEach(fn)\` — iterates, runs fn for each element, returns undefined (not chainable)
• \`every(fn)\` — returns true if ALL elements pass fn
• \`some(fn)\` — returns true if AT LEAST ONE element passes fn
• \`includes(value)\` — returns boolean, uses SameValueZero equality
• \`indexOf(value)\` — returns first index of value, or -1
• \`join(separator)\` — joins all elements into a string`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `const players = [
  { name: "Elvar", xp: 1500, level: 12 },
  { name: "Lyra",  xp: 900,  level: 8  },
  { name: "Ferrus",xp: 2100, level: 15 },
];

// map — transform
const names   = players.map(p => p.name);   // ["Elvar", "Lyra", "Ferrus"]
const doubled = [1,2,3].map(x => x * 2);    // [2, 4, 6]

// filter — subset
const veterans = players.filter(p => p.level >= 10); // [Elvar, Ferrus]

// reduce — accumulate
const totalXP = players.reduce((sum, p) => sum + p.xp, 0); // 4500
const byName  = players.reduce((acc, p) => {
  acc[p.name] = p;
  return acc;
}, {}); // { Elvar: {...}, Lyra: {...}, Ferrus: {...} }

// find / findIndex
const found     = players.find(p => p.xp > 2000);       // Ferrus object
const foundIdx  = players.findIndex(p => p.xp > 2000);  // 2

// every / some
const allActive = players.every(p => p.xp > 0);  // true
const hasHero   = players.some(p => p.level > 14); // true

// flat and flatMap
const nested = [1, [2, [3, [4]]]];
nested.flat(1);    // [1, 2, [3, [4]]]
nested.flat(Infinity); // [1, 2, 3, 4]

const sentences = ["hello world", "foo bar"];
sentences.flatMap(s => s.split(" ")); // ["hello","world","foo","bar"]

// slice — non-mutating copy
const top2 = players.slice(0, 2); // first 2 players

// join
["HTML","CSS","JS"].join(" + "); // "HTML + CSS + JS"`,
      },
    ],
  },

  "Async JavaScript": {
    newTitle: "Async JavaScript",
    newOrder: 12,
    topics: ["Event Loop", "Callbacks", "Promises", "Promise Combinators", "async/await", "Error Handling", "setTimeout/setInterval"],
    sections: [
      {
        type: "text",
        content: `**Synchronous vs Asynchronous**

JavaScript is single-threaded — it can only execute one thing at a time. Synchronous code runs line by line; the next line cannot start until the current one finishes. Asynchronous code allows operations that take time (network requests, timers, file I/O) to run without blocking the main thread.

**The Event Loop**

The event loop is the mechanism that makes JavaScript asynchronous despite being single-threaded:

1. **Call stack** — where functions are executed, LIFO (last in, first out). Currently running code.
2. **Web APIs** — browser-provided async APIs (setTimeout, fetch, DOM events). Async operations are handed off here and do not block the stack.
3. **Task queue (macrotask queue)** — completed tasks waiting to be run (setTimeout callbacks, event handlers). Processed one per loop iteration.
4. **Microtask queue** — promise callbacks (.then, .catch), queueMicrotask(). Higher priority than tasks — all microtasks are processed before the next task.

The event loop continuously: (1) runs all synchronous code, (2) processes all microtasks, (3) processes one task, (4) repeat.

**Callbacks**

The original async pattern: pass a function to be called when an async operation completes. Callback hell (pyramid of doom) occurs when multiple async operations are nested.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Event loop demonstration
console.log("1 — sync");

setTimeout(() => console.log("4 — macrotask"), 0);

Promise.resolve().then(() => console.log("3 — microtask"));

console.log("2 — sync");
// Output: 1, 2, 3, 4

// Callback pattern (and callback hell)
fetchUser(id, (err, user) => {
  if (err) return handleError(err);
  fetchPosts(user.id, (err, posts) => {   // nested!
    if (err) return handleError(err);
    fetchComments(posts[0].id, (err, comments) => { // deeper!
      // callback hell
    });
  });
});

// Promises solve callback hell
fetchUser(id)
  .then(user    => fetchPosts(user.id))
  .then(posts   => fetchComments(posts[0].id))
  .then(comments => display(comments))
  .catch(err   => handleError(err));  // catches all errors above`,
      },
      {
        type: "text",
        content: `**Promises**

A Promise represents a value that is not available yet but will resolve to either a fulfilled value or a rejection reason. Three states: **pending** → **fulfilled** or **rejected**.

• \`.then(onFulfilled, onRejected)\` — handles the resolved value; returns a new Promise (chainable)
• \`.catch(onRejected)\` — handles rejection; shorthand for \`.then(undefined, onRejected)\`
• \`.finally(fn)\` — runs regardless of outcome (no value received)

**Promise Combinators**

• \`Promise.all([p1, p2])\` — resolves when ALL promises resolve; rejects if ANY rejects. Returns array of results.
• \`Promise.allSettled([p1, p2])\` — always resolves with array of {status, value/reason} for each promise. Never rejects.
• \`Promise.race([p1, p2])\` — resolves/rejects with the FIRST settled promise.
• \`Promise.any([p1, p2])\` — resolves with the FIRST fulfilled promise. Rejects only if ALL reject.

**async / await**

Syntactic sugar over Promises. An \`async\` function always returns a Promise. Inside an async function, \`await\` pauses execution until the awaited Promise settles, then returns the resolved value. This makes async code read like synchronous code.

Error handling: wrap in \`try/catch\`. The catch block receives the rejection reason.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Creating a Promise
const delay = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));

const fetchData = (url) =>
  new Promise((resolve, reject) => {
    if (!url) reject(new Error("No URL"));
    // ... async work
    resolve(data);
  });

// Promise combinators
const [users, posts] = await Promise.all([
  fetch("/api/users").then(r => r.json()),
  fetch("/api/posts").then(r => r.json()),
]);

const results = await Promise.allSettled([p1, p2, p3]);
results.forEach(r => {
  if (r.status === "fulfilled") console.log(r.value);
  else console.error(r.reason);
});

// async / await
async function loadPlayer(id) {
  const res  = await fetch("/api/players/" + id);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

async function main() {
  try {
    const player = await loadPlayer(42);
    console.log(player.name);
  } catch (error) {
    console.error("Failed:", error.message);
  }
}

// Parallel with await (do NOT sequential await in a loop)
// SLOW — sequential:
for (const id of ids) { await loadPlayer(id); }

// FAST — parallel:
const players = await Promise.all(ids.map(id => loadPlayer(id)));

// setTimeout / setInterval
const timerId = setTimeout(() => console.log("done"), 1000);
clearTimeout(timerId); // cancel if needed

const intervalId = setInterval(() => tick(), 500);
clearInterval(intervalId); // stop repeating`,
      },
    ],
  },
};

// ─── New chapters ──────────────────────────────────────────────────────────────

const newChapters: Array<{ title: string; topics: string[]; order: number; sections: Block[] }> = [

  // 1 ── Introduction to JavaScript ──────────────────────────────────────────
  {
    title: "Introduction to JavaScript",
    topics: ["What is JavaScript", "JS Engine", "ECMAScript", "Running JS", "History ES5→ES2024", "Dynamic Typing"],
    order: 1,
    sections: [
      {
        type: "text",
        content: `**What is JavaScript?**

JavaScript (JS) is a high-level, dynamically typed, interpreted programming language. It is the only programming language that runs natively in web browsers, making it the language of interactivity on the web.

JavaScript's three core roles in web development:
• **HTML** — structure (what content is)
• **CSS** — presentation (how it looks)
• **JavaScript** — behaviour (how it responds)

JavaScript can now also run on servers (Node.js), mobile apps (React Native), desktop apps (Electron), and IoT devices.

**How JavaScript Runs — The Engine**

JavaScript engines parse and execute JS code. Major engines:
• **V8** — Chrome, Edge, Node.js (Google)
• **SpiderMonkey** — Firefox (Mozilla)
• **JavaScriptCore** — Safari (Apple)

Modern engines use JIT (Just-In-Time) compilation — they interpret code initially but compile hot paths to native machine code for performance. This is why JavaScript, despite being "interpreted", can be very fast.

**JavaScript vs ECMAScript**

ECMAScript (ES) is the official language specification maintained by ECMA International (TC39 committee). JavaScript is the implementation of that specification in browsers. New features are proposed, debated, and standardised through the TC39 process (Stages 0–4).

Notable ECMAScript versions:
• **ES5** (2009) — strict mode, JSON, Array methods
• **ES6 / ES2015** — const/let, arrow functions, classes, Promises, modules, destructuring, template literals
• **ES2017** — async/await
• **ES2020** — optional chaining, nullish coalescing, BigInt, Promise.allSettled
• **ES2021** — logical assignment, Promise.any, String.replaceAll
• **ES2022** — class fields, top-level await, Array.at(), Object.hasOwn()
• **ES2023+** — Array.toSorted(), Array.toSpliced(), change array (non-mutating), groupBy`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Three ways to run JavaScript

// 1. Browser console (open DevTools → Console)
console.log("Hello from the browser");

// 2. Script tag in HTML
// <script src="app.js"></script>
// <script>console.log("inline script");</script>

// 3. Node.js (in terminal)
// $ node app.js

// Dynamic typing — type is determined at runtime
let value = 42;        // Number
value     = "hello";   // String  — valid, no error
value     = true;      // Boolean — valid

// typeof shows current type
console.log(typeof 42);        // "number"
console.log(typeof "hello");   // "string"
console.log(typeof true);      // "boolean"
console.log(typeof undefined); // "undefined"
console.log(typeof null);      // "object" (historical bug)
console.log(typeof {});        // "object"
console.log(typeof []);        // "object"
console.log(typeof function(){}); // "function"

// Modern JS features (ES2015+)
const greet = (name = "World") => \`Hello, \${name}!\`;
console.log(greet("Elvar")); // "Hello, Elvar!"
console.log(greet());        // "Hello, World!"`,
      },
    ],
  },

  // 9 ── Strings (Deep Dive) ──────────────────────────────────────────────────
  {
    title: "Strings (Deep Dive)",
    topics: ["String Immutability", "Template Literals", "String Methods", "Searching", "Extraction", "Transformation", "replace/split"],
    order: 9,
    sections: [
      {
        type: "text",
        content: `**String Fundamentals**

Strings are immutable sequences of UTF-16 code units. You cannot change a character in a string — every string method returns a new string. Strings can be created with single quotes, double quotes, or template literals (backticks). All three are equivalent for simple strings; choose one and be consistent.

**Template Literals**

Template literals (backtick strings) support:
• **Expression interpolation**: embed any expression with \`\${expression}\`
• **Multi-line strings**: line breaks are preserved literally
• **Tagged templates**: a function before the backtick can process the template

**String as iterable**: strings can be iterated with \`for...of\`, spread into arrays with \`[...str]\`, and indexed with \`str[0]\` or the modern \`str.at(index)\` (supports negative indices from the end).

**String Methods — Overview by Category**

**Length and access**: \`length\`, \`charAt(i)\`, \`charCodeAt(i)\`, \`at(i)\` (negative index support), \`codePointAt()\`

**Searching**: \`indexOf(str, from)\`, \`lastIndexOf(str)\`, \`includes(str)\`, \`startsWith(str)\`, \`endsWith(str)\`, \`search(regex)\`, \`match(regex)\`, \`matchAll(regex)\`

**Extraction**: \`slice(start, end)\` (supports negative indices), \`substring(start, end)\` (no negative support)

**Transformation**: \`toUpperCase()\`, \`toLowerCase()\`, \`trim()\`, \`trimStart()\`, \`trimEnd()\`, \`padStart(len, char)\`, \`padEnd(len, char)\`, \`repeat(n)\`

**Replacing and splitting**: \`replace(pattern, replacement)\`, \`replaceAll(str, replacement)\`, \`split(separator)\``,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Template literals
const name  = "Elvar";
const level = 12;
const bio   = \`
  Name:  \${name}
  Level: \${level}
  Power: \${level * 100}
\`.trim();

// Multi-line string
const sql = \`
  SELECT *
  FROM players
  WHERE level > \${level}
\`;

// at() — supports negative indices
const str = "Hello";
str.at(0);   // "H"
str.at(-1);  // "o"  — last character
str.at(-2);  // "l"

// Searching
const text = "The quick brown fox";
text.includes("quick");       // true
text.startsWith("The");       // true
text.endsWith("fox");         // true
text.indexOf("o");            // 12 — first occurrence
text.lastIndexOf("o");        // 17 — last occurrence

// Extraction
text.slice(4, 9);             // "quick"
text.slice(-3);               // "fox" — negative from end

// Transformation
"  hello world  ".trim();     // "hello world"
"hello".toUpperCase();        // "HELLO"
"42".padStart(5, "0");        // "00042"
"ha".repeat(3);               // "hahaha"

// Replace
"hello world".replace("world", "JS");     // "hello JS" — first only
"aabbaa".replaceAll("a", "x");            // "xxbbxx"

// Split
"a,b,c".split(",");           // ["a", "b", "c"]
"hello".split("");            // ["h","e","l","l","o"]
[..."hello"];                 // same result with spread

// String.raw — no escape processing
String.raw\`C:\new\tab\`;     // "C:\\new\\tab" (backslashes literal)`,
      },
    ],
  },

  // 10 ── DOM Manipulation ────────────────────────────────────────────────────
  {
    title: "DOM Manipulation",
    topics: ["Selecting Elements", "Reading/Writing Content", "Creating & Adding Elements", "Removing Elements", "Attributes", "classList", "DOM Traversal"],
    order: 10,
    sections: [
      {
        type: "text",
        content: `**The DOM**

The Document Object Model (DOM) is a tree-structured representation of an HTML document. Each HTML element becomes a node. JavaScript interacts with the page by reading and modifying the DOM via the \`document\` object.

**Selecting Elements**

• \`document.getElementById("id")\` — returns one element by id (fastest)
• \`document.querySelector("css-selector")\` — returns the first match for any CSS selector
• \`document.querySelectorAll("css-selector")\` — returns a static NodeList of all matches; convert to array with \`Array.from()\` or \`[...nl]\`
• \`document.getElementsByClassName("class")\` — live HTMLCollection (updates if DOM changes)
• \`document.getElementsByTagName("tag")\` — live HTMLCollection
• \`element.querySelector()\` — scoped search within an element

**Reading and Writing Content**

• \`element.textContent\` — gets/sets all text content (safe, ignores HTML tags)
• \`element.innerHTML\` — gets/sets HTML markup (danger: XSS if set from user input)
• \`element.innerText\` — like textContent but respects CSS visibility and formatting

**Creating Elements**

1. \`document.createElement("tag")\` — creates a detached element
2. Set content and attributes on it
3. Insert it into the DOM with an insertion method`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Selecting
const heading  = document.getElementById("main-title");
const btn      = document.querySelector(".btn-primary");
const cards    = document.querySelectorAll(".card");
const cardArr  = Array.from(cards); // NodeList → Array for map/filter

// Reading content
console.log(heading.textContent); // plain text
console.log(heading.innerHTML);   // HTML markup

// Writing content (safe)
heading.textContent = "New Title";

// Writing HTML — ONLY with trusted content, never user input
const list = document.querySelector("ul");
list.innerHTML = "<li>Item 1</li><li>Item 2</li>";

// Creating and inserting elements
const li = document.createElement("li");
li.textContent = "New quest";
li.className   = "quest-item";
list.appendChild(li);          // add at end
list.prepend(li);              // add at start

const anchor = document.querySelector(".target");
anchor.before(li);  // insert before anchor
anchor.after(li);   // insert after anchor

// insertBefore (classic)
parent.insertBefore(newEl, referenceEl);

// Removing
li.remove();                     // remove self
parent.removeChild(child);       // remove child

// Cloning
const clone = card.cloneNode(true); // true = deep clone (with children)`,
      },
      {
        type: "text",
        content: `**Working with Attributes**

• \`element.getAttribute("name")\` — reads any attribute value (returns string)
• \`element.setAttribute("name", "value")\` — sets/updates an attribute
• \`element.removeAttribute("name")\` — removes the attribute
• \`element.hasAttribute("name")\` — returns boolean
• \`element.dataset\` — access data-* attributes as camelCase properties

Direct property access works for standard attributes and is faster: \`element.id\`, \`element.href\`, \`element.src\`, \`element.value\` (for form controls).

**Modifying Classes**

\`classList\` is the modern API for managing classes:
• \`classList.add("a", "b")\` — adds classes
• \`classList.remove("a")\` — removes classes
• \`classList.toggle("active")\` — adds if absent, removes if present
• \`classList.toggle("active", condition)\` — add if condition true, remove if false
• \`classList.contains("active")\` — returns boolean
• \`classList.replace("old", "new")\` — replaces one class with another

**Inline Styles**

\`element.style.propertyName\` — sets inline style. Property names are camelCase: \`element.style.backgroundColor\`. Read the computed style (including CSS classes) with \`getComputedStyle(element).propertyName\`.

**DOM Traversal**

Navigate the tree from a known node: \`parentElement\`, \`children\` (live HTMLCollection), \`firstElementChild\`, \`lastElementChild\`, \`nextElementSibling\`, \`previousElementSibling\`, \`closest("selector")\` (walks up to find ancestor).`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Attributes
const link = document.querySelector("a");
link.getAttribute("href");           // "/about"
link.setAttribute("target", "_blank");
link.removeAttribute("title");
link.hasAttribute("href");           // true

// data-* attributes
const btn = document.querySelector("[data-product-id]");
btn.dataset.productId;   // reads data-product-id="42" as "42"
btn.dataset.category;    // reads data-category="books"

// classList
const card = document.querySelector(".card");
card.classList.add("highlighted");
card.classList.remove("hidden");
card.classList.toggle("active");
card.classList.toggle("selected", isSelected); // conditional

const isActive = card.classList.contains("active");
card.classList.replace("old-class", "new-class");

// Inline styles (camelCase)
const box = document.querySelector(".box");
box.style.backgroundColor = "#1a1a2e";
box.style.transform       = "translateY(-4px)";
box.style.display         = "none";

// Read computed styles (includes CSS classes)
const computed = getComputedStyle(box);
console.log(computed.fontSize); // "16px"

// DOM traversal
const item = document.querySelector(".active");
item.parentElement;                  // parent
item.children;                       // live HTMLCollection of children
item.nextElementSibling;             // next sibling
item.previousElementSibling;         // previous sibling
item.closest(".card");               // walks up to find .card ancestor`,
      },
    ],
  },

  // 11 ── Events ──────────────────────────────────────────────────────────────
  {
    title: "Events",
    topics: ["addEventListener", "Event Object", "Bubbling & Capturing", "Event Delegation", "Custom Events", "Window Events"],
    order: 11,
    sections: [
      {
        type: "text",
        content: `**Event Listeners**

\`element.addEventListener(type, handler, options)\` — attaches a handler for the event type. Multiple listeners can be attached to the same element for the same event.

\`element.removeEventListener(type, handler)\` — removes a specific listener. The handler must be the same function reference (not an anonymous function).

Common event types:
• **Mouse**: \`click\`, \`dblclick\`, \`mousedown\`, \`mouseup\`, \`mouseover\`, \`mouseout\`, \`mousemove\`, \`contextmenu\`
• **Keyboard**: \`keydown\`, \`keyup\`, \`keypress\` (deprecated)
• **Form**: \`input\`, \`change\`, \`submit\`, \`focus\`, \`blur\`, \`reset\`
• **Window**: \`load\`, \`DOMContentLoaded\`, \`resize\`, \`scroll\`, \`beforeunload\`

**The Event Object**

The handler receives an event object automatically:
• \`event.target\` — the element that triggered the event
• \`event.currentTarget\` — the element the listener is attached to (same as \`this\` for regular functions)
• \`event.type\` — the event type string
• \`event.preventDefault()\` — prevents the default browser action (form submission, link navigation)
• \`event.stopPropagation()\` — stops the event from bubbling/capturing further
• \`event.stopImmediatePropagation()\` — stops propagation AND prevents other listeners on the same element`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// addEventListener
const btn = document.querySelector(".btn");

function handleClick(event) {
  console.log("Clicked:", event.target);
  console.log("Type:", event.type);
}

btn.addEventListener("click", handleClick);
btn.removeEventListener("click", handleClick); // must be same reference

// Anonymous function — cannot be removed later
btn.addEventListener("click", (e) => {
  e.preventDefault(); // stop default behaviour
  console.log("Button clicked");
});

// options object
btn.addEventListener("click", handler, { once: true });  // fires once then removes itself
btn.addEventListener("click", handler, { passive: true }); // hint: no preventDefault
btn.addEventListener("click", handler, { capture: true }); // listen in capture phase

// Keyboard events
document.addEventListener("keydown", (e) => {
  console.log(e.key, e.code);  // e.g. "Enter", "Enter"
  if (e.key === "Escape") closeModal();
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    save();
  }
});

// Form events
const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault(); // stop page reload
  const data = new FormData(form);
  const username = data.get("username");
  // process form data
});

const input = document.querySelector("input");
input.addEventListener("input", (e) => {
  console.log("Value:", e.target.value); // fires on every keystroke
});`,
      },
      {
        type: "text",
        content: `**Event Bubbling and Capturing**

When an event fires on an element, it propagates in three phases:
1. **Capture phase** — event travels down from window → document → body → target
2. **Target phase** — event is at the target element
3. **Bubble phase** — event travels back up target → body → document → window

By default, listeners are attached to the bubble phase. Most events bubble (click, input, submit, etc.). Some do not (focus, blur — but their equivalents focusin, focusout do bubble).

Use \`event.stopPropagation()\` to prevent the event from reaching parent listeners. Use carefully — it can break analytics and accessibility tools that listen at higher levels.

**Event Delegation**

Instead of attaching listeners to each child element, attach one listener to a parent. Use \`event.target\` to determine which child was clicked. This is more efficient (fewer listeners) and works for dynamically added elements.

\`event.target.closest(".selector")\` is the safest way to find the relevant ancestor of a deeply nested click target.

**Custom Events**

\`CustomEvent\` lets you define and dispatch your own events, passing arbitrary data via the \`detail\` property. Dispatch with \`element.dispatchEvent(event)\`.

**Window Events**

• \`DOMContentLoaded\` — HTML parsed and DOM ready (before images/CSS load). Best for most JS initialization.
• \`load\` — everything (images, styles) fully loaded.
• \`beforeunload\` — user is leaving the page; can show a confirmation dialog.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Event bubbling demo
document.querySelector(".parent").addEventListener("click", (e) => {
  console.log("parent listener — bubbled up from", e.target);
});

document.querySelector(".child").addEventListener("click", (e) => {
  e.stopPropagation(); // stops event reaching parent listener
  console.log("child listener");
});

// Event delegation — efficient
document.querySelector(".quest-list").addEventListener("click", (e) => {
  const item = e.target.closest(".quest-item"); // find relevant ancestor
  if (!item) return; // click was not on or inside a quest item

  const questId = item.dataset.questId;
  openQuest(questId);
});

// Works even for items added later:
const newItem = document.createElement("li");
newItem.className    = "quest-item";
newItem.dataset.questId = "new-123";
document.querySelector(".quest-list").appendChild(newItem);
// The click handler above will catch clicks on newItem automatically

// Custom Events
const questComplete = new CustomEvent("questComplete", {
  bubbles: true,
  detail: { questId: "f1", xp: 100, badge: "quest-f1" },
});
document.querySelector(".quest").dispatchEvent(questComplete);

// Listening for custom events
document.addEventListener("questComplete", (e) => {
  console.log("Quest done:", e.detail.questId);
  awardXP(e.detail.xp);
});

// DOMContentLoaded — initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

// resize with debounce
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(handleResize, 200);
});`,
      },
    ],
  },

  // 13 ── Fetch API & HTTP ────────────────────────────────────────────────────
  {
    title: "Fetch API & HTTP",
    topics: ["HTTP Methods", "fetch()", "Response Object", "Sending Data", "JSON", "Error Handling", "CORS", "AbortController"],
    order: 13,
    sections: [
      {
        type: "text",
        content: `**HTTP Request Methods**

• \`GET\` — retrieve a resource. No body. Idempotent (same request = same result).
• \`POST\` — create a resource. Has a body. Not idempotent.
• \`PUT\` — replace a resource entirely. Has a body. Idempotent.
• \`PATCH\` — partially update a resource. Has a body.
• \`DELETE\` — delete a resource. No body (usually). Idempotent.

**fetch()**

The \`fetch()\` API makes HTTP requests and returns a Promise that resolves to a \`Response\` object. It rejects ONLY on network errors (no internet, DNS failure). HTTP error status codes (404, 500) do NOT cause rejection — you must check \`response.ok\` or \`response.status\` manually.

**Response Object**

• \`response.ok\` — boolean: true if status 200–299
• \`response.status\` — HTTP status code (200, 404, 500, etc.)
• \`response.statusText\` — status message ("OK", "Not Found")
• \`response.headers\` — Headers object
• \`response.json()\` — reads body as JSON, returns Promise
• \`response.text()\` — reads body as text, returns Promise
• \`response.blob()\` — reads body as Blob (for files/images)
• Body methods can only be called once — the stream is consumed`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Basic GET request
async function getPlayer(id) {
  const res = await fetch("/api/players/" + id);

  if (!res.ok) {
    throw new Error("HTTP error: " + res.status);
  }

  const player = await res.json();
  return player;
}

// POST request with JSON body
async function createPlayer(data) {
  const res = await fetch("/api/players", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getToken(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Request failed");
  }

  return res.json();
}

// PATCH — partial update
async function updateLevel(id, level) {
  return fetch("/api/players/" + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level }),
  }).then(res => {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  });
}

// DELETE
await fetch("/api/players/" + id, { method: "DELETE" });`,
      },
      {
        type: "text",
        content: `**JSON Serialization**

• \`JSON.stringify(value, replacer, spaces)\` — converts JavaScript value to JSON string. Functions, \`undefined\`, and \`Symbol\` are omitted. Circular references throw.
• \`JSON.parse(string, reviver)\` — converts JSON string back to JavaScript value. Invalid JSON throws SyntaxError.

**Error Handling with fetch**

Two categories of errors:
1. **Network errors** — no internet, DNS failure: fetch() Promise rejects
2. **HTTP errors** — server returned 4xx/5xx: fetch() Promise resolves, but \`response.ok\` is false

Always handle both.

**CORS — Cross-Origin Resource Sharing**

The browser's same-origin policy blocks JavaScript from reading responses from a different origin (protocol + domain + port). CORS is the mechanism for servers to opt-in to cross-origin requests via response headers: \`Access-Control-Allow-Origin: *\` or \`Access-Control-Allow-Origin: https://your-site.com\`

Simple requests (GET, POST with certain content types) go through directly. Preflighted requests (DELETE, PUT, custom headers) first send an \`OPTIONS\` request. If the server allows it, the actual request is sent.

CORS is enforced by the browser, not the server. If you control the backend, add the headers there. If you don't, use a server-side proxy.

**AbortController**

Cancel a pending fetch request by passing an AbortSignal. Useful for cancelling stale requests when a component unmounts or when the user types a new search query.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// JSON
const player = { name: "Elvar", level: 12, active: true };
const json   = JSON.stringify(player);         // '{"name":"Elvar","level":12,"active":true}'
const pretty = JSON.stringify(player, null, 2); // formatted with 2-space indent
const back   = JSON.parse(json);              // { name: "Elvar", level: 12, active: true }

// Error handling — network AND HTTP errors
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const body = await res.text();
      throw new Error("HTTP " + res.status + ": " + body);
    }
    return await res.json();
  } catch (error) {
    if (error.name === "AbortError") return null; // cancelled — not an error
    throw error;
  }
}

// AbortController — cancel requests
function useSearch() {
  let controller = null;

  return async function search(query) {
    if (controller) controller.abort(); // cancel previous
    controller = new AbortController();

    const results = await fetch("/api/search?q=" + query, {
      signal: controller.signal,
    }).then(r => r.json());

    return results;
  };
}

// Uploading a file with FormData
async function uploadAvatar(file) {
  const form = new FormData();
  form.append("avatar", file);
  form.append("playerId", "42");

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,  // no Content-Type header — browser sets it with boundary
  });
  return res.json();
}`,
      },
    ],
  },

  // 14 ── ES Modules ──────────────────────────────────────────────────────────
  {
    title: "ES Modules",
    topics: ["Named vs Default Exports", "import/export syntax", "Re-exporting", "Dynamic import()", "Module Scope", "CommonJS vs ESM"],
    order: 14,
    sections: [
      {
        type: "text",
        content: `**What Are Modules?**

ES Modules (ESM) are the official JavaScript module system. Each file is a module with its own scope — variables declared in a module are not global. Modules communicate via \`export\` and \`import\`.

Benefits of modules:
• **Encapsulation** — private implementation details stay private
• **Reuse** — share code across files without globals
• **Dependency clarity** — explicit imports show what a file depends on
• **Tree shaking** — bundlers can remove unused exports

In HTML, use \`<script type="module">\`. Module scripts are deferred by default and have their own scope.

**Named Exports**

A file can export multiple named values. Imports must use the same name (or rename with \`as\`).

**Default Export**

Each module can have one default export. It represents the "main thing" the module provides. Import with any name (no curly braces needed).

**Mixing Named and Default**

A module can have both one default export and multiple named exports. Both can be imported in one statement.

**Re-exporting**

Re-export lets you create an index file that aggregates exports from multiple modules — a common pattern for public APIs.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// player.js — named exports
export const MAX_LEVEL = 99;

export function createPlayer(name, level = 1) {
  return { name, level, xp: 0 };
}

export class PlayerError extends Error {
  constructor(msg) { super(msg); this.name = "PlayerError"; }
}

// api.js — default export
export default async function fetchPlayer(id) {
  const res = await fetch("/api/players/" + id);
  return res.json();
}

// utils.js — named + default
export const VERSION = "1.0.0";
export function formatXP(xp) { return xp.toLocaleString() + " XP"; }
export default { VERSION, formatXP }; // default wraps named

// ─── Importing ─────────────────────────────────────────────
// Named imports
import { createPlayer, MAX_LEVEL } from "./player.js";

// Rename on import
import { createPlayer as makePlayer } from "./player.js";

// Default import (any name)
import fetchPlayer from "./api.js";

// Default + named together
import utils, { VERSION } from "./utils.js";

// Namespace import — all named exports as one object
import * as PlayerModule from "./player.js";
PlayerModule.createPlayer("Elvar");

// Re-export (index file — src/index.js)
export { createPlayer, MAX_LEVEL } from "./player.js";
export { default as fetchPlayer } from "./api.js";
export * from "./utils.js";

// Dynamic import — lazy load on demand
async function openAdminPanel() {
  const { AdminPanel } = await import("./admin.js");
  new AdminPanel().render();
}`,
      },
    ],
  },

  // 15 ── Classes & OOP ────────────────────────────────────────────────────────
  {
    title: "Classes & OOP",
    topics: ["Class Syntax", "constructor", "Instance & Static", "Inheritance", "Private Fields", "Getters/Setters", "Mixins"],
    order: 15,
    sections: [
      {
        type: "text",
        content: `**Classes in JavaScript**

Class syntax (ES2015+) provides a cleaner way to write prototype-based inheritance. Under the hood, classes are syntactic sugar — \`class\` still uses prototypes.

**class declaration** — hoisted but in TDZ (cannot be used before definition).
**class expression** — can be named or anonymous, assigned to a variable.

The \`constructor()\` method is called when creating a new instance with \`new\`. If omitted, an empty constructor is used. \`new ClassName(args)\` creates a new object, sets its prototype, calls constructor with the object as \`this\`, and returns the object.

**Instance Methods and Properties**

Methods defined in the class body are added to the prototype — shared across all instances (memory efficient). Instance properties can be set in the constructor via \`this.prop = value\`, or declared at class level (class fields, ES2022).

**Static Methods and Properties**

\`static\` members belong to the class itself, not instances. Accessed via \`ClassName.method()\`, not on the instance. Use for utility/factory methods and class-level configuration.

**Inheritance with extends and super()**

\`extends\` creates a subclass that inherits all methods from the parent. The subclass constructor must call \`super()\` before accessing \`this\`. \`super.method()\` calls the parent's method from a subclass method.

**Private Fields (ES2022)**

Fields and methods prefixed with \`#\` are private — accessible only within the class body. They cannot be accessed or modified from outside, not even by subclasses.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Class definition
class Player {
  // Public class field (ES2022)
  #xp = 0;          // private field
  level = 1;        // public field

  static MAX_LEVEL  = 99;       // static property
  static #instances = 0;        // private static

  constructor(name, guild = "Freelancer") {
    this.name  = name;
    this.guild = guild;
    Player.#instances++;
  }

  // Instance method
  gainXP(amount) {
    this.#xp += amount;
    if (this.#xp >= this.level * 100) this.levelUp();
  }

  // Private method
  #levelUp() {
    this.level = Math.min(this.level + 1, Player.MAX_LEVEL);
  }

  // Getter
  get xp() { return this.#xp; }

  // Static method (factory)
  static create(name) { return new Player(name); }
  static count()      { return Player.#instances; }

  toString() { return \`\${this.name} (Level \${this.level})\`; }
}

// Inheritance
class Mage extends Player {
  #mana;

  constructor(name, mana = 100) {
    super(name, "Arcane Council"); // must call super() first
    this.#mana = mana;
  }

  castSpell(cost) {
    if (this.#mana < cost) throw new Error("Not enough mana");
    this.#mana -= cost;
    super.gainXP(cost * 2); // call parent method
  }

  get mana() { return this.#mana; }
}

const elvar = new Mage("Elvar", 200);
elvar.castSpell(50);
console.log(elvar.xp);    // 100
console.log(elvar instanceof Mage);   // true
console.log(elvar instanceof Player); // true`,
      },
    ],
  },

  // 16 ── Iterators & Generators ─────────────────────────────────────────────
  {
    title: "Iterators & Generators",
    topics: ["Iterable Protocol", "Iterator Protocol", "Custom Iterables", "function*", "yield", "Infinite Generators", "Async Generators"],
    order: 16,
    sections: [
      {
        type: "text",
        content: `**The Iteration Protocols**

JavaScript has two related protocols that define how objects can be iterated:

**Iterable protocol**: an object is iterable if it has a \`Symbol.iterator\` method that returns an iterator. Built-in iterables: Array, String, Set, Map, NodeList, arguments, generators.

**Iterator protocol**: an object is an iterator if it has a \`next()\` method that returns an object with \`{ value, done }\`. When \`done\` is true, iteration stops.

These protocols power \`for...of\` loops, spread syntax, destructuring, \`Array.from()\`, \`Promise.all()\`, and more.

**Generator Functions**

Generator functions (\`function*\`) return a generator object that implements both the iterable and iterator protocols. \`yield\` pauses the function and sends a value out. The next call to \`next()\` resumes from where it paused.

Generators are lazy — they compute values on demand, not all at once. This makes them ideal for infinite sequences and streaming data.

**Use Cases**

• **Custom data structures** — make any object iterable
• **Infinite sequences** — IDs, pagination, random values without loading everything into memory
• **Control flow** — cancellable iterations, cooperative multitasking
• **Async generators** — \`async function*\` with \`for await...of\` for streaming async data`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Custom iterable
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last  = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
};

for (const n of range) console.log(n); // 1, 2, 3, 4, 5
console.log([...range]);               // [1, 2, 3, 4, 5]
const [a, b, c] = range;              // destructuring

// Generator function
function* generateRange(from, to) {
  for (let i = from; i <= to; i++) {
    yield i; // pauses here and sends i out
  }
}

const gen = generateRange(1, 3);
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

for (const n of generateRange(1, 5)) console.log(n);
console.log([...generateRange(1, 5)]); // [1,2,3,4,5]

// Infinite generator
function* idGenerator(start = 1) {
  while (true) {
    yield start++;
  }
}
const nextId = idGenerator();
nextId.next().value; // 1
nextId.next().value; // 2
nextId.next().value; // 3

// Async generator — streaming data
async function* fetchPages(baseUrl) {
  let page = 1;
  while (true) {
    const res  = await fetch(baseUrl + "?page=" + page);
    const data = await res.json();
    if (!data.items.length) return;
    yield data.items;
    page++;
  }
}

for await (const items of fetchPages("/api/quests")) {
  renderItems(items);
}`,
      },
    ],
  },

  // 17 ── Advanced Concepts ───────────────────────────────────────────────────
  {
    title: "Advanced Concepts",
    topics: ["Closures in Depth", "Currying", "Memoization", "Map & Set", "WeakMap & WeakSet", "Proxy & Reflect", "Functional Programming"],
    order: 17,
    sections: [
      {
        type: "text",
        content: `**Closures in Depth**

A closure gives a function access to its outer scope even after the outer function has returned. Every function in JavaScript is a closure.

Practical uses:
• **Data privacy** — hide implementation details, expose a public API
• **Memoization** — cache results of expensive function calls
• **Partial application / currying** — produce specialised functions from general ones
• **Event handlers** — capture loop variables correctly

**Currying and Partial Application**

**Currying** — transforming a function that takes multiple arguments into a sequence of functions, each taking one argument: \`add(1)(2)\` instead of \`add(1, 2)\`.

**Partial application** — fixing some arguments of a function, producing a function with fewer arguments. \`Function.prototype.bind(thisArg, ...fixedArgs)\` partially applies.

**Memoization**

Caching the return value of a function based on its arguments. If the function is called again with the same arguments, return the cached result instead of recomputing. Effective for pure, expensive functions called repeatedly with the same inputs.

**Functional Programming Concepts**

• **Immutability** — never mutate data; create new copies instead
• **Pure functions** — same input → same output, no side effects
• **Function composition** — combine small functions into larger ones: \`compose(f, g)(x) = f(g(x))\`
• **Higher-order functions** — map, filter, reduce are the workhorses`,
      },
      {
        type: "text",
        content: `**Map and Set**

**Map** — a key-value collection where keys can be any type (unlike plain objects where keys are strings/Symbols). Maintains insertion order. Useful when keys are non-string or when order matters.

**Set** — a collection of unique values (any type). Automatically removes duplicates. Useful for deduplication, checking membership, and set operations.

**WeakMap and WeakSet**

**WeakMap** — like Map but keys must be objects, and keys are held weakly. If the key object is garbage collected, the entry is automatically removed. Cannot be iterated. Use for attaching metadata to objects without preventing garbage collection.

**WeakSet** — like Set but only holds objects, held weakly.

**Proxy and Reflect**

\`Proxy\` wraps an object and intercepts fundamental operations (property access, assignment, function calls, etc.) via **traps** defined in a handler object.

\`Reflect\` provides the same set of methods as Proxy traps but as static functions — useful inside traps to forward the operation to the original object.

Common Proxy use cases: validation, logging/debugging, reactive data (Vue 3's reactivity system uses Proxy), access control, lazy evaluation.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Memoization
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
const expensiveCalc = memoize((n) => {
  // heavy computation
  return n * n;
});

// Currying
const curry = fn => {
  const arity = fn.length;
  return function curried(...args) {
    return args.length >= arity
      ? fn(...args)
      : (...more) => curried(...args, ...more);
  };
};

const add     = curry((a, b, c) => a + b + c);
const add10   = add(10);
const add10to5 = add10(5);
add10to5(3); // 18

// Map
const scores = new Map();
scores.set("Elvar", 1500);
scores.set("Lyra",  900);
scores.get("Elvar");           // 1500
scores.has("Ferrus");          // false
scores.size;                   // 2
for (const [name, xp] of scores) console.log(name, xp);

// Set — deduplication
const tags  = new Set(["html", "css", "html", "js"]); // {"html","css","js"}
tags.add("ts");
tags.has("css");  // true
tags.size;        // 4
const unique = [...new Set([1,2,2,3,3,3])]; // [1,2,3]

// Proxy — validation
const player = new Proxy({}, {
  set(target, key, value) {
    if (key === "level" && (typeof value !== "number" || value < 1)) {
      throw new RangeError("Level must be a positive number");
    }
    target[key] = value;
    return true;
  },
  get(target, key) {
    return key in target ? target[key] : 0; // default 0 for missing stats
  },
});

player.level = 12;  // OK
player.xp    = 1500; // OK
// player.level = -1; // RangeError`,
      },
    ],
  },

  // 18 ── JavaScript in the Browser ──────────────────────────────────────────
  {
    title: "JavaScript in the Browser",
    topics: ["window object", "localStorage/sessionStorage", "History API", "URL API", "Clipboard API", "requestAnimationFrame", "Cookies"],
    order: 18,
    sections: [
      {
        type: "text",
        content: `**The Browser Environment**

In the browser, the global object is \`window\`. All global variables and functions are properties of window. The \`document\` property is the entry point to the DOM. Other important window properties: \`location\`, \`history\`, \`navigator\`, \`screen\`, \`localStorage\`, \`sessionStorage\`, \`console\`.

**localStorage and sessionStorage**

Both are synchronous key-value stores for strings. Key differences:
• \`localStorage\` — persists until explicitly cleared (survives page reloads and browser restarts, scoped to the origin)
• \`sessionStorage\` — cleared when the tab/session ends

Both share the same API: \`setItem(key, value)\`, \`getItem(key)\`, \`removeItem(key)\`, \`clear()\`, \`length\`, \`key(index)\`.

Values are always strings — use \`JSON.stringify\` and \`JSON.parse\` for objects.

**The History API**

\`history.pushState(state, title, url)\` — adds a new entry to the browser history without a page reload. Essential for single-page applications.

\`history.replaceState(state, title, url)\` — replaces the current history entry.

\`window.addEventListener("popstate", handler)\` — fires when the user presses back/forward.

**The navigator Object**

Provides information about the browser and device: \`navigator.userAgent\`, \`navigator.language\`, \`navigator.online\` (connectivity), \`navigator.geolocation\`, \`navigator.clipboard\`, \`navigator.serviceWorker\`.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// localStorage — persists across sessions
localStorage.setItem("theme", "dark");
const theme = localStorage.getItem("theme"); // "dark"
localStorage.removeItem("theme");

// Storing objects (must stringify)
const player = { name: "Elvar", level: 12 };
localStorage.setItem("player", JSON.stringify(player));
const saved = JSON.parse(localStorage.getItem("player") || "null");

// sessionStorage — same API, cleared on tab close
sessionStorage.setItem("draft", "unsaved content");

// History API — for SPA routing
function navigate(url, state = {}) {
  history.pushState(state, "", url);
  renderPage(url);
}

window.addEventListener("popstate", (event) => {
  renderPage(window.location.pathname);
});

navigate("/quests");
navigate("/quests/f1", { questId: "f1" });
history.back();    // triggers popstate

// URL API
const url = new URL("https://devstiny.com/books/html?chapter=3#section-2");
url.pathname;           // "/books/html"
url.searchParams.get("chapter"); // "3"
url.hash;               // "#section-2"
url.searchParams.set("chapter", "4");
url.toString();         // updated URL string

// Clipboard API
async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
  console.log("Copied!");
}
async function readFromClipboard() {
  return navigator.clipboard.readText();
}

// requestAnimationFrame — smooth animation loop
function animate() {
  const id = requestAnimationFrame(animate); // ~60fps
  // update positions, etc.
  if (done) cancelAnimationFrame(id);
}
requestAnimationFrame(animate);

// navigator.online
window.addEventListener("online",  () => showBanner("Back online"));
window.addEventListener("offline", () => showBanner("You are offline"));`,
      },
    ],
  },

  // 19 ── Debugging & Tooling ─────────────────────────────────────────────────
  {
    title: "Debugging & Tooling",
    topics: ["console methods", "DevTools Breakpoints", "Stack Traces", "ESLint", "Prettier", "npm basics", "Bundlers", "Jest basics"],
    order: 19,
    sections: [
      {
        type: "text",
        content: `**console Methods**

Beyond \`console.log()\`:
• \`console.error(msg)\` — outputs to stderr, shows in red
• \`console.warn(msg)\` — shows with warning icon
• \`console.table(data)\` — renders array/object as a table
• \`console.group("label")\` / \`console.groupEnd()\` — collapsible group
• \`console.time("label")\` / \`console.timeEnd("label")\` — measures elapsed time
• \`console.count("label")\` — counts how many times called
• \`console.trace()\` — prints the current call stack
• \`console.assert(cond, msg)\` — logs if condition is false
• \`console.dir(obj)\` — shows interactive object tree

**Browser DevTools — Sources Panel**

Set breakpoints without modifying code: click a line number in Sources. When execution reaches that line, it pauses and you can inspect variables, step through code, and evaluate expressions in the console.

• **Step over** (F10) — runs the current line, moves to next
• **Step into** (F11) — enters a function call
• **Step out** (Shift+F11) — exits the current function
• **Resume** (F8) — continue until next breakpoint
• **Conditional breakpoints** — right-click line number, set a condition
• **Logpoints** — log a value without pausing (right-click → "Add logpoint")

Debugger statement: add \`debugger;\` to your code to programmatically trigger a breakpoint (only when DevTools is open).`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// console methods
console.log("Basic log", { user: "Elvar" });
console.error("Something failed:", new Error("detail"));
console.warn("Deprecated API used");

console.table([
  { name: "Elvar", level: 12, xp: 1500 },
  { name: "Lyra",  level: 8,  xp: 900  },
]);

console.group("Player data");
console.log("Loading...");
console.log("Done");
console.groupEnd();

console.time("data-fetch");
const data = await fetchData();
console.timeEnd("data-fetch"); // "data-fetch: 124.5ms"

// debugger — pauses when DevTools is open
function buggyFunction(x) {
  debugger; // pauses here
  return x * 2;
}

// Reading stack traces
// TypeError: Cannot read properties of undefined (reading 'name')
//   at getPlayerName (player.js:42:18)  ← file:line:column
//   at renderCard   (ui.js:18:5)
//   at main         (app.js:7:3)
// Read bottom-up: main called renderCard called getPlayerName — error at line 42`,
      },
      {
        type: "text",
        content: `**ESLint and Prettier**

**ESLint** — static analysis tool that catches bugs and enforces code style rules. Configure with \`.eslintrc.json\` or \`eslint.config.js\`. Common rules: \`no-unused-vars\`, \`no-console\`, \`eqeqeq\` (enforce ===), \`prefer-const\`.

**Prettier** — opinionated code formatter. Removes all debate about formatting (indentation, quotes, semicolons, line length). Configure with \`.prettierrc\`. Run as a pre-commit hook with husky + lint-staged.

**npm Basics**

\`package.json\` — the project manifest: name, version, dependencies, scripts.

Key commands:
• \`npm install\` — installs all dependencies from package.json
• \`npm install package-name\` — installs and adds to dependencies
• \`npm install -D package-name\` — installs as devDependency (not bundled for production)
• \`npm run script-name\` — runs a script defined in "scripts"
• \`npm uninstall package-name\`

**Bundlers**

• **Vite** — fast dev server (native ESM) + Rollup-based build. The modern choice for frontend projects.
• **Webpack** — feature-rich, widely used but complex. Common in large enterprise projects.
• **Rollup** — optimal for libraries (produces clean output).
• **esbuild** — extremely fast (written in Go). Used internally by Vite.

**Jest Basics**

Jest is the most popular JavaScript test runner. \`test(name, fn)\` or \`it(name, fn)\` defines a test. \`expect(value).matcher()\` makes assertions. \`describe(name, fn)\` groups related tests.`,
      },
      {
        type: "code",
        lang: "javascript",
        code: `// Jest — unit tests

// player.js
export function createPlayer(name, level = 1) {
  if (!name) throw new Error("Name is required");
  return { name, level, xp: 0 };
}

export function gainXP(player, amount) {
  return { ...player, xp: player.xp + amount };
}

// player.test.js
import { createPlayer, gainXP } from "./player.js";

describe("createPlayer", () => {
  test("creates player with correct name and default level", () => {
    const player = createPlayer("Elvar");
    expect(player.name).toBe("Elvar");
    expect(player.level).toBe(1);
    expect(player.xp).toBe(0);
  });

  test("throws if name is empty", () => {
    expect(() => createPlayer("")).toThrow("Name is required");
  });

  test("accepts custom level", () => {
    const player = createPlayer("Lyra", 5);
    expect(player.level).toBe(5);
  });
});

describe("gainXP", () => {
  test("returns new player with increased xp", () => {
    const player  = createPlayer("Elvar");
    const updated = gainXP(player, 100);
    expect(updated.xp).toBe(100);
    expect(player.xp).toBe(0); // original not mutated
  });
});

// package.json scripts
// {
//   "scripts": {
//     "dev":   "vite",
//     "build": "vite build",
//     "test":  "jest --watch",
//     "lint":  "eslint src",
//     "format":"prettier --write src"
//   }
// }`,
      },
    ],
  },
];

// ─── Run ───────────────────────────────────────────────────────────────────────

async function main() {
  const book = await prisma.book.findUnique({
    where: { slug: "javascript" },
    include: { chapters: { orderBy: { order: "asc" } } },
  });

  if (!book) { console.error("JS book not found — slug 'javascript'"); process.exit(1); }

  console.log(`\nUpdating "${book.title}" — ${book.chapters.length} existing chapters...\n`);

  let updated = 0;
  for (const ch of book.chapters) {
    const data = existingChapters[ch.title];
    if (!data) { console.log(`  SKIP  "${ch.title}"`); continue; }

    await prisma.bookChapter.update({
      where: { id: ch.id },
      data: {
        title:   data.newTitle,
        order:   data.newOrder,
        topics:  data.topics,
        sections: data.sections as object[],
        content: data.sections.filter(s => s.type === "text").map(s => (s as { type: "text"; content: string }).content).join("\n\n"),
        example: data.sections.filter(s => s.type === "code").map(s => (s as { type: "code"; code: string }).code).join("\n\n---\n\n") || undefined,
      } as object,
    });

    console.log(`  ✓  Updated "${ch.title}" → "${data.newTitle}" (order ${data.newOrder})`);
    updated++;
  }

  const existingTitles = new Set(book.chapters.map(c => c.title));
  let created = 0;
  for (const ch of newChapters) {
    if (existingTitles.has(ch.title)) { console.log(`  SKIP  "${ch.title}" — exists`); continue; }

    await prisma.bookChapter.create({
      data: {
        bookId:  book.id,
        title:   ch.title,
        topics:  ch.topics,
        order:   ch.order,
        content: ch.sections.filter(s => s.type === "text").map(s => (s as { type: "text"; content: string }).content).join("\n\n"),
        example: ch.sections.filter(s => s.type === "code").map(s => (s as { type: "code"; code: string }).code).join("\n\n---\n\n") || undefined,
        sections: ch.sections as object[],
      } as object,
    });

    console.log(`  ✓  Created "${ch.title}" (order ${ch.order})`);
    created++;
  }

  console.log(`\nDone — ${updated} updated, ${created} created.\n`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
