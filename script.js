// Enhanced Banking System with LocalStorage
let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
let currentUser = null;

// DOM Elements
const modeToggle = document.getElementById('modeToggle');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const dashboard = document.getElementById('dashboard');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        modeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        modeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Initialize accounts if empty
    if (accounts.length === 0) {
        createDefaultAdmin();
    }
});

// Dark/Light Mode Toggle
modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        modeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('darkMode', 'true');
    } else {
        modeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('darkMode', 'false');
    }
});

// Form Visibility
function showRegister() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
}

function showLogin() {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
}

// Create default admin account
function createDefaultAdmin() {
    const adminAccount = {
        id: generateId(),
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@bank.com',
        password: 'admin123',
        phone: '+1 (555) 123-4567',
        dob: '1980-01-01',
        address: '123 Admin St',
        city: 'Metropolis',
        state: 'NY',
        zip: '10001',
        balance: 0,
        accountType: 'admin',
        transactions: [],
        isAdmin: true,
        createdAt: new Date().toISOString(),
        lastLogin: null
    };
    
    accounts.push(adminAccount);
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

// Generate unique ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Registration
function register() {
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const phone = document.getElementById('regPhone').value.trim();
    const dob = document.getElementById('regDob').value;
    const address = document.getElementById('regAddress').value.trim();
    const city = document.getElementById('regCity').value.trim();
    const state = document.getElementById('regState').value.trim();
    const zip = document.getElementById('regZip').value.trim();
    const initialDeposit = parseFloat(document.getElementById('regInitialDeposit').value);
    const accountType = document.getElementById('regAccountType').value;
    const termsAccepted = document.getElementById('regTerms').checked;

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword || 
        !phone || !dob || !address || !city || !state || !zip || 
        isNaN(initialDeposit) || initialDeposit < 50 || !termsAccepted) {
        alert('Please fill all required fields correctly and accept terms');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Check if email exists
    if (accounts.some(acc => acc.email === email)) {
        alert('Email already registered');
        return;
    }

    // Create new account
    const newAccount = {
        id: generateId(),
        firstName,
        lastName,
        email,
        password, // Note: In real app, hash this password
        phone,
        dob,
        address,
        city,
        state,
        zip,
        balance: initialDeposit,
        accountType,
        transactions: [{
            id: generateId(),
            type: 'deposit',
            amount: initialDeposit,
            description: 'Initial deposit',
            date: new Date().toISOString(),
            balance: initialDeposit
        }],
        isAdmin: false,
        createdAt: new Date().toISOString(),
        lastLogin: null
    };

    accounts.push(newAccount);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    
    alert(`Account created successfully!\nYour account number is: ${newAccount.id}`);
    showLogin();
}

// Login
function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const account = accounts.find(acc => acc.email === email && acc.password === password);

    if (!account) {
        alert('Invalid credentials');
        return;
    }

    // Update last login
    account.lastLogin = new Date().toISOString();
    const index = accounts.findIndex(acc => acc.id === account.id);
    accounts[index] = account;
    localStorage.setItem('accounts', JSON.stringify(accounts));

    currentUser = account;

    if (account.isAdmin) {
        window.location.href = 'admin.html';
        return;
    }

    // Update UI
    updateDashboard();
    loginForm.style.display = 'none';
    dashboard.style.display = 'block';
}

// Update dashboard with user data
function updateDashboard() {
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('lastLogin').textContent = currentUser.lastLogin ? 
        new Date(currentUser.lastLogin).toLocaleString() : 'First login';
    
    // Update balance
    document.getElementById('accountBalance').textContent = `$${currentUser.balance.toFixed(2)}`;
    
    // Calculate total income and expenses
    const totalIncome = currentUser.transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = currentUser.transactions
        .filter(t => t.type === 'withdraw' || t.type === 'transfer')
        .reduce((sum, t) => sum + t.amount, 0);
    
    document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
    
    // Update transactions
    updateTransactionList();
}

