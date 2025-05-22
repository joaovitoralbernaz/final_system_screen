

document.addEventListener('DOMContentLoaded', function() {
    // Criar o botão de menu
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    
    for (let i = 0; i < 3; i++) {
        const span = document.createElement('span');
        menuToggle.appendChild(span);
    }
    
    header.insertBefore(menuToggle, nav);
    
    // Funcionalidade do menu
    menuToggle.addEventListener('click', function() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');
    });
    
    // Cálculo de subtotais e total na tabela de itens
    const calcularSubtotal = function(row) {
        const quantidade = parseFloat(row.querySelector('input[name^="quantidade_"]').value) || 0;
        const valorUnitario = parseFloat(row.querySelector('input[name^="valor_unitario_"]').value) || 0;
        const subtotal = quantidade * valorUnitario;
        row.querySelector('input[name^="subtotal_"]').value = subtotal.toFixed(2);
        return subtotal;
    };
    
    const calcularTotal = function() {
        const rows = document.querySelectorAll('tbody tr');
        let total = 0;
        
        rows.forEach(function(row) {
            total += calcularSubtotal(row);
        });
        
        document.querySelector('input[name="total"]').value = total.toFixed(2);
    };
    
    // Adicionar event listeners para os campos de quantidade e valor unitário
    document.querySelectorAll('input[name^="quantidade_"], input[name^="valor_unitario_"]').forEach(function(input) {
        input.addEventListener('input', calcularTotal);
    });
    
    // Inicializar cálculos
    calcularTotal();
});