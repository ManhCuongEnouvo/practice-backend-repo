A template for implementing methods
- [scope]: public / private / protected (if OOP).
- [preconditions checks]: Verify that the input is valid.
- [failure scenarios]: Handle when unable to continue (throw error or return special value).
- [happy path]: Main code.
- [postcondition checks]: Check the result before returning.
- return: Return value or void.

##### Precondition checks
- **Precondition checks**: kiểm tra điều kiện trước khi thực thi logic chính.
- Basic template when writing methods in TS\
```TS
class EmailService {
  // [scope] public
  public sendConfirmationEmail(emailAddress: string): void {
    // [precondition checks]
    if (!this.isValidEmail(emailAddress)) {
      throw new Error(`Invalid email address: ${emailAddress}`);
    }

    if (!this.canSendEmail()) {
      throw new Error("Email service is currently unavailable.");
    }

    // [happy path]
    console.log(`Sending confirmation email to ${emailAddress}`);

    console.log("Email sent successfully.");
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private canSendEmail(): boolean {
    return true;
  }
}

const service = new EmailService();
service.sendConfirmationEmail("test@example.com");

```

- Use wrapper types to reduce precondition checks
```ts
class EmailAddress {
  private value: string;

  constructor(email: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error(`Invalid email address: ${email}`);
    }
    this.value = email;
  }

  toString(): string {
    return this.value;
  }
}

class EmailService2 {
  public sendConfirmationEmail(email: EmailAddress): void {
    console.log(`Sending confirmation email to ${email.toString()}`);
  }
}

const validEmail = new EmailAddress("user@example.com");
const service2 = new EmailService2();
service2.sendConfirmationEmail(validEmail);
```

#### Failure scenarios
- Failure scenarios are situations where a method or function can still fail even if the input parameters have passed the precondition checks.
In other words:
- Precondition checks → filter out errors due to invalid input data (e.g., incorrect email format, ID ≤ 0).
- Failure scenarios → occur when errors occur during execution, due to external factors or situations that cannot be completely controlled, and are only detected when the program is run
```ts
class InvalidArgumentError extends Error {}
class RuntimeError extends Error {}

// Replace primitive with object
class EmailAddress {
  private email: string;

  constructor(email: string) {
    if (!this.isValidEmail(email)) {
      throw new InvalidArgumentError(`Invalid email address: ${email}`);
    }
    this.email = email;
  }

  get value(): string {
    return this.email;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

class Database {
  private data: Record<number, any> = {
    1: { id: 1, name: "Alice" },
    2: { id: 2, name: "Bob" }
  };

  find(id: number): any | null {
    return this.data[id] || null;
  }
}

class UserService {
  constructor(private db: Database) {}
  getRowById(id: number): any {
    if (id <= 0) {
      throw new InvalidArgumentError("ID must be greater than 0");
    }

    const record = this.db.find(id);
    if (record === null) {
      throw new RuntimeError(`Could not find record with ID "${id}"`);
    }

    return record;
  }

  sendConfirmationEmail(email: EmailAddress) {
    const success = Math.random() > 0.3; 
    if (!success) {
      throw new RuntimeError(`Failed to send email to ${email.value}`);
    }
    console.log(`Email sent to ${email.value}`);
  }
}

try {
  const db = new Database();
  const service = new UserService(db);

  const row = service.getRowById(1);
  console.log("Found record:", row);

  const email = new EmailAddress("test@example.com");
  service.sendConfirmationEmail(email);

} catch (err) {
  if (err instanceof InvalidArgumentError) {
    console.error("Invalid argument:", err.message);
  } else if (err instanceof RuntimeError) {
    console.error("Runtime error:", err.message);
  } else {
    console.error("Unknown error:", err);
  }
}

```

#### Happy path
- happy path means the code that handles the case where everything goes smoothly, without errors or unusual situations.
```TS
function withdrawMoney(balance: number, amount: number): number {
  // 1. Precondition checks
  if (amount <= 0) {
    throw new Error("Số tiền rút phải lớn hơn 0");
  }
  if (amount > balance) {
    throw new Error("Số dư không đủ");
  }

  if (Math.random() < 0.05) {
    throw new Error("Lỗi hệ thống, vui lòng thử lại sau");
  }

  const newBalance = balance - amount;
  console.log(`Rút thành công ${amount} VND`);

  if (newBalance < 0) {
    throw new Error("Số dư âm — điều này không được phép");
  }

  return newBalance;
}

console.log(withdrawMoney(1000000, 500000));
```

#### Postcondition checks
- "Postcondition checks" means checks after the condition – that is, you verify the final result of the method before it returns (or before the method finishes), to make sure it actually does what it promises.
When to use postcondition check?
- Legacy code: Lots of implicit type casting, no strict checking → need to add postcondition to avoid error propagation.
- Do not use strong type or when processing complex data → be careful of unexpected results.
- Debug or refactor: Helps detect bugs early when changing logic
```ts
function calculateDiscount(price: number, discountRate: number): number {
    const finalPrice = price - price * discountRate;
    if (finalPrice < 0) {
        throw new Error("Final price cannot be negative");
    }

    return finalPrice;
}

console.log(calculateDiscount(100, 0.2)); // ✅ 80
console.log(calculateDiscount(100, 2));   // ❌ Error: Final price cannot be negative

```

#### Return Value
- Only “query” methods (which retrieve data, do not change the system state) should return a value.
Return early:
- If you know for sure what the return value will be → return immediately.
- Avoid keeping the value in a variable and returning at the end of the method, because that makes the code long and difficult to read.
Similar to exceptions:
- If an error is detected → throw immediately.
- Do not continue to run unnecessary steps.
```TS
function findUserNameById(id: number): string | null {
    let userName: string | null = null;

    if (id > 0) {
        const user = database.find(u => u.id === id);
        if (user) {
            userName = user.name;
        }
    }

    return userName;
}
```

```ts
function findUserNameById(id: number): string | null {
    if (id <= 0) return null;

    const user = database.find(u => u.id === id);
    if (!user) return null;

    return user.name;
}
```