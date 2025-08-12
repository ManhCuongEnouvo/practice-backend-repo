#### 8.1. Separate write models from read models
- Data protection: Client only has permissions appropriate to its role.
- Clearer code: Who writes, who reads is separate.
- Easy to control business logic: No fear of someone making a mistake
```TS
// Read model: chỉ cho phép đọc dữ liệu
class PurchaseOrderReader {
  constructor(
    private productId: number,
    private quantity: number,
    private receivedDate?: Date
  ) {}

  getReceivedDate(): Date | undefined {
    return this.receivedDate;
  }

  getQuantity(): number {
    return this.quantity;
  }
}

// Write model: cho phép thay đổi dữ liệu
class PurchaseOrderWriter {
  constructor(private order: PurchaseOrderReader) {}

  receiveProduct(date: Date) {
    // Thay đổi trạng thái qua đối tượng đọc (có thể clone hoặc lưu trong DB)
    (this.order as any).receivedDate = date; 
  }
}
```
#### 8.2. Create read models that are specific for their use cases
Principle: “Create a dedicated read model for each use case” — this helps:
- Reduce the risk of the client accidentally (or intentionally) changing data.
- Make the code clearer: each model only serves its purpose.
- Increase the security and stability of the system.
```TS
// READ MODEL: Chỉ chứa dữ liệu cần cho báo cáo tồn kho
class PurchaseOrderForStockReport {
  constructor(
    public readonly productId: number,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly receivedDate?: Date
  ) {}
}

// WRITE MODEL: Chỉ để xử lý thay đổi dữ liệu đơn hàng
class PurchaseOrder {
  constructor(
    private productId: number,
    private productName: string,
    private quantity: number,
    private receivedDate?: Date
  ) {}

  receiveProduct(date: Date) {
    this.receivedDate = date;
  }
}

// REPOSITORY: Tách luồng đọc và ghi
class PurchaseOrderRepository {
  // Trả về WRITE MODEL
  getById(id: number): PurchaseOrder {
    // Lấy từ DB và tạo write model
    return new PurchaseOrder(1, "Bàn phím cơ", 100);
  }

  // Trả về READ MODEL cho báo cáo tồn kho
  getForStockReport(): PurchaseOrderForStockReport[] {
    // Truy vấn trực tiếp dữ liệu đã đủ cho báo cáo
    return [
      new PurchaseOrderForStockReport(1, "Bàn phím cơ", 100, new Date()),
      new PurchaseOrderForStockReport(2, "Chuột gaming", 50)
    ];
  }
}

// CONTROLLER sử dụng đúng model theo mục đích
const repo = new PurchaseOrderRepository();

// Luồng đọc: chỉ lấy dữ liệu cho báo cáo (client không thể ghi)
const stockReport = repo.getForStockReport();
console.log(stockReport);

// Luồng ghi: lấy write model để chỉnh sửa
const order = repo.getById(1);
order.receiveProduct(new Date());

```
#### 8.3. Create read models directly from their data source
Instead of loading a write model (which can change data) from the DB and then converting it to a read model, we should create a read model directly from the data source (e.g. SQL query or API) to:
- Avoid client access to the write model.
- Reduce overhead because there is no need to load all unnecessary data.
- Optimize performance because only query the correct fields to read.
```ts
/// BAD
// Controller
const purchaseOrders = purchaseOrderRepository.getAll(); // Lấy write model
const reportItems = purchaseOrders.map(po => po.forStockReport()); // Convert sang read model
```

```TS
// Read model: chỉ chứa dữ liệu cần cho báo cáo tồn kho
class PurchaseOrderForStockReport {
  constructor(
    public productId: number,
    public quantity: number,
    public receivedDate?: Date
  ) {}
}

// Repository chỉ trả về read model, không đụng tới write model
class PurchaseOrderReadRepository {
  constructor(private db: any) {}

  async getForStockReport(): Promise<PurchaseOrderForStockReport[]> {
    const rows = await this.db.query(`
      SELECT product_id, quantity, received_date
      FROM purchase_orders
      WHERE received_date IS NOT NULL
    `);
    return rows.map(
      (row: any) =>
        new PurchaseOrderForStockReport(row.product_id, row.quantity, row.received_date)
    );
  }
}

// Controller: chỉ nhận read model
const readRepo = new PurchaseOrderReadRepository(db);
const stockReportItems = await readRepo.getForStockReport();
```
#### 8.4. Build read models from domain events
Instead of querying data directly from the current database, we build a read model by listening to domain events (events from the system) and updating a table/collection specifically for reading.
This method is often used in Event Sourcing or CQRS:
- Write side: Save events (domain events) when there are changes.
- Read side: Listen to those events to build or update the read model, helping query faster.
```TS
// DOMAIN EVENT
// Sự kiện khi đơn hàng được tạo
class OrderCreated {
  constructor(
    public orderId: string,
    public customerName: string,
    public totalAmount: number
  ) {}
}

// Sự kiện khi đơn hàng được giao
class OrderShipped {
  constructor(public orderId: string, public shippedDate: Date) {}
}
```

```ts
// Event bus (to publish & subscribe events)
type EventHandler<T> = (event: T) => void;

class EventBus {
  private handlers: { [eventName: string]: EventHandler<any>[] } = {};

  subscribe<T>(eventName: string, handler: EventHandler<T>) {
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName].push(handler);
  }

  publish<T>(event: T) {
    const eventName = event.constructor.name;
    this.handlers[eventName]?.forEach(handler => handler(event));
  }
}

const eventBus = new EventBus();
```

```TS
// READ MODEL
// Chỉ lưu thông tin cần thiết cho việc hiển thị
interface OrderSummary {
  orderId: string;
  customerName: string;
  totalAmount: number;
  shippedDate?: Date;
}

const orderSummaries: OrderSummary[] = [];

// Lắng nghe sự kiện để cập nhật read model
eventBus.subscribe<OrderCreated>("OrderCreated", (event) => {
  orderSummaries.push({
    orderId: event.orderId,
    customerName: event.customerName,
    totalAmount: event.totalAmount
  });
});

eventBus.subscribe<OrderShipped>("OrderShipped", (event) => {
  const order = orderSummaries.find(o => o.orderId === event.orderId);
  if (order) {
    order.shippedDate = event.shippedDate;
  }
});
```

```ts
// Domain code tạo đơn hàng
function createOrder(orderId: string, customer: string, amount: number) {
  const event = new OrderCreated(orderId, customer, amount);
  eventBus.publish(event);
}

function shipOrder(orderId: string) {
  const event = new OrderShipped(orderId, new Date());
  eventBus.publish(event);
}

// Chạy thử
createOrder("ORD001", "Nguyễn Văn A", 500000);
shipOrder("ORD001");

console.log(orderSummaries);
/*
[
  {
    orderId: 'ORD001',
    customerName: 'Nguyễn Văn A',
    totalAmount: 500000,
    shippedDate: 2025-08-11T08:23:00.000Z
  }
]
*/
```