// Update transaction list
function updateTransactionList(filter = 'all') {
    const transactionsList = document.getElementById('transactionsList');
    transactionsList.innerHTML = '';
    
    let transactionsToShow = currentUser.transactions;
    
    if (filter !== 'all') {
        transactionsToShow = currentUser.transactions.filter(t => t.type === filter);
    }
    
    // Sort by date (newest first)
    transactionsToShow.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    transactionsToShow.forEach(trans => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${new Date(trans.date).toLocaleDateString()}</td>
            <td>${trans.description || trans.type}</td>
            <td class="${trans.type}">${trans.type.charAt(0).toUpperCase() + trans.type.slice(1)}</td>
            <td class="${trans.type}">${trans.type === 'deposit' ? '+' : '-'}$${trans.amount.toFixed(2)}</td>
            <td>$${trans.balance.toFixed(2)}</td>
        `;
        
        transactionsList.appendChild(row);
    });
}

// Banking Operations
function deposit() {
    const amount = parseFloat(document.getElementById('depositAmount').value);
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    currentUser.balance += amount;
    
    const transaction = {
        id: generateId(),
        type: 'deposit',
        amount,
        description: 'Cash deposit',
        date: new Date().toISOString(),
        balance: currentUser.balance
    };
    
    currentUser.transactions.push(transaction);
    updateAccount();
    document.getElementById('depositAmount').value = '';
    
    alert(`Successfully deposited $${amount.toFixed(2)}`);
}

function withdraw() {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    if (amount > currentUser.balance) {
        alert('Insufficient funds');
        return;
    }

    currentUser.balance -= amount;
    
    const transaction = {
        id: generateId(),
        type: 'withdraw',
        amount,
        description: 'Cash withdrawal',
        date: new Date().toISOString(),
        balance: currentUser.balance
    };
    
    currentUser.transactions.push(transaction);
    updateAccount();
    document.getElementById('withdrawAmount').value = '';
    
    alert(`Successfully withdrew $${amount.toFixed(2)}`);
}

function transfer() {
    const email = document.getElementById('transferEmail').value.trim();
    const amount = parseFloat(document.getElementById('transferAmount').value);
    
    if (!email || isNaN(amount) || amount <= 0) {
        alert('Please enter valid recipient and amount');
        return;
    }
    
    if (amount > currentUser.balance) {
        alert('Insufficient funds');
        return;
    }
    
    const recipient = accounts.find(acc => acc.email === email);
    
    if (!recipient) {
        alert('Recipient account not found');
        return;
    }
    
    if (recipient.id === currentUser.id) {
        alert('Cannot transfer to yourself');
        return;
    }
    
    // Update sender
    currentUser.balance -= amount;
    
    const senderTransaction = {
        id: generateId(),
        type: 'transfer',
        amount,
        description: `Transfer to ${recipient.email}`,
        date: new Date().toISOString(),
        balance: currentUser.balance
    };
    
    currentUser.transactions.push(senderTransaction);
    
    // Update recipient
    recipient.balance += amount;
    
    const recipientTransaction = {
        id: generateId(),
        type: 'deposit',
        amount,
        description: `Transfer from ${currentUser.email}`,
        date: new Date().toISOString(),
        balance: recipient.balance
    };
    
    recipient.transactions.push(recipientTransaction);
    
    // Update both accounts in database
    const senderIndex = accounts.findIndex(acc => acc.id === currentUser.id);
    const recipientIndex = accounts.findIndex(acc => acc.id === recipient.id);
    
    accounts[senderIndex] = currentUser;
    accounts[recipientIndex] = recipient;
    
    localStorage.setItem('accounts', JSON.stringify(accounts));
    
    // Update UI
    updateDashboard();
    document.getElementById('transferEmail').value = '';
    document.getElementById('transferAmount').value = '';
    
    alert(`Successfully transferred $${amount.toFixed(2)} to ${recipient.email}`);
}

// Update account in database and UI
function updateAccount() {
    const index = accounts.findIndex(acc => acc.id === currentUser.id);
    accounts[index] = currentUser;
    localStorage.setItem('accounts', JSON.stringify(accounts));
    updateDashboard();
}

// Logout
function logout() {
    currentUser = null;
    dashboard.style.display = 'none';
    loginForm.style.display = 'block';
    
    // Reset forms
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

// Transaction filter
document.getElementById