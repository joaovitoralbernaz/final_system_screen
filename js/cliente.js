// Variáveis globais
let clientes = [];
let editandoId = null;

// Elementos do DOM
const form = document.querySelector('.form-container form');
const nomeInput = document.getElementById('cliente-nome');
const cpfInput = document.getElementById('cliente-cpf');
const telefoneInput = document.getElementById('cliente-telefone');
const emailInput = document.getElementById('cliente-email');
const enderecoInput = document.getElementById('cliente-endereco');
const buscarForm = document.querySelector('.search-container form');
const buscarInput = document.getElementById('buscar-cliente');
const tabela = document.querySelector('table tbody');

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', function() {
    carregarClientes();
    renderizarTabela();
    
    // Event listeners
    form.addEventListener('submit', salvarCliente);
    buscarForm.addEventListener('submit', function(e) {
        e.preventDefault();
        buscarClientes();
    });
    
    // Aplicar máscaras aos campos
    aplicarMascaras();
});

// Aplicar máscaras de formatação
function aplicarMascaras() {
    // Máscara para CPF
    cpfInput.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.substring(0, 11);
        
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        
        e.target.value = valor;
    });
    
    // Máscara para telefone
    telefoneInput.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.substring(0, 11);
        
        if (valor.length > 2) {
            valor = `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
        }
        
        if (valor.length > 10) {
            valor = valor.replace(/(\(\d{2}\) \d{5})(\d)/, '$1-$2');
        }
        
        e.target.value = valor;
    });
}

// Carregar dados do localStorage
function carregarClientes() {
    const clientesSalvos = localStorage.getItem('farmaciaClientes');
    clientes = clientesSalvos ? JSON.parse(clientesSalvos) : [];
    
    // Se não houver clientes salvos, carregar os exemplos da tabela
    if (clientes.length === 0) {
        clientes = [
            {
                id: 1,
                nome: 'Maria Silva',
                cpf: '123.456.789-00',
                telefone: '(11) 99999-8888',
                email: 'maria@email.com',
                endereco: 'Rua das Flores, 123, Centro'
            },
            {
                id: 2,
                nome: 'João Santos',
                cpf: '987.654.321-00',
                telefone: '(11) 99999-7777',
                email: 'joao@email.com',
                endereco: 'Av. Principal, 456, Jardim'
            }
        ];
        salvarClientes();
    }
}

// Salvar dados no localStorage
function salvarClientes() {
    localStorage.setItem('farmaciaClientes', JSON.stringify(clientes));
}

// Exibir notificação
function exibirNotificacao(mensagem, tipo) {
    // Verificar se já existe uma notificação
    let notificacao = document.querySelector('.notificacao');
    
    if (!notificacao) {
        // Criar elemento de notificação
        notificacao = document.createElement('div');
        notificacao.className = 'notificacao';
        document.querySelector('.main-content').prepend(notificacao);
    }
    
    // Configurar a notificação
    notificacao.textContent = mensagem;
    notificacao.className = `notificacao ${tipo}`;
    notificacao.style.display = 'block';
    
    // Adicionar estilo CSS inline se ainda não existir no documento
    if (!document.getElementById('notificacao-style')) {
        const style = document.createElement('style');
        style.id = 'notificacao-style';
        style.textContent = `
            .notificacao {
                padding: 10px;
                margin: 10px 0;
                border-radius: 4px;
                text-align: center;
            }
            .sucesso {
                background-color: #c8e6c9;
                color: #2e7d32;
            }
            .erro {
                background-color: #ffcdd2;
                color: #c62828;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Ocultar a notificação após alguns segundos
    setTimeout(() => {
        notificacao.style.display = 'none';
    }, 3000);
}

// Salvar ou atualizar um cliente
function salvarCliente(e) {
    e.preventDefault();
    
    // Validação básica
    if (!nomeInput.value || !cpfInput.value) {
        exibirNotificacao('Por favor, preencha pelo menos o nome e CPF do cliente.', 'erro');
        return;
    }
    
    // Validar formato do CPF
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(cpfInput.value)) {
        exibirNotificacao('Por favor, insira um CPF válido no formato 000.000.000-00', 'erro');
        return;
    }
    
    // Validar email (se fornecido)
    if (emailInput.value && !validateEmail(emailInput.value)) {
        exibirNotificacao('Por favor, insira um email válido', 'erro');
        return;
    }
    
    const cliente = {
        nome: nomeInput.value,
        cpf: cpfInput.value,
        telefone: telefoneInput.value,
        email: emailInput.value,
        endereco: enderecoInput.value
    };
    
    // Se estiver editando, atualizar o cliente existente
    if (editandoId !== null) {
        const index = clientes.findIndex(item => item.id === editandoId);
        if (index !== -1) {
            cliente.id = editandoId;
            clientes[index] = cliente;
            exibirNotificacao('Cliente atualizado com sucesso!', 'sucesso');
        }
        editandoId = null;
    } else {
        // Novo cliente - verificar se CPF já existe
        const cpfExistente = clientes.some(c => c.cpf === cliente.cpf);
        if (cpfExistente) {
            exibirNotificacao('Este CPF já está cadastrado!', 'erro');
            return;
        }
        
        // Gerar um novo ID (maior ID atual + 1)
        const novoId = clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1;
        cliente.id = novoId;
        clientes.push(cliente);
        exibirNotificacao('Cliente cadastrado com sucesso!', 'sucesso');
    }
    
    // Salvar, limpar o formulário e atualizar a tabela
    salvarClientes();
    form.reset();
    document.querySelector('.btn-primary').textContent = 'Salvar';
    renderizarTabela();
}

