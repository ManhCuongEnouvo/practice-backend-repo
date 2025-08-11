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