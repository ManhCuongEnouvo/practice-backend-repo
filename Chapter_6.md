#### 6.1.Use query methods for information retrieval
Command methods: change state (have side effects), return void (or ignore return value).
Query methods: only read information, do not change anything, and return value.
1. Principle
- Command → "do" (do something) → can change internal data, do not return information (or only return execution results, not domain data).
- Query → "get something" → only read data, do not change anything.
- Do not combine both in one method (avoid "change and return" because it is easy to confuse).

```TS
class Counter {
  private count = 0;

  // Command method
  increment(): void {
    this.count++;
  }

  // Query method
  currentCount(): number {
    return this.count;
  }
}


const counter = new Counter();
counter.increment(); 
console.log(counter.currentCount());

```
#### 6.2. Query methods should have single-type return values
- Query methods should always return a single-type return value — don't mix different types, and avoid returning null if possible.

```TS
function isValid(email: string): boolean | string {
  if (!email.includes('@')) {
    return 'Invalid email address';
  }
  return true;
}const result = isValid('abc');
if (typeof result === 'string') {
  console.error(result);
} else {
  console.log('Valid!');
}
//bad
```

```TS
class InvalidEmailError extends Error {
  constructor(email: string) {
    super(`Invalid email address: ${email}`);
    this.name = 'InvalidEmailError';
  }
}

function validateEmail(email: string): true {
  if (!email.includes('@')) {
    throw new InvalidEmailError(email);
  }
  return true;
}

try {
  validateEmail('abc');
  console.log('Valid!');
} catch (e) {
  if (e instanceof InvalidEmailError) {
    console.error(e.message);
  }
}
```

#### 6.3. Avoid query methods that expose internal state
- When you write OOP code, you should not create getter methods or query methods that return the internal state of an object in a way that the outside world can change or directly depend on.

```TS
class ShoppingCart {
  private items: string[] = [];

  getItems(): string[] {
    // Trả về mảng thật → ai cũng có thể sửa nội bộ
    return this.items;
  }

  addItem(item: string) {
    this.items.push(item);
  }
}

const cart = new ShoppingCart();
cart.addItem("Apple");

const externalItems = cart.getItems();
externalItems.push("Banana"); // Sửa trực tiếp trạng thái nội bộ ❌
console.log(cart.getItems()); // ["Apple", "Banana"] → object bị thay đổi ngoài ý muốn
```

```ts
class ShoppingCart {
  private items: string[] = [];

  addItem(item: string) {
    this.items.push(item);
  }

  getItems(): ReadonlyArray<string> {
    // Trả về bản chỉ đọc
    return this.items;
  }

  getTotalItems(): number {
    return this.items.length;
  }
}

const cart = new ShoppingCart();
cart.addItem("Apple");

const items = cart.getItems();
// items.push("Banana"); ❌ Lỗi compile-time (readonly)
console.log(items); // ["Apple"]