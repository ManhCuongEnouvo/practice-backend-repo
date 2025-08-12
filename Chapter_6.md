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

#### 6.4. Define specific methods and return types for the queries you want to make
 Instead of writing a method that returns the entire internal state of an object, define specific methods that return only the information you need, and with explicit return types.
This helps:
- Reduce the risk of internal encapsulation.
- Keep the class less dependent on its internal structure.
- Makes the code easier to read and maintain.

```TS
class BankAccount {
  private balance: number;

  constructor(balance: number) {
    this.balance = balance;
  }

  // ❌ Expose toàn bộ state
  public getState(): { balance: number } {
    return { balance: this.balance };
  }
}

// Client code
const account = new BankAccount(1000);
console.log(account.getState().balance); // Phụ thuộc vào cấu trúc trả về
```

```ts
class BankAccount {
  private balance: number;

  constructor(balance: number) {
    this.balance = balance;
  }

  // ✅ Chỉ định nghĩa method query cần thiết
  public getBalance(): number {
    return this.balance;
  }
}

// Client code
const account = new BankAccount(1000);
console.log(account.getBalance()); // 1000
```
- When you don't want client code to depend on internal data structures.
- When you want to optimize the ability to change without breaking external code.
- When you want a clearer class API: return only what is needed.

#### 6.5. Define an abstraction for queries that cross system boundaries
Define an abstraction for queries that cross system boundaries" means:
- When you need to get data from another system (API, database, external service, etc.), you should not let the code in the application call directly to that system but define an abstraction (class or interface) as an intermediary.
This helps:
- Easier to replace or change the data source (switch from MySQL to PostgreSQL, from REST API to gRPC...).
- Easier to test (mock/stub interface instead of having to connect for real).
- Hide implementation details (client doesn't know how the API calls, only knows the result).
- Reduce direct dependency on external libraries or SDKs.
```TS
// Abstraction
interface UserQueryService {
  getUserById(id: string): Promise<User>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

class ApiUserQueryService implements UserQueryService {
  constructor(private apiBaseUrl: string) {}

  async getUserById(id: string): Promise<User> {
    const response = await fetch(`${this.apiBaseUrl}/users/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user with id ${id}`);
    }
    return response.json();
  }
}

class FakeUserQueryService implements UserQueryService {
  async getUserById(id: string): Promise<User> {
    return { id, name: "Test User", email: "test@example.com" };
  }
}

async function showUserProfile(userQuery: UserQueryService, id: string) {
  const user = await userQuery.getUserById(id);
  console.log(`Name: ${user.name}, Email: ${user.email}`);
}

// Production
const prodService = new ApiUserQueryService("https://api.example.com");
showUserProfile(prodService, "123");

// Test
const testService = new FakeUserQueryService();
showUserProfile(testService, "123");

#### 6.6. Use stubs for test doubles with query methods
- "Use stubs for test doubles with query methods" means that when you write a unit test for a class or module, if that class calls a query method to an external component (database, API, file system, ...) then you should not use the real component but create a stub (test double) instead.
- Stub here is a mock version of the interface or class that you are querying, but it returns pre-programmed fixed data, instead of actually querying external data.
Why should you use Stub for query methods?
- Speed - No need to call real DB or API → test runs faster.
- Stability - Not dependent on external data status → test results are always consistent.
- Test isolation - Test the logic of the code without being affected by errors or changes from the external system.
- Easy control of returned data – You can freely create data scenarios to test special situations.

```TS
interface UserQuery {
  getUserById(id: string): Promise<User>;
}

type User = {
  id: string;
  name: string;
  age: number;
};

class UserService {
  constructor(private userQuery: UserQuery) {}

  async isAdult(userId: string): Promise<boolean> {
    const user = await this.userQuery.getUserById(userId);
    return user.age >= 18;
  }
}

class UserQueryStub implements UserQuery {
  async getUserById(id: string): Promise<User> {
    // Trả về dữ liệu cố định phục vụ test
    return { id, name: "Test User", age: 20 };
  }
}

(async () => {
  const userQueryStub = new UserQueryStub();
  const service = new UserService(userQueryStub);

  console.log(await service.isAdult("123")); // true
})();
```