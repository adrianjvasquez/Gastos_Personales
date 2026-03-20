

class TransactionManager {
    constructor() {
        // Load existing transactions or start empty
        this.transactions = Storage.get('transactions') || [];
    }

    getAll() {
        // Return cloned array sorted by date descending (newest first)
        return [...this.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    add(transaction) {
        const newTx = {
            ...transaction,
            id: 'tx-' + Date.now()
        };
        this.transactions.push(newTx);
        this.save();
        return newTx;
    }

    update(id, updatedData) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            this.transactions[index] = { ...this.transactions[index], ...updatedData };
            this.save();
            return this.transactions[index];
        }
        return null;
    }

    delete(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.save();
    }

    save() {
        Storage.set('transactions', this.transactions);
    }

    filter(filters = {}) {
        let result = this.getAll();

        // Filter by Transaction Type (income / expense)
        if (filters.type && filters.type !== 'all') {
            result = result.filter(t => t.type === filters.type);
        }

        // Filter by Category
        if (filters.categoryId && filters.categoryId !== 'all') {
            result = result.filter(t => t.categoryId === filters.categoryId);
        }

        // Filter by Period
        if (filters.period && filters.period !== 'all') {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            result = result.filter(t => {
                // Ignore time completely for grouping logic, focus on the date
                const txDateStr = t.date; // format YYYY-MM-DD
                const parts = txDateStr.split('-');
                const txDate = new Date(parts[0], parts[1] - 1, parts[2]); // local date

                if (filters.period === 'day') {
                    return txDate.getTime() === startOfDay.getTime();
                } else if (filters.period === 'week') {
                    // Start of the current week (Sunday)
                    const tempDate = new Date();
                    const diff = tempDate.getDate() - tempDate.getDay();
                    const startOfWeek = new Date(tempDate.setDate(diff));
                    startOfWeek.setHours(0,0,0,0);
                    return txDate.getTime() >= startOfWeek.getTime();
                } else if (filters.period === 'month') {
                    return txDate.getFullYear() === now.getFullYear() && 
                           txDate.getMonth() === now.getMonth();
                }
                return true;
            });
        }

        return result;
    }
}
