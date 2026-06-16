// Initialize profiles from localStorage
let profiles = JSON.parse(localStorage.getItem("profiles")) || {};
let currentProfileId = localStorage.getItem("currentProfileId") || null;

// Load profiles and display on page load
document.addEventListener("DOMContentLoaded", () => {
    loadProfiles();
    if (currentProfileId && profiles[currentProfileId]) {
        switchProfile(currentProfileId);
    } else if (Object.keys(profiles).length > 0) {
        switchProfile(Object.keys(profiles)[0]);
    }
});

// Create a new profile
function createProfile() {
    const profileName = document.getElementById("name").value.trim();
    
    if (!profileName) {
        alert("Please enter a profile name");
        return;
    }

    if (Object.values(profiles).some(p => p.name === profileName)) {
        alert("Profile with this name already exists");
        return;
    }

    const profileId = Date.now().toString();
    profiles[profileId] = {
        name: profileName,
        transactions: []
    };

    localStorage.setItem("profiles", JSON.stringify(profiles));
    currentProfileId = profileId;
    localStorage.setItem("currentProfileId", currentProfileId);
    
    document.getElementById("name").value = "";
    loadProfiles();
    switchProfile(profileId);
}

// Switch to a different profile
function switchProfile(profileId) {
    if (!profiles[profileId]) return;
    
    currentProfileId = profileId;
    localStorage.setItem("currentProfileId", currentProfileId);
    
    loadProfiles();
    updateUI();
}

// Delete current profile
function deleteProfile() {
    if (!currentProfileId || !profiles[currentProfileId]) return;
    
    if (!confirm(`Delete profile "${profiles[currentProfileId].name}"? This action cannot be undone.`)) {
        return;
    }
    
    delete profiles[currentProfileId];
    localStorage.setItem("profiles", JSON.stringify(profiles));
    
    const remainingProfiles = Object.keys(profiles);
    if (remainingProfiles.length > 0) {
        currentProfileId = remainingProfiles[0];
    } else {
        currentProfileId = null;
    }
    
    localStorage.setItem("currentProfileId", currentProfileId || "");
    loadProfiles();
    
    if (currentProfileId) {
        switchProfile(currentProfileId);
    } else {
        updateUI();
    }
}

// Load and display all profiles
function loadProfiles() {
    const profilesList = document.getElementById("profilesList");
    const currentProfileDiv = document.getElementById("currentProfile");
    
    profilesList.innerHTML = "";
    
    if (Object.keys(profiles).length === 0) {
        profilesList.innerHTML = "<p style='color: rgba(255,255,255,0.6); text-align: center;'>No profiles yet. Create one to get started!</p>";
        currentProfileDiv.style.display = "none";
        return;
    }
    
    Object.entries(profiles).forEach(([profileId, profile]) => {
        const btn = document.createElement("button");
        btn.className = `profile-btn ${profileId === currentProfileId ? 'active' : ''}`;
        btn.textContent = `👤 ${profile.name}`;
        btn.onclick = () => switchProfile(profileId);
        profilesList.appendChild(btn);
    });
    
    if (currentProfileId && profiles[currentProfileId]) {
        currentProfileDiv.style.display = "flex";
        document.getElementById("profileNameDisplay").textContent = `📊 Currently viewing: ${profiles[currentProfileId].name}`;
    } else {
        currentProfileDiv.style.display = "none";
    }
}

// Get current transactions
function getCurrentTransactions() {
    if (!currentProfileId || !profiles[currentProfileId]) return [];
    return profiles[currentProfileId].transactions || [];
}

// Save current transactions
function saveCurrentTransactions(transactions) {
    if (!currentProfileId || !profiles[currentProfileId]) return;
    profiles[currentProfileId].transactions = transactions;
    localStorage.setItem("profiles", JSON.stringify(profiles));
}

// Handle form submission
document.getElementById("transactionForm").addEventListener("submit", (e) => {
    e.preventDefault();

    if (!currentProfileId) {
        alert("Please create a profile first");
        return;
    }

    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;

    if (!type) {
        alert("Please select a transaction type");
        return;
    }

    const transaction = {
        id: Date.now(),
        description,
        amount,
        type,
        date: new Date().toLocaleDateString()
    };

    const transactions = getCurrentTransactions();
    transactions.unshift(transaction);
    saveCurrentTransactions(transactions);

    document.getElementById("transactionForm").reset();
    updateUI();
});

// Update all UI elements
function updateUI() {
    displayTransactions();
    updateTotals();
}

// Display all transactions
function displayTransactions() {
    const transactionList = document.getElementById("transactionList");
    const transactions = getCurrentTransactions();
    
    transactionList.innerHTML = "";

    if (transactions.length === 0) {
        transactionList.innerHTML = "<li style='text-align: center; color: #9ca3af; padding: 40px 20px;'>No transactions yet. Add one to get started!</li>";
        return;
    }

    transactions.forEach((transaction) => {
        const li = document.createElement("li");
        li.className = `transaction ${transaction.type}-item`;

        const symbol = transaction.type === "income" ? "+" : "-";
        const color = transaction.type === "income" ? "green" : "red";

        li.innerHTML = `
            <div>
                <strong>${transaction.description}</strong>
                <p style="font-size: 0.9em; color: #666;">
                    ${transaction.date}
                </p>
            </div>
            <div style="display: flex; gap: 15px; align-items: center;">
                <span style="color: ${color}; font-weight: bold; font-size: 1.1em;">
                    ${symbol}₹${transaction.amount}
                </span>
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                    Delete
                </button>
            </div>
        `;

        transactionList.appendChild(li);
    });
}

// Update balance, income, and expense totals
function updateTotals() {
    let totalIncome = 0;
    let totalExpense = 0;

    const transactions = getCurrentTransactions();
    transactions.forEach((transaction) => {
        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });

    const totalBalance = totalIncome - totalExpense;

    document.getElementById("balance").textContent = `₹${totalBalance.toFixed(2)}`;
    document.getElementById("income").textContent = `₹${totalIncome.toFixed(2)}`;
    document.getElementById("expense").textContent = `₹${totalExpense.toFixed(2)}`;
}

// Delete transaction
function deleteTransaction(id) {
    const transactions = getCurrentTransactions();
    const filtered = transactions.filter((transaction) => transaction.id !== id);
    saveCurrentTransactions(filtered);
    updateUI();
}

