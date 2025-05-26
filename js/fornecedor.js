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
        cep: "01310-100",
        logradouro: "Av. Paulista",
        numero: "1000",
        complemento: "Sala 501",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "SP",
        contatoNome: "Carlos Silva",
        contatoCargo: "Gerente Comercial",
        contatoTelefone: "(11) 99999-1111",
        contatoEmail: "carlos@medfarma.com"
    },
    {
        id: 2,
        nome: "Pharma Supply",
        cnpj: "98.765.432/0001-10",
        telefone: "(21) 4444-5555",
        email: "contato@pharmasupply.com",
        cep: "20040-020",
        logradouro: "Av. Rio Branco",
        numero: "500",
        complemento: "",
        bairro: "Centro",
        cidade: "Rio de Janeiro",
        estado: "RJ",
        contatoNome: "Ana Oliveira",
        contatoCargo: "Vendedora",
        contatoTelefone: "(21) 88888-2222",
        contatoEmail: "ana@pharmasupply.com"
    }
];

// Elemento sendo editado (para controle de edição)
let fornecedorEditando = null;

// Função para inicializar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar a tabela com os fornecedores existentes
    atualizarTabelaFornecedores();

    // Configurar listeners para o formulário
    const form = document.querySelector('form[action="#"]');
    if (form) {
        form.addEventListener('submit', salvarFornecedor);
        form.addEventListener('reset', limparFormulario);
    }

    // Configurar listener para a busca
    const searchForm = document.querySelector('.search-container form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            buscarFornecedores();
        });
    }

    // Adicionar máscara para o CNPJ
    const cnpjInput = document.getElementById('fornecedor-cnpj');
    if (cnpjInput) {
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
    }

    // Adicionar máscara para o telefone
    const telefoneInput = document.getElementById('fornecedor-telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatarTelefone);
    }

    // Adicionar máscara para o telefone do contato
    const contatoTelefoneInput = document.getElementById('fornecedor-contato-telefone');
    if (contatoTelefoneInput) {
        contatoTelefoneInput.addEventListener('input', formatarTelefone);
    }

    // Adicionar máscara para o CEP e busca automática
    const cepInput = document.getElementById('fornecedor-cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);
            
            // Formatação do CEP: 00000-000
            if (value.length > 5) {
                value = value.replace(/^(\d{5})(\d*).*/, '$1-$2');
            }
            
            e.target.value = value;
        });

        // Buscar CEP quando o campo perder o foco
        cepInput.addEventListener('blur', function(e) {
            const cep = e.target.value.replace(/\D/g, '');
            if (cep.length === 8) {
                buscarCEP(cep);
            }
        });
    }
});

// Função para buscar CEP usando a API do ViaCEP
async function buscarCEP(cep) {
    try {
        // Mostrar indicador de loading
        const cepInput = document.getElementById('fornecedor-cep');
        const originalPlaceholder = cepInput.placeholder;
        cepInput.placeholder = 'Buscando CEP...';
        cepInput.disabled = true;

        // Fazer a requisição para a API
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        // Restaurar o campo CEP
        cepInput.placeholder = originalPlaceholder;
        cepInput.disabled = false;

        // Verificar se o CEP foi encontrado
        if (data.erro) {
            alert('CEP não encontrado. Verifique se o número está correto.');
            return;
        }

        // Preencher os campos com os dados retornados
        preencherEnderecoViaCEP(data);

    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar CEP. Verifique sua conexão com a internet.');
        
        // Restaurar o campo CEP em caso de erro
        const cepInput = document.getElementById('fornecedor-cep');
        cepInput.placeholder = '00000-000';
        cepInput.disabled = false;
    }
}

