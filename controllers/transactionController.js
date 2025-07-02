const Transaction = require("../models/Transaction");

exports.addTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      user: req.user.id,
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id }).sort({
    date: -1,
  });
  res.json(transactions);
};

exports.getTransaction = async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!transaction) return res.status(404).json({ message: "Not found" });
  res.json(transaction);
};

exports.updateTransaction = async (req, res) => {
  const updated = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true },
  );
  res.json(updated);
};

exports.deleteTransaction = async (req, res) => {
  await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ message: "Deleted" });
};

// Total Balance Summary
exports.getBalanceSummary = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id });

  const totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  res.json({
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  });
};

// Expenses Grouped by Category
exports.getCategorySummary = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id });

  const categorySummary = {};

  transactions.forEach((txn) => {
    const key = txn.category;
    if (!categorySummary[key]) {
      categorySummary[key] = { income: 0, expense: 0 };
    }
    if (txn.type === "Income") {
      categorySummary[key].income += txn.amount;
    } else {
      categorySummary[key].expense += txn.amount;
    }
  });

  res.json(categorySummary);
};

// Monthly Income vs Expense
exports.getMonthlySummary = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id });

  const summary = {};

  transactions.forEach((txn) => {
    const month = txn.date.toISOString().slice(0, 7); // e.g. "2025-07"

    if (!summary[month]) {
      summary[month] = { income: 0, expense: 0 };
    }

    if (txn.type === "Income") {
      summary[month].income += txn.amount;
    } else {
      summary[month].expense += txn.amount;
    }
  });

  const result = Object.entries(summary).map(([month, data]) => ({
    month,
    income: data.income,
    expense: data.expense,
    balance: data.income - data.expense,
  }));

  res.json(result);
};
