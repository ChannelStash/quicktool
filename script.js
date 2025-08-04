const debtTableBody = document.querySelector('#debtTable tbody');
const addDebtBtn = document.getElementById('addDebt');
const calculateBtn = document.getElementById('calculate');
const resultsDiv = document.getElementById('results');

// Add debt row
addDebtBtn.onclick = () => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" class="name" /></td>
    <td><input type="number" class="balance" /></td>
    <td><input type="number" class="rate" /></td>
    <td><input type="number" class="min" /></td>
    <td><button onclick="this.parentElement.parentElement.remove()">X</button></td>
  `;
  debtTableBody.appendChild(row);
};

// On calculate
calculateBtn.onclick = () => {
  const rows = [...debtTableBody.querySelectorAll('tr')];
  const monthlyBudget = parseFloat(document.getElementById('monthlyBudget').value);
  if (isNaN(monthlyBudget) || monthlyBudget <= 0) return alert('Enter a valid monthly budget.');

  const debts = rows.map(row => ({
    name: row.querySelector('.name').value,
    balance: parseFloat(row.querySelector('.balance').value),
    rate: parseFloat(row.querySelector('.rate').value) / 100 / 12,
    min: parseFloat(row.querySelector('.min').value)
  })).filter(d => d.balance > 0 && d.min > 0);

  debts.sort((a, b) => a.balance - b.balance); // snowball: smallest balance first

  let month = 0;
  let totalInterest = 0;
  const output = [];

  while (debts.some(d => d.balance > 0)) {
    month++;
    let paymentLeft = monthlyBudget;
    let thisMonth = [];

    for (let i = 0; i < debts.length; i++) {
      if (debts[i].balance <= 0) continue;

      const interest = debts[i].balance * debts[i].rate;
      totalInterest += interest;
      debts[i].balance += interest;

      const payment = Math.min(debts[i].balance, debts[i].min, paymentLeft);
      debts[i].balance -= payment;
      paymentLeft -= payment;

      thisMonth.push(`${debts[i].name}: Paid $${payment.toFixed(2)}, Remaining $${debts[i].balance.toFixed(2)}`);
    }

    // apply leftover to next debt
    for (let i = 0; i < debts.length && paymentLeft > 0; i++) {
      if (debts[i].balance <= 0) continue;

      const extra = Math.min(paymentLeft, debts[i].balance);
      debts[i].balance -= extra;
      paymentLeft -= extra;

      thisMonth.push(`${debts[i].name}: Extra $${extra.toFixed(2)}, New Balance $${debts[i].balance.toFixed(2)}`);
    }

    output.push(`<strong>Month ${month}</strong><br>${thisMonth.join('<br>')}<br><br>`);
  }

  resultsDiv.innerHTML = `
    <p><strong>Months to payoff:</strong> ${month}</p>
    <p><strong>Total interest paid:</strong> $${totalInterest.toFixed(2)}</p>
    ${output.join('')}
  `;
};

window.onload = () => addDebtBtn.click();

