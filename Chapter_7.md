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