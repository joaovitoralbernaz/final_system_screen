// Script unificado para gerenciar todos os cadastros (clientes, funcionários, etc.)
// Este script detecta qual página está aberta e carrega as funções apropriadas

// Variáveis globais para cada tipo de cadastro
let clientes = [];
let funcionarios = [];
let editandoId = null;
let tipoAtual = ''; // Armazena o tipo atual de cadastro (cliente, funcionario, etc.)

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Determinar qual página está sendo carregada
    const tituloPagina = document.title.toLowerCase();
    const h1Titulo = document.querySelector('.page-title')?.textContent.toLowerCase() || '';
    
    // Configurar o tipo de cadastro com base no título da página
    if (tituloPagina.includes('cliente') || h1Titulo.includes('cliente')) {
        tipoAtual = 'cliente';
        inicializarCadastro('cliente');
    } else if (tituloPagina.includes('funcionário') || h1Titulo.includes('funiconario')) {
        tipoAtual = 'funcionario';
        inicializarCadastro('funcionario');
    }
    
    // Aplicar máscaras aos campos relevantes
    aplicarMascaras();
});

// Inicializar o cadastro específico
function inicializarCadastro(tipo) {
    // Carregar dados
    carregarDados(tipo);
    renderizarTabela();
    
    // Configurar event listeners
    const form = document.querySelector('.form-container form');
    const buscarForm = document.querySelector('.search-container form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        salvarRegistro(tipo);
    });
    
    buscarForm.addEventListener('submit', (e) => {
        e.preventDefault();
        buscarRegistros();
    });
}

// Aplicar máscaras de formatação
function aplicarMascaras() {
    // Identificar campos de CPF e telefone com base em seus IDs
    const cpfInputs = document.querySelectorAll('input[id$="-cpf"]');
    const telefoneInputs = document.querySelectorAll('input[id$="-telefone"]');
    
    // Aplicar máscara para CPF
    cpfInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 11) valor = valor.substring(0, 11);
            
            valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
            valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
            valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            
            e.target.value = valor;
        });
    });
    
    // Máscara para telefone
    telefoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
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
    });
}

// Carregar dados do localStorage
function carregarDados(tipo) {
    if (tipo === 'cliente') {
        const clientesSalvos = localStorage.getItem('farmaciaClientes');
        clientes = clientesSalvos ? JSON.parse(clientesSalvos) : carregarExemplos();
        if (clientes.length === 0) {
            clientes = carregarExemplos();
            salvarDados('cliente');
        }
    } else if (tipo === 'funcionario') {
        const funcionariosSalvos = localStorage.getItem('farmaciaFuncionarios');
        funcionarios = funcionariosSalvos ? JSON.parse(funcionariosSalvos) : carregarExemplos();
        if (funcionarios.length === 0) {
            funcionarios = carregarExemplos();
            salvarDados('funcionario');
        }
    }
}

