class DashboardManager {
    constructor() {
        this.categoryChart = null;
        this.trendChart = null;
    }

    calculateTotals(transactions) {
        let income = 0;
        let expense = 0;
        
        transactions.forEach(tx => {
            const amount = parseFloat(tx.amount);
            if (tx.type === 'income') {
                income += amount;
            } else {
                expense += amount;
            }
        });

        return {
            income,
            expense,
            balance: income - expense
        };
    }

    renderCharts(transactions, categories) {
        // Destroy existing charts to prevent canvas reuse issues
        if (this.categoryChart) this.categoryChart.destroy();
        if (this.trendChart) this.trendChart.destroy();

        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDarkMode ? '#f8f9fa' : '#2b2d42';
        const gridColor = isDarkMode ? '#343a40' : '#e9ecef';

        // --- Category Doughnut Chart (Expenses) ---
        const expenses = transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};
        
        expenses.forEach(tx => {
            if (!categoryTotals[tx.categoryId]) {
                categoryTotals[tx.categoryId] = 0;
            }
            categoryTotals[tx.categoryId] += parseFloat(tx.amount);
        });

        const catLabels = [];
        const catData = [];
        const catColors = [];

        Object.keys(categoryTotals).forEach(catId => {
            const cat = categories.find(c => c.id === catId);
            if (cat) {
                catLabels.push(cat.name);
                catData.push(categoryTotals[catId]);
                catColors.push(cat.color);
            }
        });

        const ctxPie = document.getElementById('categoryChart').getContext('2d');
        this.categoryChart = new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: catLabels.length > 0 ? catLabels : ['Sin Gastos'],
                datasets: [{
                    data: catData.length > 0 ? catData : [1],
                    backgroundColor: catColors.length > 0 ? catColors : [gridColor],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: textColor, padding: 20 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (catData.length === 0) return ' No hay datos';
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });

        // --- Trend Bar Chart ---
        const incomeTotal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expenseTotal = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const ctxBar = document.getElementById('trendChart').getContext('2d');
        this.trendChart = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Gastos'],
                datasets: [{
                    data: [incomeTotal, expenseTotal],
                    backgroundColor: [
                        isDarkMode ? 'rgba(46, 204, 113, 0.8)' : '#2ecc71',
                        isDarkMode ? 'rgba(231, 76, 60, 0.8)' : '#e74c3c'
                    ],
                    borderRadius: 6,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return '$' + value;
                            }
                        },
                        grid: { color: gridColor }
                    },
                    x: {
                        ticks: { color: textColor },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(context.parsed.y);
                            }
                        }
                    }
                }
            }
        });
    }
}
