export class Transaction {
  constructor(type, category, amount, description) {
    this.type = type;
    this.category = category;
    this.amount = amount;
    this.description = description;
  }
}

export class FinanceManager {
  constructor() {
    this.transactions = [];
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
  }

  getTotal(type) {
    return this.transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }

  getBalance() {
    return this.getTotal('income') - this.getTotal('outcome');
  }
}