// Função para preencher os campos de endereço com dados do ViaCEP
function preencherEnderecoViaCEP(dadosCEP) {
    // Mapear os campos do ViaCEP para os campos do formulário
    const campos = [
        { api: 'logradouro', form: 'fornecedor-logradouro' },
        { api: 'bairro', form: 'fornecedor-bairro' },
        { api: 'localidade', form: 'fornecedor-cidade' },
        { api: 'uf', form: 'fornecedor-estado' }
    ];

    // Preencher cada campo se o valor existir na resposta da API
    campos.forEach(campo => {
        const elemento = document.getElementById(campo.form);
        if (elemento && dadosCEP[campo.api]) {
            elemento.value = dadosCEP[campo.api];
        }
    });

    // Focar no campo número após preencher o endereço
    const numeroField = document.getElementById('fornecedor-numero');
    if (numeroField) {
        numeroField.focus();
    }

    // Mostrar mensagem de sucesso
    console.log('Endereço preenchido automaticamente via CEP');
}

// Função para formatar telefone
function formatarTelefone(e) {
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
}

// Função para atualizar a tabela de fornecedores
function atualizarTabelaFornecedores(fornecedoresParaExibir = fornecedores) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    fornecedoresParaExibir.forEach(fornecedor => {
        const tr = document.createElement('tr');
        const cidadeEstado = fornecedor.cidade && fornecedor.estado ? 
            `${fornecedor.cidade}/${fornecedor.estado}` : '-';
        
        tr.innerHTML = `
            <td data-label="ID">${fornecedor.id}</td>
            <td data-label="Nome">${fornecedor.nome}</td>
            <td data-label="CNPJ">${fornecedor.cnpj}</td>
            <td data-label="Telefone">${fornecedor.telefone || '-'}</td>
            <td data-label="Email">${fornecedor.email || '-'}</td>
            <td data-label="Cidade/UF">${cidadeEstado}</td>
            <td data-label="Contato">${fornecedor.contatoNome || '-'}</td>
            <td data-label="Ações" class="action-btns">
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

// Função para capturar todos os dados do formulário
function capturarDadosFormulario() {
    return {
        nome: document.getElementById('fornecedor-nome')?.value.trim() || '',
        cnpj: document.getElementById('fornecedor-cnpj')?.value.trim() || '',
        telefone: document.getElementById('fornecedor-telefone')?.value.trim() || '',
        email: document.getElementById('fornecedor-email')?.value.trim() || '',
        cep: document.getElementById('fornecedor-cep')?.value.trim() || '',
        logradouro: document.getElementById('fornecedor-logradouro')?.value.trim() || '',
        numero: document.getElementById('fornecedor-numero')?.value.trim() || '',
        complemento: document.getElementById('fornecedor-complemento')?.value.trim() || '',
        bairro: document.getElementById('fornecedor-bairro')?.value.trim() || '',
        cidade: document.getElementById('fornecedor-cidade')?.value.trim() || '',
        estado: document.getElementById('fornecedor-estado')?.value.trim() || '',
        contatoNome: document.getElementById('fornecedor-contato-nome')?.value.trim() || '',
        contatoCargo: document.getElementById('fornecedor-contato-cargo')?.value.trim() || '',
        contatoTelefone: document.getElementById('fornecedor-contato-telefone')?.value.trim() || '',
        contatoEmail: document.getElementById('fornecedor-contato-email')?.value.trim() || ''
    };
}

// Função para preencher o formulário com dados do fornecedor
function preencherFormulario(fornecedor) {
    const campos = {
        'fornecedor-nome': fornecedor.nome,
        'fornecedor-cnpj': fornecedor.cnpj,
        'fornecedor-telefone': fornecedor.telefone,
        'fornecedor-email': fornecedor.email,
        'fornecedor-cep': fornecedor.cep,
        'fornecedor-logradouro': fornecedor.logradouro,
        'fornecedor-numero': fornecedor.numero,
        'fornecedor-complemento': fornecedor.complemento,
        'fornecedor-bairro': fornecedor.bairro,
        'fornecedor-cidade': fornecedor.cidade,
        'fornecedor-estado': fornecedor.estado,
        'fornecedor-contato-nome': fornecedor.contatoNome,
        'fornecedor-contato-cargo': fornecedor.contatoCargo,
        'fornecedor-contato-telefone': fornecedor.contatoTelefone,
        'fornecedor-contato-email': fornecedor.contatoEmail
    };

    Object.entries(campos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = valor || '';
        }
    });
}

// Função para salvar um fornecedor (novo ou edição)
function salvarFornecedor(e) {
    e.preventDefault();
    
    // Capturar dados do formulário
    const formData = capturarDadosFormulario();

    // Validação básica
    if (!formData.nome || !formData.cnpj) {
        alert('Por favor, preencha os campos obrigatórios (Nome e CNPJ).');
        return;
    }

    // Validação do formato do CNPJ
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (!cnpjRegex.test(formData.cnpj)) {
        alert('Por favor, informe um CNPJ válido no formato XX.XXX.XXX/XXXX-XX');
        return;
    }

    // Validação do formato do CEP (se preenchido)
    if (formData.cep) {
        const cepRegex = /^\d{5}-\d{3}$/;
        if (!cepRegex.test(formData.cep)) {
            alert('Por favor, informe um CEP válido no formato XXXXX-XXX');
            return;
        }
    }

    // Validação de email (se fornecido)
    if (formData.email && !validarEmail(formData.email)) {
        alert('Por favor, informe um e-mail válido.');
        return;
    }

    if (formData.contatoEmail && !validarEmail(formData.contatoEmail)) {
        alert('Por favor, informe um e-mail válido para o contato.');
        return;
    }

    // Verificar duplicidade de CNPJ
    const cnpjExistente = fornecedores.find(f => 
        f.cnpj === formData.cnpj && (!fornecedorEditando || f.id !== fornecedorEditando)
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
            fornecedores[index] = { ...formData, id: fornecedorEditando };
        }
        fornecedorEditando = null;
    } else {
        // Novo fornecedor - gerar novo ID
        const novoId = fornecedores.length > 0 ? Math.max(...fornecedores.map(f => f.id)) + 1 : 1;
        fornecedores.push({ ...formData, id: novoId });
    }

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
    preencherFormulario(fornecedor);

    // Marcar como editando
    fornecedorEditando = id;

    // Rolar para o formulário
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Alterar texto do botão para indicar que é uma edição
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Atualizar';
    }
}

// Função para excluir um fornecedor
function excluirFornecedor(id) {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;

    // Verificar se o fornecedor está associado a produtos
    // Simulação de verificação (assumindo que existe uma estrutura de produtos)
    const produtosAssociados = []; // Aqui verificaria se há produtos associados
    
    if (produtosAssociados.length > 0) {
        alert('Este fornecedor não pode ser excluído porque está associado a produtos no estoque.');
        return;
    }

    // Remover fornecedor do array
    fornecedores = fornecedores.filter(f => f.id !== id);

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
    const form = document.querySelector('form[action="#"]');
    if (form) {
        form.reset();
    }
    fornecedorEditando = null;
    
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Salvar';
    }
}

// Função para buscar fornecedores
function buscarFornecedores() {
    const termo = document.getElementById('buscar-fornecedor')?.value.toLowerCase().trim() || '';
    
    if (!termo) {
        // Se não tiver termo de busca, exibir todos
        atualizarTabelaFornecedores();
        return;
    }

    // Filtrar fornecedores que contêm o termo de busca
    const fornecedoresFiltrados = fornecedores.filter(fornecedor => 
        fornecedor.nome.toLowerCase().includes(termo) || 
        fornecedor.cnpj.toLowerCase().includes(termo) || 
        (fornecedor.contatoNome && fornecedor.contatoNome.toLowerCase().includes(termo)) ||
        (fornecedor.email && fornecedor.email.toLowerCase().includes(termo)) ||
        (fornecedor.cidade && fornecedor.cidade.toLowerCase().includes(termo)) ||
        (fornecedor.contatoEmail && fornecedor.contatoEmail.toLowerCase().includes(termo))
    );

    // Atualizar tabela com resultados filtrados
    atualizarTabelaFornecedores(fornecedoresFiltrados);
}