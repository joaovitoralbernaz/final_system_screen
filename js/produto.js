// Sistema de Estoque de Farmácia - Cadastro de Produtos
// Autor: Claude
// Data: 16/05/2025

// Dados iniciais para teste (simulando banco de dados)
let produtos = [
    {
        id: 1,
        nome: "Paracetamol 500mg",
        codigo: "789456123",
        categoria: "medicamento",
        estoque: 50,
        preco: 9.90,
        fornecedor: "1"
    },
    {
        id: 2,
        nome: "Sabonete Neutro",
        codigo: "123789456",
        categoria: "higiene",
        estoque: 30,
        preco: 5.50,
        fornecedor: "2"
    }
];

// Mapeamento de valores de categoria para exibição
const categoriasMap = {
    "medicamento": "Medicamento",
    "higiene": "Higiene",
    "cosmetico": "Cosmético",
    "suplemento": "Suplemento"
};

// Mapeamento de valores de fornecedor para exibição
const fornecedoresMap = {
    "1": "MedFarma Distribuidora",
    "2": "Pharma Supply"
};

// Elemento sendo editado (para controle de edição)
let produtoEditando = null;

// Função para inicializar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Carregar produtos do localStorage se existirem
    const produtosGuardados = localStorage.getItem('produtos');
    if (produtosGuardados) {
        produtos = JSON.parse(produtosGuardados);
    }

    // Inicializar a tabela com os produtos existentes
    atualizarTabelaProdutos();

    // Configurar listeners para o formulário
    document.querySelector('form').addEventListener('submit', salvarProduto);
    document.querySelector('form').addEventListener('reset', limparFormulario);

    // Configurar listener para a busca
    document.querySelector('.search-container form').addEventListener('submit', function(e) {
        e.preventDefault();
        buscarProdutos();
    });
});

// Função para atualizar a tabela de produtos
function atualizarTabelaProdutos(produtosParaExibir = produtos) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    produtosParaExibir.forEach(produto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${produto.codigo}</td>
            <td>${categoriasMap[produto.categoria]}</td>
            <td>${produto.estoque}</td>
            <td>R$ ${produto.preco.toFixed(2).replace('.', ',')}</td>
            <td class="action-btns">
                <a href="#" class="edit-btn" data-id="${produto.id}">Editar</a>
                <a href="#" class="delete-btn" data-id="${produto.id}">Excluir</a>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Adicionar listeners para os botões de edição e exclusão
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = parseInt(e.target.getAttribute('data-id'));
            editarProduto(id);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = parseInt(e.target.getAttribute('data-id'));
            excluirProduto(id);
        });
    });
}

// Função para salvar um produto (novo ou edição)
function salvarProduto(e) {
    e.preventDefault();
    
    // Capturar dados do formulário
    const nome = document.getElementById('produto-nome').value.trim();
    const codigo = document.getElementById('produto-codigo').value.trim();
    const categoria = document.getElementById('produto-categoria').value;
    const estoque = parseInt(document.getElementById('produto-estoque').value);
    const preco = parseFloat(document.getElementById('produto-preco').value);
    const fornecedor = document.getElementById('produto-fornecedor').value;

    // Validação básica
    if (!nome || !categoria || isNaN(estoque) || isNaN(preco) || !fornecedor) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Verificar se é uma edição ou novo produto
    if (produtoEditando) {
        // Edição - manter o mesmo ID
        const index = produtos.findIndex(p => p.id === produtoEditando);
        if (index !== -1) {
            produtos[index].nome = nome;
            produtos[index].codigo = codigo;
            produtos[index].categoria = categoria;
            produtos[index].estoque = estoque;
            produtos[index].preco = preco;
            produtos[index].fornecedor = fornecedor;
        }
        produtoEditando = null;
    } else {
        // Novo produto - gerar novo ID
        const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
        produtos.push({
            id: novoId,
            nome,
            codigo,
            categoria,
            estoque,
            preco,
            fornecedor
        });
    }

    // Salvar no localStorage
    localStorage.setItem('produtos', JSON.stringify(produtos));

    // Atualizar tabela e limpar formulário
    atualizarTabelaProdutos();
    limparFormulario();

    // Mostrar mensagem de sucesso
    alert('Produto salvo com sucesso!');
}

// Função para editar um produto
function editarProduto(id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;

    // Preencher formulário com os dados do produto
    document.getElementById('produto-nome').value = produto.nome;
    document.getElementById('produto-codigo').value = produto.codigo;
    document.getElementById('produto-categoria').value = produto.categoria;
    document.getElementById('produto-estoque').value = produto.estoque;
    document.getElementById('produto-preco').value = produto.preco;
    document.getElementById('produto-fornecedor').value = produto.fornecedor;

    // Marcar como editando
    produtoEditando = id;

    // Rolar para o formulário
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });

    // Alterar texto do botão para indicar que é uma edição
    document.querySelector('button[type="submit"]').textContent = 'Atualizar';
}

// Função para excluir um produto
function excluirProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    // Remover produto do array
    produtos = produtos.filter(p => p.id !== id);

    // Atualizar localStorage
    localStorage.setItem('produtos', JSON.stringify(produtos));

    // Atualizar tabela
    atualizarTabelaProdutos();

    // Se estiver editando o produto que foi excluído, limpar o formulário
    if (produtoEditando === id) {
        limparFormulario();
    }

    // Mostrar mensagem de sucesso
    alert('Produto excluído com sucesso!');
}

// Função para limpar o formulário
function limparFormulario() {
    document.querySelector('form').reset();
    produtoEditando = null;
    document.querySelector('button[type="submit"]').textContent = 'Salvar';
}

// Função para buscar produtos
function buscarProdutos() {
    const termo = document.getElementById('buscar-produto').value.toLowerCase().trim();
    
    if (!termo) {
        // Se não tiver termo de busca, exibir todos
        atualizarTabelaProdutos();
        return;
    }

    // Filtrar produtos que contêm o termo de busca
    const produtosFiltrados = produtos.filter(produto => 
        produto.nome.toLowerCase().includes(termo) || 
        produto.codigo.toLowerCase().includes(termo) || 
        categoriasMap[produto.categoria].toLowerCase().includes(termo)
    );

    // Atualizar tabela com resultados filtrados
    atualizarTabelaProdutos(produtosFiltrados);
}

// Função para formatar valores monetários
function formatarMoeda(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}