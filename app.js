// Initialization
const categoryManager = new CategoryManager();
const transactionManager = new TransactionManager();
const dashboardManager = new DashboardManager();

// State
let currentDashboardPeriod = 'all'; // all, month, week, day
let currentFilterType = 'all';
let currentFilterCategory = 'all';
let editingTxId = null;

// DOM Elements
const eTotalBalance = document.getElementById('total-balance');
const eTotalIncome = document.getElementById('total-income');
const eTotalExpense = document.getElementById('total-expense');
const eTxList = document.getElementById('transactions-list');
const eFilterType = document.getElementById('filter-type');
const eFilterCategory = document.getElementById('filter-category');

const eModal = document.getElementById('transaction-modal');
const eForm = document.getElementById('transaction-form');
const eTxAmount = document.getElementById('tx-amount');
const eTxCategory = document.getElementById('tx-category');
const eTxDate = document.getElementById('tx-date');
const eTxDesc = document.getElementById('tx-desc');

// Utility: Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(amount);
}

// Utility: Notifications (Toast)
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'circle-exclamation'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOutLeft 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Render Select Categories
function renderCategoryOptions(selectElement, typeConstraint = 'all') {
    selectElement.innerHTML = '';
    
    if (selectElement.id === 'filter-category') {
        selectElement.innerHTML = '<option value="all">Todas las categorías</option>';
    }

    const categories = categoryManager.getByType(typeConstraint);
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        selectElement.appendChild(option);
    });
}

// Render Dashboard
function updateDashboard() {
    // Determine filtered transactions for dashboard
    const txs = transactionManager.filter({ period: currentDashboardPeriod });
    
    // Totals
    const totals = dashboardManager.calculateTotals(txs);
    eTotalBalance.textContent = formatCurrency(totals.balance);
    eTotalIncome.textContent = formatCurrency(totals.income);
    eTotalExpense.textContent = formatCurrency(totals.expense);

    // Color balance
    eTotalBalance.className = 'amount ' + (totals.balance >= 0 ? 'pos' : 'neg');

    // Charts
    dashboardManager.renderCharts(txs, categoryManager.getAll());
}

