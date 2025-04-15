// DOM Elements
const modeToggle = document.getElementById('modeToggle');
const accountsTable = document.getElementById('accountsTable').querySelector('tbody');

// Dark/Light Mode Toggle
modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        modeToggle.textContent = '☀️ Light Mode';
    } else {
        modeToggle.textContent = '🌙 Dark Mode';
    }
});

// Load accounts
function loadAccounts() {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    
    accountsTable.innerHTML = '';
    
    accounts.forEach(account => {
        if (account.isAdmin) return; // Skip admin account
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${account.name}</td>
            <td>${account.email}</td>
            <td>$${account.balance.toFixed(2)}</td>
            <td>
                <button onclick="viewTransactions('${account.email}')">View</button>
                <button onclick="deleteAccount('${account.email}')" class="delete-btn">Delete</button>
            </td>
        `;
        
        accountsTable.appendChild(row);
    });
}

// View transactions
function viewTransactions(email) {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    const account = accounts.find(acc => acc.email === email);
    
    if (!account) return;
    
    let transactionsHTML = '<h3>Transactions</h3><ul>';
    account.transactions.forEach(trans => {
        transactionsHTML += `
            <li>
                <strong>${trans.type.toUpperCase()}</strong>
                <span class="${trans.type}">${trans.type === 'deposit' ? '+' : '-'}$${trans.amount.toFixed(2)}</span>
                <small>${new Date(trans.date).toLocaleString()}</small>
            </li>
        `;
    });
    transactionsHTML += '</ul>';
    
    alert(transactionsHTML);
}

// Delete account
function deleteAccount(email) {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    accounts = accounts.filter(acc => acc.email !== email);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    loadAccounts();
}

// Initialize
loadAccounts();