// Validar formato de e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Editar cliente
function editarCliente(id) {
    const cliente = clientes.find(item => item.id === id);
    if (cliente) {
        nomeInput.value = cliente.nome;
        cpfInput.value = cliente.cpf;
        telefoneInput.value = cliente.telefone;
        emailInput.value = cliente.email;
        enderecoInput.value = cliente.endereco;
        
        editandoId = id;
        document.querySelector('.btn-primary').textContent = 'Atualizar';
        
        // Rolar até o formulário
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

// Excluir cliente
function excluirCliente(id) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        clientes = clientes.filter(item => item.id !== id);
        salvarClientes();
        renderizarTabela();
        exibirNotificacao('Cliente excluído com sucesso!', 'sucesso');
        
        // Se estava editando o cliente que foi excluído, resetar o formulário
        if (editandoId === id) {
            form.reset();
            editandoId = null;
            document.querySelector('.btn-primary').textContent = 'Salvar';
        }
    }
}

// Buscar clientes
function buscarClientes() {
    const termoBusca = buscarInput.value.toLowerCase().trim();
    
    if (termoBusca === '') {
        renderizarTabela(clientes);
        return;
    }
    
    const clientesFiltrados = clientes.filter(item => 
        item.nome.toLowerCase().includes(termoBusca) || 
        item.cpf.includes(termoBusca) ||
        item.email.toLowerCase().includes(termoBusca) ||
        (item.telefone && item.telefone.includes(termoBusca))
    );
    
    renderizarTabela(clientesFiltrados);
}

// Renderizar tabela de clientes
function renderizarTabela(dados = clientes) {
    tabela.innerHTML = '';
    
    if (dados.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center">Nenhum cliente cadastrado</td>';
        tabela.appendChild(row);
        return;
    }
    
    dados.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.nome}</td>
            <td>${item.cpf}</td>
            <td>${item.telefone || '-'}</td>
            <td>${item.email || '-'}</td>
            <td class="action-btns">
                <a href="#" class="edit-btn" onclick="editarCliente(${item.id}); return false;">Editar</a>
                <a href="#" class="delete-btn" onclick="excluirCliente(${item.id}); return false;">Excluir</a>
            </td>
        `;
        
        tabela.appendChild(row);
    });
}

// Expor funções para o escopo global
window.editarCliente = editarCliente;
window.excluirCliente = excluirCliente;