// Render Transaction List
function renderTransactions() {
    const txs = transactionManager.filter({
        type: currentFilterType,
        categoryId: currentFilterCategory
    });

    eTxList.innerHTML = '';

    if (txs.length === 0) {
        eTxList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-receipt"></i>
                <p>No hay transacciones registradas.</p>
            </div>
        `;
        return;
    }

    txs.forEach(tx => {
        const cat = categoryManager.getById(tx.categoryId);
        if (!cat) return; // safety check
        
        const isIncome = tx.type === 'income';
        const amountFormatted = (isIncome ? '+' : '-') + formatCurrency(tx.amount);
        
        const txEl = document.createElement('div');
        txEl.className = 'transaction-item';
        txEl.innerHTML = `
            <div class="tx-left">
                <div class="tx-icon" style="background-color: ${cat.color}">
                    <i class="${cat.icon}"></i>
                </div>
                <div class="tx-details">
                    <h4>${cat.name}</h4>
                    <div class="tx-meta">
                        <span><i class="fa-regular fa-calendar"></i> ${tx.date}</span>
                        ${tx.description ? `<span>• ${tx.description}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="tx-right">
                <div class="tx-amount ${isIncome ? 'pos' : 'neg'}">
                    ${amountFormatted}
                </div>
                <div class="tx-actions">
                    <button class="btn-action edit" data-id="${tx.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-action delete" data-id="${tx.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        eTxList.appendChild(txEl);
    });

    // Attach listeners to buttons
    document.querySelectorAll('.btn-action.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (confirm('¿Estás seguro de eliminar esta transacción?')) {
                transactionManager.delete(id);
                updateApp();
                showToast('Transacción eliminada correctly.');
            }
        });
    });

    document.querySelectorAll('.btn-action.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            openModalForEdit(id);
        });
    });
}

// App Update Cycle
function updateApp() {
    updateDashboard();
    renderTransactions();
}

// --- Event Listeners ---

// Dashboard Period Filters
document.querySelectorAll('.dashboard-filters .btn-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Update active class
        document.querySelectorAll('.dashboard-filters .btn-filter').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        currentDashboardPeriod = e.target.getAttribute('data-period');
        updateDashboard();
    });
});

// Transaction Filters
eFilterType.addEventListener('change', (e) => {
    currentFilterType = e.target.value;
    renderTransactions();
});
eFilterCategory.addEventListener('change', (e) => {
    currentFilterCategory = e.target.value;
    renderTransactions();
});

// Theme Toggle
const btnTheme = document.getElementById('btn-theme');
btnTheme.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    btnTheme.innerHTML = isDark ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    Storage.set('theme', newTheme);
    updateDashboard(); // Redraw charts with new colors
});

// Load Theme on Start
const savedTheme = Storage.get('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') {
        btnTheme.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
}

// Modal Logic
const btnAdd = document.getElementById('fab-add');
const btnCloseModal = document.getElementById('close-modal');
const btnCancelModal = document.getElementById('btn-cancel');

function openModal() {
    editingTxId = null;
    eForm.reset();
    document.getElementById('modal-title').textContent = 'Nueva Transacción';
    
    // Set default date to today
    eTxDate.valueAsDate = new Date();
    
    // Trigger radio change to update categories
    const expenseRadio = document.getElementById('type-expense');
    expenseRadio.checked = true;
    expenseRadio.dispatchEvent(new Event('change', { bubbles: true }));

    eModal.classList.add('active');
}

function openModalForEdit(id) {
    const tx = transactionManager.getAll().find(t => t.id === id);
    if (!tx) return;

    editingTxId = tx.id;
    document.getElementById('modal-title').textContent = 'Editar Transacción';
    
    // Set type
    const typeRadio = document.getElementById(`type-${tx.type}`);
    typeRadio.checked = true;
    typeRadio.dispatchEvent(new Event('change', { bubbles: true })); // triggers category update
    
    setTimeout(() => {
        eTxAmount.value = tx.amount;
        eTxCategory.value = tx.categoryId;
        eTxDate.value = tx.date;
        eTxDesc.value = tx.description || '';
    }, 50);

    eModal.classList.add('active');
}

function closeModal() {
    eModal.classList.remove('active');
}

btnAdd.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);
btnCancelModal.addEventListener('click', closeModal);

// Radio buttons change (Income vs Expense)
document.querySelectorAll('input[name="tx-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            renderCategoryOptions(eTxCategory, e.target.value);
        }
    });
});

// Form Submission
eForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = parseFloat(eTxAmount.value);
    const categoryId = eTxCategory.value;
    const date = eTxDate.value;
    const description = eTxDesc.value.trim();
    const type = document.querySelector('input[name="tx-type"]:checked').value;

    if (!amount || amount <= 0) {
        showToast('El monto debe ser mayor a 0', 'error');
        return;
    }
    if (!categoryId || !date) {
        showToast('Por favor completa los campos obligatorios', 'error');
        return;
    }

    const data = { type, amount, categoryId, date, description };

    if (editingTxId) {
        transactionManager.update(editingTxId, data);
        showToast('Transacción actualizada');
    } else {
        transactionManager.add(data);
        showToast('Transacción agregada');
    }

    closeModal();
    updateApp();
});

// New Category Prompt (Basic Implementation)
document.getElementById('btn-new-category').addEventListener('click', () => {
    const name = prompt('Nombre de la nueva categoría:');
    if (name && name.trim()) {
        const type = document.querySelector('input[name="tx-type"]:checked').value;
        const color = type === 'income' ? '#10ac84' : '#ff6b6b';
        const newCat = categoryManager.addCategory(name.trim(), type, 'fa-solid fa-tag', color);
        
        // Update both selects
        renderCategoryOptions(eTxCategory, type);
        renderCategoryOptions(eFilterCategory, 'all');
        
        eTxCategory.value = newCat.id;
        showToast('Categoría creada');
    }
});

// Export to CSV
document.getElementById('btn-export').addEventListener('click', () => {
    const txs = transactionManager.getAll();
    if (txs.length === 0) {
        showToast('No hay datos para exportar', 'error');
        return;
    }

    let csv = 'ID,Fecha,Tipo,Categoría,Monto,Descripción\n';
    txs.forEach(tx => {
        const cat = categoryManager.getById(tx.categoryId);
        const catName = cat ? cat.name : 'Unknown';
        const line = `${tx.id},${tx.date},${tx.type},"${catName}",${tx.amount},"${tx.description || ''}"\n`;
        csv += line;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `finanzas_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Datos exportados a CSV');
});

// Initialization Call
renderCategoryOptions(eFilterCategory, 'all');
updateApp();
