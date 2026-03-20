

// Predefined default categories
const DEFAULT_CATEGORIES = [
    { id: 'cat-1', name: 'Comida', type: 'expense', icon: 'fa-solid fa-utensils', color: '#ff9ff3' },
    { id: 'cat-2', name: 'Transporte', type: 'expense', icon: 'fa-solid fa-car', color: '#feca57' },
    { id: 'cat-3', name: 'Salud', type: 'expense', icon: 'fa-solid fa-notes-medical', color: '#ff6b6b' },
    { id: 'cat-4', name: 'Educación', type: 'expense', icon: 'fa-solid fa-book', color: '#48dbfb' },
    { id: 'cat-5', name: 'Ocio', type: 'expense', icon: 'fa-solid fa-gamepad', color: '#1dd1a1' },
    { id: 'cat-6', name: 'Vivienda', type: 'expense', icon: 'fa-solid fa-house', color: '#5f27cd' },
    { id: 'cat-7', name: 'Salario', type: 'income', icon: 'fa-solid fa-money-bill-wave', color: '#10ac84' },
    { id: 'cat-8', name: 'Inversiones', type: 'income', icon: 'fa-solid fa-chart-line', color: '#341f97' },
    { id: 'cat-9', name: 'Regalos', type: 'income', icon: 'fa-solid fa-gift', color: '#ff9f43' },
    { id: 'cat-10', name: 'Otros', type: 'income', icon: 'fa-solid fa-circle-plus', color: '#576574' }
];

class CategoryManager {
    constructor() {
        this.categories = Storage.get('categories');
        if (!this.categories || this.categories.length === 0) {
            this.categories = DEFAULT_CATEGORIES;
            Storage.set('categories', this.categories);
        }
    }

    getAll() {
        return this.categories;
    }

    getByType(type) {
        if (type === 'all') return this.categories;
        return this.categories.filter(c => c.type === type);
    }

    addCategory(name, type, icon, color) {
        const newCat = {
            id: 'cat-' + Date.now(),
            name,
            type,
            icon: icon || 'fa-solid fa-tag',
            color: color || '#888888'
        };
        this.categories.push(newCat);
        Storage.set('categories', this.categories);
        return newCat;
    }

    getById(id) {
        return this.categories.find(c => c.id === id);
    }
}
