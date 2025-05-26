// Sistema de cadastro de fornecedores
let fornecedores = [];
let editandoId = null;

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    renderizarTabela();
    aplicarMascaras();
    configurarEventListeners();
    configurarBuscaCEP();
});

// Configurar event listeners
function configurarEventListeners() {
    const form = document.querySelector('.form-container form');
    const buscarForm = document.querySelector('.search-container form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        salvarFornecedor();
    });
    
    buscarForm.addEventListener('submit', (e) => {
        e.preventDefault();
        buscarFornecedores();
    });
}

// Aplicar máscaras de formatação
function aplicarMascaras() {
    // Máscara para CNPJ
    const cnpjInput = document.getElementById('fornecedor-cnpj');
    cnpjInput.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length > 14) valor = valor.substring(0, 14);
        
        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
        
        e.target.value = valor;
    });
    
    // Máscara para telefones
    const telefoneInputs = [
        document.getElementById('fornecedor-telefone'),
        document.getElementById('fornecedor-contato-telefone')
    ];
    
    telefoneInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function(e) {
                let valor = e.target.value.replace(/\D/g, '');
                if (valor.length > 11) valor = valor.substring(0, 11);
                
                if (valor.length > 2) {
                    valor = `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
                }
                
                if (valor.length > 10) {
                    valor = valor.replace(/(\(\d{2}\) \d{4,5})(\d)/, '$1-$2');
                }
                
                e.target.value = valor;
            });
        }
    });
    
    // Máscara para CEP
    const cepInput = document.getElementById('fornecedor-cep');
    cepInput.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length > 8) valor = valor.substring(0, 8);
        
        if (valor.length > 5) {
            valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
        }
        
        e.target.value = valor;
    });
}

// Configurar busca de CEP via API
function configurarBuscaCEP() {
    const cepInput = document.getElementById('fornecedor-cep');
    
    cepInput.addEventListener('blur', async function() {
        const cep = this.value.replace(/\D/g, '');
        
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                
                if (!data.erro) {
                    document.getElementById('fornecedor-logradouro').value = data.logradouro || '';
                    document.getElementById('fornecedor-bairro').value = data.bairro || '';
                    document.getElementById('fornecedor-cidade').value = data.localidade || '';
                    document.getElementById('fornecedor-estado').value = data.uf || '';
                }
            } catch (error) {
                console.log('Erro ao buscar CEP:', error);
            }
        }
    });
}

// Carregar dados do localStorage
function carregarDados() {
    const fornecedoresSalvos = localStorage.getItem('farmaciaFornecedores');
    fornecedores = fornecedoresSalvos ? JSON.parse(fornecedoresSalvos) : carregarExemplos();
    
    if (fornecedores.length === 0) {
        fornecedores = carregarExemplos();
        salvarDados();
    }
}

// Carregar exemplos iniciais
function carregarExemplos() {
    return [
        {
            id: 1,
            nome: 'MedFarma Distribuidora',
            cnpj: '12.345.678/0001-90',
            telefone: '(11) 3333-4444',
            email: 'contato@medfarma.com',
            endereco: {
                cep: '01234-567',
                logradouro: 'Rua das Indústrias',
                numero: '1000',
                complemento: 'Galpão A',
                bairro: 'Industrial',
                cidade: 'São Paulo',
                estado: 'SP'
            },
            contato: {
                nome: 'Carlos Silva',
                cargo: 'Gerente Comercial',
                telefone: '(11) 99999-1111',
                email: 'carlos@medfarma.com'
            }
        },
        {
            id: 2,
            nome: 'Pharma Supply',
            cnpj: '98.765.432/0001-10',
            telefone: '(21) 4444-5555',
            email: 'contato@pharmasupply.com',
            endereco: {
                cep: '20000-000',
                logradouro: 'Av. Atlântica',
                numero: '500',
                complemento: '',
                bairro: 'Copacabana',
                cidade: 'Rio de Janeiro',
                estado: 'RJ'
            },
            contato: {
                nome: 'Ana Oliveira',
                cargo: 'Representante de Vendas',
                telefone: '(21) 88888-2222',
                email: 'ana@pharmasupply.com'
            }
        }
    ];
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('farmaciaFornecedores', JSON.stringify(fornecedores));
}

// Obter dados do formulário
function obterDadosFormulario() {
    return {
        nome: document.getElementById('fornecedor-nome').value,
        cnpj: document.getElementById('fornecedor-cnpj').value,
        telefone: document.getElementById('fornecedor-telefone').value,
        email: document.getElementById('fornecedor-email').value,
        endereco: {
            cep: document.getElementById('fornecedor-cep').value,
            logradouro: document.getElementById('fornecedor-logradouro').value,
            numero: document.getElementById('fornecedor-numero').value,
            complemento: document.getElementById('fornecedor-complemento').value,
            bairro: document.getElementById('fornecedor-bairro').value,
            cidade: document.getElementById('fornecedor-cidade').value,
            estado: document.getElementById('fornecedor-estado').value
        },
        contato: {
            nome: document.getElementById('fornecedor-contato-nome').value,
            cargo: document.getElementById('fornecedor-contato-cargo').value,
            telefone: document.getElementById('fornecedor-contato-telefone').value,
            email: document.getElementById('fornecedor-contato-email').value
        }
    };
}

// Preencher formulário com dados
function preencherFormulario(fornecedor) {
    document.getElementById('fornecedor-nome').value = fornecedor.nome || '';
    document.getElementById('fornecedor-cnpj').value = fornecedor.cnpj || '';
    document.getElementById('fornecedor-telefone').value = fornecedor.telefone || '';
    document.getElementById('fornecedor-email').value = fornecedor.email || '';
    
    // Endereço
    document.getElementById('fornecedor-cep').value = fornecedor.endereco?.cep || '';
    document.getElementById('fornecedor-logradouro').value = fornecedor.endereco?.logradouro || '';
    document.getElementById('fornecedor-numero').value = fornecedor.endereco?.numero || '';
    document.getElementById('fornecedor-complemento').value = fornecedor.endereco?.complemento || '';
    document.getElementById('fornecedor-bairro').value = fornecedor.endereco?.bairro || '';
    document.getElementById('fornecedor-cidade').value = fornecedor.endereco?.cidade || '';
    document.getElementById('fornecedor-estado').value = fornecedor.endereco?.estado || '';
    
    // Contato
    document.getElementById('fornecedor-contato-nome').value = fornecedor.contato?.nome || '';
    document.getElementById('fornecedor-contato-cargo').value = fornecedor.contato?.cargo || '';
    document.getElementById('fornecedor-contato-telefone').value = fornecedor.contato?.telefone || '';
    document.getElementById('fornecedor-contato-email').value = fornecedor.contato?.email || '';
}

// Validar dados do formulário
function validarFormulario(dados) {
    // Validações obrigatórias
    if (!dados.nome) {
        exibirNotificacao('Nome da empresa é obrigatório!', 'erro');
        return false;
    }
    
    if (!dados.cnpj) {
        exibirNotificacao('CNPJ é obrigatório!', 'erro');
        return false;
    }
    
    // Validar formato do CNPJ
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (!cnpjRegex.test(dados.cnpj)) {
        exibirNotificacao('CNPJ deve estar no formato 00.000.000/0000-00', 'erro');
        return false;
    }
    
    // Validar emails se fornecidos
    if (dados.email && !validateEmail(dados.email)) {
        exibirNotificacao('Email da empresa inválido!', 'erro');
        return false;
    }
    
    if (dados.contato.email && !validateEmail(dados.contato.email)) {
        exibirNotificacao('Email do contato inválido!', 'erro');
        return false;
    }
    
    return true;
}

// Validar formato de e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Salvar fornecedor
function salvarFornecedor() {
    const dados = obterDadosFormulario();
    
    if (!validarFormulario(dados)) {
        return;
    }
    
    // Se estiver editando
    if (editandoId !== null) {
        const index = fornecedores.findIndex(f => f.id === editandoId);
        if (index !== -1) {
            dados.id = editandoId;
            fornecedores[index] = dados;
            exibirNotificacao('Fornecedor atualizado com sucesso!', 'sucesso');
        }
        editandoId = null;
    } else {
        // Verificar se CNPJ já existe
        const cnpjExistente = fornecedores.some(f => f.cnpj === dados.cnpj);
        if (cnpjExistente) {
            exibirNotificacao('Este CNPJ já está cadastrado!', 'erro');
            return;
        }
        
        // Novo fornecedor
        const novoId = fornecedores.length > 0 ? Math.max(...fornecedores.map(f => f.id)) + 1 : 1;
        dados.id = novoId;
        fornecedores.push(dados);
        exibirNotificacao('Fornecedor cadastrado com sucesso!', 'sucesso');
    }
    
    // Salvar, limpar formulário e atualizar tabela
    salvarDados();
    document.querySelector('.form-container form').reset();
    document.querySelector('.btn-primary').textContent = 'Salvar';
    renderizarTabela();
}

// Editar fornecedor
function editarFornecedor(id) {
    const fornecedor = fornecedores.find(f => f.id === id);
    
    if (fornecedor) {
        preencherFormulario(fornecedor);
        editandoId = id;
        document.querySelector('.btn-primary').textContent = 'Atualizar';
        
        // Rolar até o formulário
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    }
}

// Excluir fornecedor
function excluirFornecedor(id) {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
        fornecedores = fornecedores.filter(f => f.id !== id);
        salvarDados();
        renderizarTabela();
        exibirNotificacao('Fornecedor excluído com sucesso!', 'sucesso');
        
        // Se estava editando o fornecedor excluído, resetar formulário
        if (editandoId === id) {
            document.querySelector('.form-container form').reset();
            editandoId = null;
            document.querySelector('.btn-primary').textContent = 'Salvar';
        }
    }
}

// Buscar fornecedores
function buscarFornecedores() {
    const termoBusca = document.getElementById('buscar-fornecedor').value.toLowerCase().trim();
    
    if (termoBusca === '') {
        renderizarTabela();
        return;
    }
    
    const fornecedoresFiltrados = fornecedores.filter(f => 
        f.nome.toLowerCase().includes(termoBusca) || 
        f.cnpj.includes(termoBusca) ||
        (f.email && f.email.toLowerCase().includes(termoBusca)) ||
        (f.endereco?.cidade && f.endereco.cidade.toLowerCase().includes(termoBusca)) ||
        (f.contato?.nome && f.contato.nome.toLowerCase().includes(termoBusca))
    );
    
    renderizarTabela(fornecedoresFiltrados);
}

// Renderizar tabela
function renderizarTabela(dados) {
    const tabela = document.querySelector('table tbody');
    
    if (!dados) {
        dados = fornecedores;
    }
    
    tabela.innerHTML = '';
    
    if (dados.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8" style="text-align: center">Nenhum fornecedor cadastrado</td>';
        tabela.appendChild(row);
        return;
    }
    
    dados.forEach(fornecedor => {
        const row = document.createElement('tr');
        
        const cidadeUF = fornecedor.endereco?.cidade && fornecedor.endereco?.estado 
            ? `${fornecedor.endereco.cidade}/${fornecedor.endereco.estado}` 
            : '-';
        
        const nomeContato = fornecedor.contato?.nome || '-';
        
        row.innerHTML = `
            <td data-label="ID">${fornecedor.id}</td>
            <td data-label="Nome">${fornecedor.nome}</td>
            <td data-label="CNPJ">${fornecedor.cnpj}</td>
            <td data-label="Telefone">${fornecedor.telefone || '-'}</td>
            <td data-label="Email">${fornecedor.email || '-'}</td>
            <td data-label="Cidade/UF">${cidadeUF}</td>
            <td data-label="Contato">${nomeContato}</td>
            <td data-label="Ações" class="action-btns">
                <a href="#" class="edit-btn" onclick="editarFornecedor(${fornecedor.id}); return false;">Editar</a>
                <a href="#" class="delete-btn" onclick="excluirFornecedor(${fornecedor.id}); return false;">Excluir</a>
            </td>
        `;
        
        tabela.appendChild(row);
    });
}

// Exibir notificação
function exibirNotificacao(mensagem, tipo) {
    let notificacao = document.querySelector('.notificacao');
    
    if (!notificacao) {
        notificacao = document.createElement('div');
        notificacao.className = 'notificacao';
        document.querySelector('.main-content').prepend(notificacao);
    }
    
    notificacao.textContent = mensagem;
    notificacao.className = `notificacao ${tipo}`;
    notificacao.style.display = 'block';
    
    // Adicionar estilo CSS se não existir
    if (!document.getElementById('notificacao-style')) {
        const style = document.createElement('style');
        style.id = 'notificacao-style';
        style.textContent = `
            .notificacao {
                padding: 10px;
                margin: 10px 0;
                border-radius: 4px;
                text-align: center;
                font-weight: bold;
            }
            .sucesso {
                background-color: #c8e6c9;
                color: #2e7d32;
                border: 1px solid #4caf50;
            }
            .erro {
                background-color: #ffcdd2;
                color: #c62828;
                border: 1px solid #f44336;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Ocultar após 3 segundos
    setTimeout(() => {
        notificacao.style.display = 'none';
    }, 3000);
}

// Expor funções para o escopo global
window.editarFornecedor = editarFornecedor;
window.excluirFornecedor = excluirFornecedor;