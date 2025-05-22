// Sistema de Estoque de Farmácia - Cadastro de Fornecedores
// Autor: Claude
// Data: 16/05/2025

// Dados iniciais para teste (simulando banco de dados)
let fornecedores = [
    {
        id: 1,
        nome: "MedFarma Distribuidora",
        cnpj: "12.345.678/0001-90",
        telefone: "(11) 3333-4444",
        email: "contato@medfarma.com",
        endereco: "Av. Paulista, 1000, Centro",
        contato: "Carlos Silva"
    },
    {
        id: 2,
        nome: "Pharma Supply",
        cnpj: "98.765.432/0001-10",
        telefone: "(11) 4444-5555",
        email: "contato@pharmasupply.com",
        endereco: "Rua Augusta, 500, Consolação",
        contato: "Ana Oliveira"
    }
];

// Elemento sendo editado (para controle de edição)
let fornecedorEditando = null;

// Função para inicializar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Carregar fornecedores do localStorage se existirem
    const fornecedoresGuardados = localStorage.getItem('fornecedores');
    if (fornecedoresGuardados) {
        fornecedores = JSON.parse(fornecedoresGuardados);
    }

    // Inicializar a tabela com os fornecedores existentes
    atualizarTabelaFornecedores();

    // Configurar listeners para o formulário
    document.querySelector('form').addEventListener('submit', salvarFornecedor);
    document.querySelector('form').addEventListener('reset', limparFormulario);

    // Configurar listener para a busca
    document.querySelector('.search-container form').addEventListener('submit', function(e) {
        e.preventDefault();
        buscarFornecedores();
    });

    // Adicionar máscara para o CNPJ
    const cnpjInput = document.getElementById('fornecedor-cnpj');
    cnpjInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 14) value = value.slice(0, 14);
        
        // Formatação do CNPJ: 00.000.000/0000-00
        if (value.length > 12) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
        } else if (value.length > 8) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d*).*/, '$1.$2.$3/$4');
        } else if (value.length > 5) {
            value = value.replace(/^(\d{2})(\d{3})(\d*).*/, '$1.$2.$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d*).*/, '$1.$2');
        }
        
        e.target.value = value;
    });

    // Adicionar máscara para o telefone
    const telefoneInput = document.getElementById('fornecedor-telefone');
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        // Formatação do telefone: (00) 00000-0000 ou (00) 0000-0000
        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{4})(\d*).*/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d*).*/, '($1) $2');
        }
        
        e.target.value = value;
    });
});

// Função para atualizar a tabela de fornecedores
function atualizarTabelaFornecedores(fornecedoresParaExibir = fornecedores) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    fornecedoresParaExibir.forEach(fornecedor => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${fornecedor.id}</td>
            <td>${fornecedor.nome}</td>
            <td>${fornecedor.cnpj}</td>
            <td>${fornecedor.telefone}</td>
            <td>${fornecedor.email}</td>
            <td>${fornecedor.contato}</td>
            <td class="action-btns">
                <a href="#" class="edit-btn" data-id="${fornecedor.id}">Editar</a>
                <a href="#" class="delete-btn" data-id="${fornecedor.id}">Excluir</a>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Adicionar listeners para os botões de edição e exclusão
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = parseInt(e.target.getAttribute('data-id'));
            editarFornecedor(id);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = parseInt(e.target.getAttribute('data-id'));
            excluirFornecedor(id);
        });
    });
}

