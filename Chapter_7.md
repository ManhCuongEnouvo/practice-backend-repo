#### 7.1. Use command methods with a name in the imperative form
- **Query method:** get data, has return type, does not change state, can be called many times without affecting the system.
- **Command method:** perform action, usually void, name in imperative form to describe the task to be done.
- **Naming principle**: use verbs in imperative form.
```TS
class UserService {
  private users: string[] = ["Alice", "Bob"];

  // Query method – Lấy thông tin, không thay đổi trạng thái
  getUserList(): string[] {
    return [...this.users]; // trả về bản sao để tránh thay đổi ngoài ý muốn
  }

  // Command method – Thực hiện hành động, thay đổi trạng thái
  addUser(name: string): void {
    this.users.push(name);
  }

  // Command method – Tên ở dạng mệnh lệnh
  removeUser(name: string): void {
    this.users = this.users.filter(user => user !== name);
  }
}

// Sử dụng
const service = new UserService();

// Query – không làm thay đổi dữ liệu
console.log(service.getUserList()); // ["Alice", "Bob"]

// Command – thay đổi dữ liệu
service.addUser("Charlie");
service.removeUser("Alice");

console.log(service.getUserList()); // ["Bob", "Charlie"]
```
#### 7.2.Limit the scope of a command method, and use events to perform secondary tasks
Limit the scope of command methods and use events to handle secondary tasks.
Don’t do too much in one method.
Ask yourself 3 things:
- Does the method name contain “and” → meaning it does multiple things at once?
- Does all the code serve the main task?
- Can any part be run in the background?
```TS
class UserPasswordChanged {
  constructor(public userId: string) {}
}

type EventListener<T> = (event: T) => void;

class EventDispatcher {
  private listeners: Map<string, EventListener<any>[]> = new Map();

  on<T>(eventName: string, listener: EventListener<T>) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(listener);
  }

  dispatch<T>(eventName: string, event: T) {
    const eventListeners = this.listeners.get(eventName) || [];
    for (const listener of eventListeners) {
      listener(event);
    }
  }
}

class UserService {
  private users: Map<string, string> = new Map();

  constructor(private eventDispatcher: EventDispatcher) {}

  changeUserPassword(userId: string, newPassword: string): void {
    const hashedPassword = `hashed(${newPassword})`;
    this.users.set(userId, hashedPassword);
    console.log(`🔑 Password changed for user ${userId}`);

    this.eventDispatcher.dispatch(
      "UserPasswordChanged",
      new UserPasswordChanged(userId)
    );
  }
}

class SendEmail {
  whenUserPasswordChanged(event: UserPasswordChanged) {
    console.log(`📧 Sending password change email to user ${event.userId}`);
  }
}

const dispatcher = new EventDispatcher();
const sendEmail = new SendEmail();

dispatcher.on<UserPasswordChanged>(
  "UserPasswordChanged",
  (event) => sendEmail.whenUserPasswordChanged(event)
);

const userService = new UserService(dispatcher);
userService.changeUserPassword("user123", "newSecret");
```

#### 7.3.Make services immutable from the outside as well as on the inside
- Services must be immutable: both from the outside (configuration, dependencies) and from the inside (state affects behavior).
- Each time a method is called → the behavior must be the same if the input is the same.
- Avoid storing state in the service → move that logic elsewhere.
```TS
// BAD
class EmailAddress {
  constructor(public value: string) {}
}

class Mailer {
  private sentTo: EmailAddress[] = []; // Lưu state bên trong

  sendConfirmationEmail(recipient: EmailAddress): void {
    if (this.sentTo.some(r => r.value === recipient.value)) {
      console.log(`⏩ Already sent to ${recipient.value}`);
      return;
    }
    console.log(`📧 Sending email to ${recipient.value}`);
    this.sentTo.push(recipient); // Thay đổi state
  }
}

// Sử dụng
const mailer = new Mailer();
const recipient = new EmailAddress("info@example.com");

mailer.sendConfirmationEmail(recipient); // Gửi
mailer.sendConfirmationEmail(recipient); // Không gửi (do lưu state)
```

```ts
class Recipients {
  constructor(private emails: EmailAddress[]) {}

  deduplicated(): EmailAddress[] {
    const seen = new Set<string>();
    return this.emails.filter(email => {
      if (seen.has(email.value)) return false;
      seen.add(email.value);
      return true;
    });
  }
}

class StatelessMailer {
  sendConfirmationEmails(recipients: EmailAddress[]): void {
    for (const recipient of recipients) {
      console.log(`📧 Sending email to ${recipient.value}`);
    }
  }
}

// Sử dụng
const recipients = new Recipients([
  new EmailAddress("info@example.com"),
  new EmailAddress("info@example.com"), // trùng
  new EmailAddress("user@example.com")
]);

const mailer2 = new StatelessMailer();
mailer2.sendConfirmationEmails(recipients.deduplicated());
```
#### 7.4. When something goes wrong, throw an exception
- This rule applies to both fetching data and performing operations.
- When there is an error, do not return a special value (eg: null, false) to report the error → throw an exception.
You can use:
- InvalidArgumentException or LogicException for input condition errors (precondition check).
- RuntimeException for errors that cannot be known before running.
```TS
/// bad code
function withdraw(amount: number, balance: number): boolean {
  if (amount > balance) {
    return false; // báo lỗi bằng giá trị đặc biệt
  }
  console.log(`Rút ${amount} thành công`);
  return true;
}

const result = withdraw(200, 100);
if (!result) {
  console.error("Không đủ tiền!");
}
```

```TS
class InsufficientFundsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

function withdraw(amount: number, balance: number): void {
  if (amount > balance) {
    throw new InsufficientFundsError("Số dư không đủ để rút");
  }
  console.log(`Rút ${amount} thành công`);
}

// Sử dụng
try {
  withdraw(200, 100);
} catch (error) {
  if (error instanceof InsufficientFundsError) {
    console.error("Lỗi: " + error.message);
  } else {
    throw error; // ném tiếp nếu không phải lỗi dự kiến
  }
}
```