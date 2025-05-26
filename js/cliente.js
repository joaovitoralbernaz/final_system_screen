// Variáveis globais
let clientes = [];
let editandoId = null;

// Elementos do DOM - Dados Pessoais
const form = document.querySelector('.form-container form');
const nomeInput = document.getElementById('cliente-nome');
const cpfInput = document.getElementById('cliente-cpf');
const telefoneInput = document.getElementById('cliente-telefone');
const emailInput = document.getElementById('cliente-email');

// Elementos do DOM - Endereço
const cepInput = document.getElementById('cliente-cep');
const logradouroInput = document.getElementById('cliente-logradouro');
const numeroInput = document.getElementById('cliente-numero');
const complementoInput = document.getElementById('cliente-complemento');
const bairroInput = document.getElementById('cliente-bairro');
const cidadeInput = document.getElementById('cliente-cidade');
const estadoInput = document.getElementById('cliente-estado');

// Elementos do DOM - Busca e Tabela
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
    
    // Event listener para busca de CEP
    cepInput.addEventListener('blur', buscarCEP);
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
    
    // Máscara para CEP
    cepInput.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length > 8) valor = valor.substring(0, 8);
        
        valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
        
        e.target.value = valor;
    });
}

// Buscar CEP na API dos Correios
async function buscarCEP() {
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length === 8) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const dados = await response.json();
            
            if (!dados.erro) {
                logradouroInput.value = dados.logradouro || '';
                bairroInput.value = dados.bairro || '';
                cidadeInput.value = dados.localidade || '';
                estadoInput.value = dados.uf || '';
                
                // Focar no campo número após preencher o endereço
                numeroInput.focus();
            } else {
                exibirNotificacao('CEP não encontrado', 'erro');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            exibirNotificacao('Erro ao buscar CEP. Verifique sua conexão.', 'erro');
        }
    }
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
                endereco: {
                    cep: '01310-100',
                    logradouro: 'Av. Paulista',
                    numero: '1578',
                    complemento: 'Apto 101',
                    bairro: 'Bela Vista',
                    cidade: 'São Paulo',
                    estado: 'SP'
                }
            },
            {
                id: 2,
                nome: 'João Santos',
                cpf: '987.654.321-00',
                telefone: '(21) 99999-7777',
                email: 'joao@email.com',
                endereco: {
                    cep: '22071-900',
                    logradouro: 'Av. Atlântica',
                    numero: '1702',
                    complemento: '',
                    bairro: 'Copacabana',
                    cidade: 'Rio de Janeiro',
                    estado: 'RJ'
                }
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
                padding: 12px;
                margin: 15px 0;
                border-radius: 6px;
                text-align: center;
                font-weight: 500;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .sucesso {
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .erro {
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Ocultar a notificação após alguns segundos
    setTimeout(() => {
        notificacao.style.display = 'none';
    }, 4000);
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
    
    // Validar CEP (se fornecido)
    if (cepInput.value && !validateCEP(cepInput.value)) {
        exibirNotificacao('Por favor, insira um CEP válido no formato 00000-000', 'erro');
        return;
    }
    
    const cliente = {
        nome: nomeInput.value,
        cpf: cpfInput.value,
        telefone: telefoneInput.value,
        email: emailInput.value,
        endereco: {
            cep: cepInput.value,
            logradouro: logradouroInput.value,
            numero: numeroInput.value,
            complemento: complementoInput.value,
            bairro: bairroInput.value,
            cidade: cidadeInput.value,
            estado: estadoInput.value
        }
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

// Validar formato de CEP
function validateCEP(cep) {
    const re = /^\d{5}-\d{3}$/;
    return re.test(cep);
}

// Editar cliente
function editarCliente(id) {
    const cliente = clientes.find(item => item.id === id);
    if (cliente) {
        // Preencher dados pessoais
        nomeInput.value = cliente.nome;
        cpfInput.value = cliente.cpf;
        telefoneInput.value = cliente.telefone;
        emailInput.value = cliente.email;
        
        // Preencher dados de endereço
        if (cliente.endereco) {
            cepInput.value = cliente.endereco.cep || '';
            logradouroInput.value = cliente.endereco.logradouro || '';
            numeroInput.value = cliente.endereco.numero || '';
            complementoInput.value = cliente.endereco.complemento || '';
            bairroInput.value = cliente.endereco.bairro || '';
            cidadeInput.value = cliente.endereco.cidade || '';
            estadoInput.value = cliente.endereco.estado || '';
        }
        
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
        (item.telefone && item.telefone.includes(termoBusca)) ||
        (item.endereco && item.endereco.cidade && item.endereco.cidade.toLowerCase().includes(termoBusca)) ||
        (item.endereco && item.endereco.estado && item.endereco.estado.toLowerCase().includes(termoBusca))
    );
    
    renderizarTabela(clientesFiltrados);
}

// Renderizar tabela de clientes
function renderizarTabela(dados = clientes) {
    tabela.innerHTML = '';
    
    if (dados.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" style="text-align: center; padding: 20px; color: #666;">Nenhum cliente encontrado</td>';
        tabela.appendChild(row);
        return;
    }
    
    dados.forEach(item => {
        const row = document.createElement('tr');
        
        // Formatar cidade/UF
        let cidadeUf = '-';
        if (item.endereco && item.endereco.cidade && item.endereco.estado) {
            cidadeUf = `${item.endereco.cidade}/${item.endereco.estado}`;
        } else if (item.endereco && item.endereco.cidade) {
            cidadeUf = item.endereco.cidade;
        }
        
        row.innerHTML = `
            <td data-label="ID">${item.id}</td>
            <td data-label="Nome">${item.nome}</td>
            <td data-label="CPF">${item.cpf}</td>
            <td data-label="Telefone">${item.telefone || '-'}</td>
            <td data-label="Email">${item.email || '-'}</td>
            <td data-label="Cidade/UF">${cidadeUf}</td>
            <td data-label="Ações" class="action-btns">
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

// JavaScript para o menu hambúrguer
const hamburgerMenu = document.getElementById('hamburgerMenu');
const navLinks = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');

function toggleMenu() {
    hamburgerMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
    navOverlay.classList.toggle('active');
    
    // Previne o scroll do body quando o menu está aberto
    if (navLinks.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

function closeMenu() {
    hamburgerMenu.classList.remove('active');
    navLinks.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Event listeners para o menu
if (hamburgerMenu) {
    hamburgerMenu.addEventListener('click', toggleMenu);
}

if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
}

if (navLinks) {
    // Fechar menu ao clicar em um link
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            closeMenu();
        }
    });
}

// Fechar menu com tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
        closeMenu();
    }
});

// Fechar menu ao redimensionar a tela para desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks && navLinks.classList.contains('active')) {
        closeMenu();
    }
});