// Carregar exemplos para inicialização
function carregarExemplos() {
    return [
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
}

// Salvar dados no localStorage
function salvarDados(tipo) {
    if (tipo === 'cliente') {
        localStorage.setItem('farmaciaClientes', JSON.stringify(clientes));
    } else if (tipo === 'funcionario') {
        localStorage.setItem('farmaciaFuncionarios', JSON.stringify(funcionarios));
    }
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

// Validar formato de e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Obter elementos do formulário com base no tipo
function getFormElements() {
    let nomeInput, cpfInput, telefoneInput, emailInput, enderecoInput, buscarInput;
    
    if (tipoAtual === 'cliente') {
        nomeInput = document.getElementById('cliente-nome');
        cpfInput = document.getElementById('cliente-cpf');
        telefoneInput = document.getElementById('cliente-telefone');
        emailInput = document.getElementById('cliente-email');
        enderecoInput = document.getElementById('cliente-endereco');
        buscarInput = document.getElementById('buscar-cliente');
    } else if (tipoAtual === 'funcionario') {
        nomeInput = document.getElementById('funiconario-nome');
        cpfInput = document.getElementById('funiconario-cpf');
        telefoneInput = document.getElementById('funiconario-telefone');
        emailInput = document.getElementById('funiconario-email');
        enderecoInput = document.getElementById('funiconario-endereco');
        buscarInput = document.getElementById('buscar-funiconario');
    }
    
    return { nomeInput, cpfInput, telefoneInput, emailInput, enderecoInput, buscarInput };
}

// Salvar ou atualizar um registro
function salvarRegistro() {
    const { nomeInput, cpfInput, telefoneInput, emailInput, enderecoInput } = getFormElements();
    const form = document.querySelector('.form-container form');
    
    // Validação básica
    if (!nomeInput.value || !cpfInput.value) {
        exibirNotificacao(`Por favor, preencha pelo menos o nome e CPF.`, 'erro');
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
    
    const registro = {
        nome: nomeInput.value,
        cpf: cpfInput.value,
        telefone: telefoneInput.value,
        email: emailInput.value,
        endereco: enderecoInput.value
    };
    
    // Referenciar o array correto
    const dados = tipoAtual === 'cliente' ? clientes : funcionarios;
    
    // Se estiver editando, atualizar o registro existente
    if (editandoId !== null) {
        const index = dados.findIndex(item => item.id === editandoId);
        if (index !== -1) {
            registro.id = editandoId;
            dados[index] = registro;
            exibirNotificacao(`${tipoAtual === 'cliente' ? 'Cliente' : 'Funcionário'} atualizado com sucesso!`, 'sucesso');
        }
        editandoId = null;
    } else {
        // Novo registro - verificar se CPF já existe
        const cpfExistente = dados.some(item => item.cpf === registro.cpf);
        if (cpfExistente) {
            exibirNotificacao('Este CPF já está cadastrado!', 'erro');
            return;
        }
        
        // Gerar um novo ID (maior ID atual + 1)
        const novoId = dados.length > 0 ? Math.max(...dados.map(item => item.id)) + 1 : 1;
        registro.id = novoId;
        
        // Adicionar ao array apropriado
        if (tipoAtual === 'cliente') {
            clientes.push(registro);
        } else if (tipoAtual === 'funcionario') {
            funcionarios.push(registro);
        }
        
        exibirNotificacao(`${tipoAtual === 'cliente' ? 'Cliente' : 'Funcionário'} cadastrado com sucesso!`, 'sucesso');
    }
    
    // Salvar, limpar o formulário e atualizar a tabela
    salvarDados(tipoAtual);
    form.reset();
    document.querySelector('.btn-primary').textContent = 'Salvar';
    renderizarTabela();
}

// Editar registro
function editarRegistro(id) {
    const dados = tipoAtual === 'cliente' ? clientes : funcionarios;
    const registro = dados.find(item => item.id === id);
    
    if (registro) {
        const { nomeInput, cpfInput, telefoneInput, emailInput, enderecoInput } = getFormElements();
        
        nomeInput.value = registro.nome;
        cpfInput.value = registro.cpf;
        telefoneInput.value = registro.telefone;
        emailInput.value = registro.email;
        enderecoInput.value = registro.endereco;
        
        editandoId = id;
        document.querySelector('.btn-primary').textContent = 'Atualizar';
        
        // Rolar até o formulário
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    }
}

// Função para editar cliente (exposta globalmente)
function editarCliente(id) {
    if (tipoAtual === 'cliente') {
        editarRegistro(id);
    }
}

// Função para editar funcionário (exposta globalmente)
function editarFuncionario(id) {
    if (tipoAtual === 'funcionario') {
        editarRegistro(id);
    }
}

// Excluir registro
function excluirRegistro(id) {
    const confirmMsg = `Tem certeza que deseja excluir este ${tipoAtual === 'cliente' ? 'cliente' : 'funcionário'}?`;
    
    if (confirm(confirmMsg)) {
        // Atualizar o array correto
        if (tipoAtual === 'cliente') {
            clientes = clientes.filter(item => item.id !== id);
        } else if (tipoAtual === 'funcionario') {
            funcionarios = funcionarios.filter(item => item.id !== id);
        }
        
        // Salvar e atualizar a UI
        salvarDados(tipoAtual);
        renderizarTabela();
        exibirNotificacao(`${tipoAtual === 'cliente' ? 'Cliente' : 'Funcionário'} excluído com sucesso!`, 'sucesso');
        
        // Se estava editando o registro que foi excluído, resetar o formulário
        if (editandoId === id) {
            document.querySelector('.form-container form').reset();
            editandoId = null;
            document.querySelector('.btn-primary').textContent = 'Salvar';
        }
    }
}

// Função para excluir cliente (exposta globalmente)
function excluirCliente(id) {
    if (tipoAtual === 'cliente') {
        excluirRegistro(id);
    }
}

// Função para excluir funcionário (exposta globalmente)
function excluirFuncionario(id) {
    if (tipoAtual === 'funcionario') {
        excluirRegistro(id);
    }
}

// Buscar registros
function buscarRegistros() {
    const { buscarInput } = getFormElements();
    const termoBusca = buscarInput.value.toLowerCase().trim();
    
    // Selecionar o array correto
    const dados = tipoAtual === 'cliente' ? clientes : funcionarios;
    
    if (termoBusca === '') {
        renderizarTabela(dados);
        return;
    }
    
    const registrosFiltrados = dados.filter(item => 
        item.nome.toLowerCase().includes(termoBusca) || 
        item.cpf.includes(termoBusca) ||
        (item.email && item.email.toLowerCase().includes(termoBusca)) ||
        (item.telefone && item.telefone.includes(termoBusca))
    );
    
    renderizarTabela(registrosFiltrados);
}

// Renderizar tabela
function renderizarTabela(dados) {
    const tabela = document.querySelector('table tbody');
    
    // Se não houver dados específicos, usar o array correto
    if (!dados) {
        dados = tipoAtual === 'cliente' ? clientes : funcionarios;
    }
    
    tabela.innerHTML = '';
    
    if (dados.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" style="text-align: center">Nenhum ${tipoAtual === 'cliente' ? 'cliente' : 'funcionário'} cadastrado</td>`;
        tabela.appendChild(row);
        return;
    }
    
    dados.forEach(item => {
        const row = document.createElement('tr');
        
        // Determinar qual função de edição e exclusão chamar
        const editarFuncao = tipoAtual === 'cliente' ? 'editarCliente' : 'editarFuncionario';
        const excluirFuncao = tipoAtual === 'cliente' ? 'excluirCliente' : 'excluirFuncionario';
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.nome}</td>
            <td>${item.cpf}</td>
            <td>${item.telefone || '-'}</td>
            <td>${item.email || '-'}</td>
            <td class="action-btns">
                <a href="#" class="edit-btn" onclick="${editarFuncao}(${item.id}); return false;">Editar</a>
                <a href="#" class="delete-btn" onclick="${excluirFuncao}(${item.id}); return false;">Excluir</a>
            </td>
        `;
        
        tabela.appendChild(row);
    });
}

// Expor funções para o escopo global
window.editarCliente = editarCliente;
window.excluirCliente = excluirCliente;
window.editarFuncionario = editarFuncionario;
window.excluirFuncionario = excluirFuncionario;