// Função para salvar um fornecedor (novo ou edição)
function salvarFornecedor(e) {
    e.preventDefault();
    
    // Capturar dados do formulário
    const nome = document.getElementById('fornecedor-nome').value.trim();
    const cnpj = document.getElementById('fornecedor-cnpj').value.trim();
    const telefone = document.getElementById('fornecedor-telefone').value.trim();
    const email = document.getElementById('fornecedor-email').value.trim();
    const endereco = document.getElementById('fornecedor-endereco').value.trim();
    const contato = document.getElementById('fornecedor-contato').value.trim();

    // Validação básica
    if (!nome || !cnpj) {
        alert('Por favor, preencha os campos obrigatórios (Nome e CNPJ).');
        return;
    }

    // Validação do formato do CNPJ
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (!cnpjRegex.test(cnpj)) {
        alert('Por favor, informe um CNPJ válido no formato XX.XXX.XXX/XXXX-XX');
        return;
    }

    // Validação de email (se fornecido)
    if (email && !validarEmail(email)) {
        alert('Por favor, informe um e-mail válido.');
        return;
    }

    // Verificar duplicidade de CNPJ
    const cnpjExistente = fornecedores.find(f => 
        f.cnpj === cnpj && (!fornecedorEditando || f.id !== fornecedorEditando)
    );
    
    if (cnpjExistente) {
        alert('Este CNPJ já está cadastrado para outro fornecedor.');
        return;
    }

    // Verificar se é uma edição ou novo fornecedor
    if (fornecedorEditando) {
        // Edição - manter o mesmo ID
        const index = fornecedores.findIndex(f => f.id === fornecedorEditando);
        if (index !== -1) {
            fornecedores[index].nome = nome;
            fornecedores[index].cnpj = cnpj;
            fornecedores[index].telefone = telefone;
            fornecedores[index].email = email;
            fornecedores[index].endereco = endereco;
            fornecedores[index].contato = contato;
        }
        fornecedorEditando = null;
    } else {
        // Novo fornecedor - gerar novo ID
        const novoId = fornecedores.length > 0 ? Math.max(...fornecedores.map(f => f.id)) + 1 : 1;
        fornecedores.push({
            id: novoId,
            nome,
            cnpj,
            telefone,
            email,
            endereco,
            contato
        });
    }

    // Salvar no localStorage
    localStorage.setItem('fornecedores', JSON.stringify(fornecedores));

    // Atualizar tabela e limpar formulário
    atualizarTabelaFornecedores();
    limparFormulario();

    // Mostrar mensagem de sucesso
    alert('Fornecedor salvo com sucesso!');
}

// Função para validar email
function validarEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// Função para editar um fornecedor
function editarFornecedor(id) {
    const fornecedor = fornecedores.find(f => f.id === id);
    if (!fornecedor) return;

    // Preencher formulário com os dados do fornecedor
    document.getElementById('fornecedor-nome').value = fornecedor.nome;
    document.getElementById('fornecedor-cnpj').value = fornecedor.cnpj;
    document.getElementById('fornecedor-telefone').value = fornecedor.telefone;
    document.getElementById('fornecedor-email').value = fornecedor.email;
    document.getElementById('fornecedor-endereco').value = fornecedor.endereco || '';
    document.getElementById('fornecedor-contato').value = fornecedor.contato || '';

    // Marcar como editando
    fornecedorEditando = id;

    // Rolar para o formulário
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });

    // Alterar texto do botão para indicar que é uma edição
    document.querySelector('button[type="submit"]').textContent = 'Atualizar';
}

// Função para excluir um fornecedor
function excluirFornecedor(id) {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;

    // Verificar se o fornecedor está associado a produtos
    // Neste ponto, precisaria verificar na tabela de produtos
    // Aqui simulamos uma verificação básica, assumindo que o localStorage tem produtos
    const produtosGuardados = localStorage.getItem('produtos');
    if (produtosGuardados) {
        const produtos = JSON.parse(produtosGuardados);
        const produtosAssociados = produtos.filter(p => p.fornecedor === id.toString());
        
        if (produtosAssociados.length > 0) {
            alert('Este fornecedor não pode ser excluído porque está associado a produtos no estoque.');
            return;
        }
    }

    // Remover fornecedor do array
    fornecedores = fornecedores.filter(f => f.id !== id);

    // Atualizar localStorage
    localStorage.setItem('fornecedores', JSON.stringify(fornecedores));

    // Atualizar tabela
    atualizarTabelaFornecedores();

    // Se estiver editando o fornecedor que foi excluído, limpar o formulário
    if (fornecedorEditando === id) {
        limparFormulario();
    }

    // Mostrar mensagem de sucesso
    alert('Fornecedor excluído com sucesso!');
}

// Função para limpar o formulário
function limparFormulario() {
    document.querySelector('form').reset();
    fornecedorEditando = null;
    document.querySelector('button[type="submit"]').textContent = 'Salvar';
}

// Função para buscar fornecedores
function buscarFornecedores() {
    const termo = document.getElementById('buscar-fornecedor').value.toLowerCase().trim();
    
    if (!termo) {
        // Se não tiver termo de busca, exibir todos
        atualizarTabelaFornecedores();
        return;
    }

    // Filtrar fornecedores que contêm o termo de busca
    const fornecedoresFiltrados = fornecedores.filter(fornecedor => 
        fornecedor.nome.toLowerCase().includes(termo) || 
        fornecedor.cnpj.toLowerCase().includes(termo) || 
        (fornecedor.contato && fornecedor.contato.toLowerCase().includes(termo)) ||
        (fornecedor.email && fornecedor.email.toLowerCase().includes(termo))
    );

    // Atualizar tabela com resultados filtrados
    atualizarTabelaFornecedores(fornecedoresFiltrados);
}