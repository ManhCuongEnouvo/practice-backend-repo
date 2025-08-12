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