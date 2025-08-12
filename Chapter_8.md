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
