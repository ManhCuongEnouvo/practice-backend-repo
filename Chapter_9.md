#### 9.1. Introduce constructor arguments to make behavior configurable
- When creating a service, we pass all dependencies and configurations through the constructor.
- If we want to change how the service works, instead of writing if-else or modifying the code inside, we just need to change the value passed into the constructor.
- This makes the service easy to test, easy to extend, and does not require modifying the source code inside when we want to change the behavior.
```TS
// Logger interface
interface Logger {
  log(message: string): void;
}

// Logger ghi ra console
class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(`[Console] ${message}`);
  }
}

// Logger ghi ra file (mô phỏng)
class FileLogger implements Logger {
  log(message: string) {
    console.log(`[File] ${message} (đã ghi vào file)`);
  }
}

// Service nhận logger qua constructor
class PaymentService {
  constructor(private logger: Logger, private currency: string) {}

  processPayment(amount: number) {
    this.logger.log(`Processing payment: ${amount} ${this.currency}`);
    // Xử lý logic thanh toán...
    this.logger.log(`Payment completed`);
  }
}

// ----------------------
// Cấu hình service qua constructor
const payment1 = new PaymentService(new ConsoleLogger(), "USD");
payment1.processPayment(100);

// Dùng cấu hình khác (thay đổi hành vi ghi log và đơn vị tiền)
const payment2 = new PaymentService(new FileLogger(), "EUR");
payment2.processPayment(200);
```