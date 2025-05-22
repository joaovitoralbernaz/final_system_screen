document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário de filtro
    const filtroForm = document.querySelector('form[action="#"][method="get"]');
    const buscaInput = document.getElementById('busca');
    const categoriaSelect = document.getElementById('categoria');
    const fabricanteSelect = document.getElementById('fabricante');
    const situacaoSelect = document.getElementById('situacao');
    
    // Tabela de produtos
    const produtosTable = document.querySelector('section:nth-child(2) table');
    const produtosTbody = produtosTable.querySelector('tbody');
    const produtosLinks = document.querySelectorAll('section:nth-child(2) table a');
    
    // Detalhes de estoque
    const detalhesSection = document.querySelector('section:nth-child(3)');
    const detalhesH4 = detalhesSection.querySelector('h4');
    const detalhesTable = detalhesSection.querySelector('table');
    const detalhesTbody = detalhesTable.querySelector('tbody');
    
    // Tabela de histórico
    const historicoH4 = detalhesSection.querySelector('h4:nth-of-type(2)');
    const historicoTable = detalhesSection.querySelectorAll('table')[1];
    const historicoTbody = historicoTable.querySelector('tbody');
    
    // Alertas
    const alertaLinks = document.querySelectorAll('section:nth-child(4) a');
    
    // Formulário de cadastro rápido
    const cadastroForm = document.querySelector('form[action="#"][method="post"]');
    
    // Paginação
    const paginacaoLinks = document.querySelectorAll('section:nth-child(2) > div a');
    
    // Exportar link
    const exportarLink = document.querySelector('a[href="#"]:nth-of-type(1)');
    
    // Inicializações
    inicializarEventos();
    esconderDetalhes(); // Esconde a seção de detalhes inicialmente
    
    // Funções
    function inicializarEventos() {
        // Eventos do formulário de filtro
        if (filtroForm) {
            filtroForm.addEventListener('submit', filtrarProdutos);
            filtroForm.querySelector('button[type="reset"]').addEventListener('click', limparFiltros);
        }
        
        // Adicionar eventos aos links de detalhe/movimentar/editar
        produtosLinks.forEach(link => {
            if (link.textContent.trim() === 'Detalhes') {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    mostrarDetalhes(this.closest('tr'));
                });
            } else if (link.textContent.trim() === 'Movimentar') {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    redirecionarParaMovimento(this.closest('tr'));
                });
            } else if (link.textContent.trim() === 'Editar') {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    preencherFormularioCadastro(this.closest('tr'));
                });
            }
        });
        
        // Adicionar eventos aos links de alerta
        alertaLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                filtrarPorProduto(this.textContent);
            });
        });
        
        // Evento para o cadastro de produto
        if (cadastroForm) {
            cadastroForm.addEventListener('submit', cadastrarProduto);
        }
        
        // Eventos para os links de paginação
        paginacaoLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                mudarPagina(this.textContent);
            });
        });
        
        // Evento para exportar
        if (exportarLink) {
            exportarLink.addEventListener('click', function(e) {
                e.preventDefault();
                exportarDados();
            });
        }
    }
    
    function filtrarProdutos(event) {
        event.preventDefault();
        
        const busca = buscaInput.value.toLowerCase();
        const categoria = categoriaSelect.value;
        const fabricante = fabricanteSelect.value;
        const situacao = situacaoSelect.value;
        
        // Obter todas as linhas da tabela de produtos
        const linhas = produtosTbody.querySelectorAll('tr');
        
        // Contador para linhas visíveis
        let linhasVisiveis = 0;
        
        // Filtrar as linhas da tabela
        linhas.forEach(linha => {
            const codigo = linha.cells[0].textContent.toLowerCase();
            const nome = linha.cells[1].textContent.toLowerCase();
            const categoriaLinha = linha.cells[3].textContent;
            const fabricanteLinha = linha.cells[4].textContent;
            const situacaoLinha = linha.cells[9].textContent;
            
            // Aplicar filtros
            const atendeBusca = busca === '' || 
                               codigo.includes(busca) || 
                               nome.includes(busca);
            
            const atendeCategoria = categoria === '' || 
                                   (categoria === '1' && categoriaLinha === 'Antibióticos') ||
                                   (categoria === '2' && categoriaLinha === 'Anti-inflamatórios') ||
                                   (categoria === '3' && categoriaLinha === 'Analgésicos') ||
                                   (categoria === '4' && categoriaLinha === 'Controlados') ||
                                   (categoria === '5' && categoriaLinha === 'Vitaminas e Suplementos') ||
                                   (categoria === '6' && categoriaLinha === 'Dermocosméticos');
            
            const atendeFabricante = fabricante === '' || 
                                    (fabricante === '1' && fabricanteLinha === 'EMS') ||
                                    (fabricante === '2' && fabricanteLinha === 'Medley') ||
                                    (fabricante === '3' && fabricanteLinha === 'Neo Química') ||
                                    (fabricante === '4' && fabricanteLinha === 'Eurofarma') ||
                                    (fabricante === '5' && fabricanteLinha === 'Aché');
            
            const atendeSituacao = situacao === '' || 
                                  (situacao === 'normal' && situacaoLinha === 'Normal') ||
                                  (situacao === 'baixo' && situacaoLinha === 'Estoque Baixo') ||
                                  (situacao === 'zerado' && situacaoLinha === 'Estoque Zerado') ||
                                  (situacao === 'vencido' && situacaoLinha === 'Vencido') ||
                                  (situacao === 'a_vencer' && situacaoLinha === 'A vencer');
            
            // Aplica o resultado dos filtros
            if (atendeBusca && atendeCategoria && atendeFabricante && atendeSituacao) {
                linha.style.display = '';
                linhasVisiveis++;
            } else {
                linha.style.display = 'none';
            }
        });
        
        // Atualiza o contador de exibição
        atualizarContadorExibicao(linhasVisiveis);
        
        // Esconde a seção de detalhes quando aplica filtro
        esconderDetalhes();
    }
    
    function limparFiltros() {
        // Limpa os valores dos filtros
        buscaInput.value = '';
        categoriaSelect.value = '';
        fabricanteSelect.value = '';
        situacaoSelect.value = '';
        
        // Mostra todas as linhas da tabela
        const linhas = produtosTbody.querySelectorAll('tr');
        linhas.forEach(linha => {
            linha.style.display = '';
        });
        
        // Atualiza o contador de exibição
        atualizarContadorExibicao(linhas.length);
        
        // Esconde a seção de detalhes
        esconderDetalhes();
    }
    
    function mostrarDetalhes(produtoLinha) {
        // Obtém os dados do produto selecionado
        const codigo = produtoLinha.cells[0].textContent;
        const nome = produtoLinha.cells[1].textContent;
        
        // Atualiza o título da seção de detalhes
        detalhesH4.textContent = `${nome} - ${codigo}`;
        
        // Carrega os detalhes do produto (em um sistema real, isso seria uma chamada AJAX)
        carregarDetalhesEstoque(codigo);
        carregarHistoricoMovimentacoes(codigo);
        
        // Mostra a seção de detalhes
        detalhesSection.style.display = 'block';
        
        // Rola para a seção de detalhes
        detalhesSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function esconderDetalhes() {
        // Esconde a seção de detalhes
        detalhesSection.style.display = 'none';
    }
    
    function carregarDetalhesEstoque(codigo) {
        // Em um sistema real, isso seria uma chamada AJAX para obter os dados do servidor
        // Aqui vamos simular com dados fixos
        
        // Limpa a tabela de detalhes
        detalhesTbody.innerHTML = '';
        
        // Adiciona os dados do produto
        if (codigo === 'MED001') {
            detalhesTbody.innerHTML = `
                <tr>
                    <td>LOT123456</td>
                    <td>01/2024</td>
                    <td>12/2026</td>
                    <td>100</td>
                    <td>Prateleira A-15</td>
                    <td>Normal</td>
                </tr>
                <tr>
                    <td>LOT123457</td>
                    <td>02/2024</td>
                    <td>01/2027</td>
                    <td>50</td>
                    <td>Prateleira A-16</td>
                    <td>Normal</td>
                </tr>
            `;
        } else if (codigo === 'MED002') {
            detalhesTbody.innerHTML = `
                <tr>
                    <td>LOT789012</td>
                    <td>01/2024</td>
                    <td>10/2025</td>
                    <td>25</td>
                    <td>Prateleira B-10</td>
                    <td>Estoque Baixo</td>
                </tr>
            `;
        } else if (codigo === 'MED003') {
            detalhesTbody.innerHTML = `
                <tr>
                    <td>LOT345678</td>
                    <td>12/2023</td>
                    <td>06/2025</td>
                    <td>0</td>
                    <td>Prateleira C-05</td>
                    <td>Estoque Zerado</td>
                </tr>
            `;
        } else if (codigo === 'MED004') {
            detalhesTbody.innerHTML = `
                <tr>
                    <td>LOT901234</td>
                    <td>12/2023</td>
                    <td>06/2025</td>
                    <td>80</td>
                    <td>Prateleira D-20</td>
                    <td>A vencer</td>
                </tr>
            `;
        } else if (codigo === 'MED005') {
            detalhesTbody.innerHTML = `
                <tr>
                    <td>LOT567890</td>
                    <td>03/2024</td>
                    <td>09/2026</td>
                    <td>120</td>
                    <td>Prateleira E-15</td>
                    <td>Normal</td>
                </tr>
                <tr>
                    <td>LOT567891</td>
                    <td>04/2024</td>
                    <td>10/2026</td>
                    <td>80</td>
                    <td>Prateleira E-16</td>
                    <td>Normal</td>
                </tr>
            `;
        } else {
            // Produto genérico se não for um dos conhecidos
            detalhesTbody.innerHTML = `
                <tr>
                    <td>LOTGENERIC</td>
                    <td>01/2024</td>
                    <td>01/2026</td>
                    <td>50</td>
                    <td>Prateleira X-00</td>
                    <td>Normal</td>
                </tr>
            `;
        }
        
        // Calcula e atualiza o total
        atualizarTotalEstoque();
    }
    
    function carregarHistoricoMovimentacoes(codigo) {
        // Em um sistema real, isso seria uma chamada AJAX para obter os dados do servidor
        // Aqui vamos simular com dados fixos
        
        // Limpa a tabela de histórico
        historicoTbody.innerHTML = '';
        
        // Adiciona os dados do histórico
        if (codigo === 'MED001') {
            historicoTbody.innerHTML = `
                <tr>
                    <td>14/05/2025</td>
                    <td>Entrada</td>
                    <td>LOT123457</td>
                    <td>+50</td>
                    <td>Maria Oliveira</td>
                    <td>Recebimento NF 12345</td>
                </tr>
                <tr>
                    <td>10/05/2025</td>
                    <td>Saída</td>
                    <td>LOT123456</td>
                    <td>-10</td>
                    <td>João Silva</td>
                    <td>Venda balcão</td>
                </tr>
                <tr>
                    <td>01/05/2025</td>
                    <td>Entrada</td>
                    <td>LOT123456</td>
                    <td>+110</td>
                    <td>Pedro Santos</td>
                    <td>Recebimento NF 12300</td>
                </tr>
            `;
        } else if (codigo === 'MED002') {
            historicoTbody.innerHTML = `
                <tr>
                    <td>12/05/2025</td>
                    <td>Saída</td>
                    <td>LOT789012</td>
                    <td>-15</td>
                    <td>João Silva</td>
                    <td>Venda balcão</td>
                </tr>
                <tr>
                    <td>05/05/2025</td>
                    <td>Entrada</td>
                    <td>LOT789012</td>
                    <td>+40</td>
                    <td>Maria Oliveira</td>
                    <td>Recebimento NF 12340</td>
                </tr>
            `;
        } else if (codigo === 'MED003') {
            historicoTbody.innerHTML = `
                <tr>
                    <td>13/05/2025</td>
                    <td>Saída</td>
                    <td>LOT345678</td>
                    <td>-5</td>
                    <td>João Silva</td>
                    <td>Venda balcão</td>
                </tr>
                <tr>
                    <td>08/05/2025</td>
                    <td>Saída</td>
                    <td>LOT345678</td>
                    <td>-10</td>
                    <td>Pedro Santos</td>
                    <td>Transferência filial</td>
                </tr>
                <tr>
                    <td>01/05/2025</td>
                    <td>Entrada</td>
                    <td>LOT345678</td>
                    <td>+15</td>
                    <td>Ana Souza</td>
                    <td>Recebimento NF 12320</td>
                </tr>
            `;
        } else if (codigo === 'MED004' || codigo === 'MED005') {
            historicoTbody.innerHTML = `
                <tr>
                    <td>15/05/2025</td>
                    <td>Entrada</td>
                    <td>LOT${codigo === 'MED004' ? '901234' : '567890'}</td>
                    <td>+${codigo === 'MED004' ? '80' : '120'}</td>
                    <td>Ana Souza</td>
                    <td>Recebimento NF 12350</td>
                </tr>
            `;
            if (codigo === 'MED005') {
                historicoTbody.innerHTML += `
                    <tr>
                        <td>14/05/2025</td>
                        <td>Entrada</td>
                        <td>LOT567891</td>
                        <td>+80</td>
                        <td>Pedro Santos</td>
                        <td>Recebimento NF 12351</td>
                    </tr>
                `;
            }
        } else {
            // Histórico genérico se não for um dos conhecidos
            historicoTbody.innerHTML = `
                <tr>
                    <td>15/05/2025</td>
                    <td>Entrada</td>
                    <td>LOTGENERIC</td>
                    <td>+50</td>
                    <td>Ana Souza</td>
                    <td>Recebimento NF 12350</td>
                </tr>
            `;
        }
    }
    
    function atualizarTotalEstoque() {
        // Calcula o total de estoque a partir das linhas da tabela de detalhes
        let total = 0;
        const quantidadesCells = detalhesTbody.querySelectorAll('tr td:nth-child(4)');
        
        quantidadesCells.forEach(cell => {
            total += parseInt(cell.textContent, 10) || 0;
        });
        
        // Atualiza o valor total no rodapé da tabela
        const totalCell = detalhesTable.querySelector('tfoot tr td:nth-child(2)');
        if (totalCell) {
            totalCell.textContent = total;
        }
    }
    
    function redirecionarParaMovimento(produtoLinha) {
        // Obtém os dados do produto
        const codigo = produtoLinha.cells[0].textContent;
        const nome = produtoLinha.cells[1].textContent;
        
        // Em um sistema real, redirecionaria para a página de movimento com os parâmetros
        // Aqui apenas simulamos com um alerta
        alert(`Redirecionando para página de movimento para: ${nome} (${codigo})`);
        
        // Simula redirecionamento
        window.location.href = `movimento.html?produto=${codigo}`;
    }
    
    function preencherFormularioCadastro(produtoLinha) {
        // Obtém os dados do produto
        const codigo = produtoLinha.cells[0].textContent;
        const nome = produtoLinha.cells[1].textContent;
        const principioAtivo = produtoLinha.cells[2].textContent;
        const categoria = produtoLinha.cells[3].textContent;
        const fabricante = produtoLinha.cells[4].textContent;
        const estoqueMinimo = produtoLinha.cells[8].textContent;
        
        // Preenche o formulário de cadastro
        document.getElementById('codigo').value = codigo;
        document.getElementById('nome_produto').value = nome;
        document.getElementById('principio_ativo').value = principioAtivo;
        
        // Seleciona a categoria correta
        const categoriaSelect = document.getElementById('categoria_produto');
        for (let i = 0; i < categoriaSelect.options.length; i++) {
            if (categoriaSelect.options[i].text === categoria) {
                categoriaSelect.selectedIndex = i;
                break;
            }
        }
        
        // Seleciona o fabricante correto
        const fabricanteSelect = document.getElementById('fabricante_produto');
        for (let i = 0; i < fabricanteSelect.options.length; i++) {
            if (fabricanteSelect.options[i].text === fabricante) {
                fabricanteSelect.selectedIndex = i;
                break;
            }
        }
        
        document.getElementById('estoque_minimo').value = estoqueMinimo;
        
        // Rola para o formulário de cadastro
        cadastroForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    function filtrarPorProduto(nomeProduto) {
        // Limpa e ajusta o nome do produto
        const nome = nomeProduto.trim();
        
        // Preenche o campo de busca
        buscaInput.value = nome;
        
        // Aciona o filtro
        filtrarProdutos(new Event('submit'));
    }
    
    function cadastrarProduto(event) {
        event.preventDefault();
        
        // Valida o formulário
        const codigo = document.getElementById('codigo').value;
        const nome = document.getElementById('nome_produto').value;
        const principioAtivo = document.getElementById('principio_ativo').value;
        const categoria = document.getElementById('categoria_produto').value;
        const fabricante = document.getElementById('fabricante_produto').value;
        const estoqueMinimo = document.getElementById('estoque_minimo').value;
        
        if (!codigo || !nome || !principioAtivo || !categoria || !fabricante || !estoqueMinimo) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Em um sistema real, enviaria os dados para o servidor
        // Aqui apenas simulamos com um alerta de sucesso
        alert(`Produto cadastrado com sucesso!\nCódigo: ${codigo}\nNome: ${nome}`);
        
        // Limpa o formulário
        cadastroForm.reset();
        
        // Simula a adição do produto na tabela (em um sistema real, isso seria feito com uma atualização da página)
        const novoProduto = document.createElement('tr');
        novoProduto.innerHTML = `
            <td>${codigo}</td>
            <td>${nome}</td>
            <td>${principioAtivo}</td>
            <td>${document.getElementById('categoria_produto').options[document.getElementById('categoria_produto').selectedIndex].text}</td>
            <td>${document.getElementById('fabricante_produto').options[document.getElementById('fabricante_produto').selectedIndex].text}</td>
            <td>NOVO</td>
            <td>N/A</td>
            <td>0</td>
            <td>${estoqueMinimo}</td>
            <td>Estoque Zerado</td>
            <td>
                <a href="#">Detalhes</a> | 
                <a href="#">Movimentar</a> | 
                <a href="#">Editar</a>
            </td>
        `;
        produtosTbody.appendChild(novoProduto);
        
        // Adiciona os event listeners aos novos links
        const novosProdutosLinks = novoProduto.querySelectorAll('a');
        novosProdutosLinks.forEach(link => {
            if (link.textContent.trim() === 'Detalhes') {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    mostrarDetalhes(this.closest('tr'));
                });
            } else if (link.textContent.trim() === 'Movimentar') {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    redirecionarParaMovimento(this.closest('tr'));
                });
            } else if (link.textContent.trim() === 'Editar') {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    preencherFormularioCadastro(this.closest('tr'));
                });
            }
        });
        
        // Atualiza o contador de exibição
        atualizarContadorExibicao(produtosTbody.querySelectorAll('tr').length);
    }
    
    function mudarPagina(direcao) {
        // Simula a mudança de página (em um sistema real, isso seria feito com uma chamada AJAX)
        alert(`Navegando para ${direcao}`);
    }
    
    function exportarDados() {
        // Em um sistema real, isso geraria um arquivo CSV ou Excel
        // Aqui apenas simulamos com um alerta
        alert('Exportando dados para CSV...');
        
        // Dados visíveis na tabela (apenas os não ocultos)
        const linhasVisiveis = Array.from(produtosTbody.querySelectorAll('tr')).filter(
            linha => linha.style.display !== 'none'
        );
        
        // Cria o cabeçalho do CSV
        let csv = 'Código,Nome,Princípio Ativo,Categoria,Fabricante,Lote,Validade,Estoque Atual,Estoque Mínimo,Situação\n';
        
        // Adiciona cada linha visível
        linhasVisiveis.forEach(linha => {
            const colunas = linha.querySelectorAll('td');
            const linha_csv = [
                colunas[0].textContent, // Código
                `"${colunas[1].textContent}"`, // Nome
                `"${colunas[2].textContent}"`, // Princípio Ativo
                `"${colunas[3].textContent}"`, // Categoria
                `"${colunas[4].textContent}"`, // Fabricante
                colunas[5].textContent, // Lote
                colunas[6].textContent, // Validade
                colunas[7].textContent, // Estoque Atual
                colunas[8].textContent, // Estoque Mínimo
                `"${colunas[9].textContent}"` // Situação
            ].join(',');
            
            csv += linha_csv + '\n';
        });
        
        // Em um sistema real, isso faria o download do arquivo
        console.log('Dados CSV:');
        console.log(csv);
    }
    
    function atualizarContadorExibicao(numeroLinhasVisiveis) {
        // Atualiza o texto do contador de exibição
        const contadorElement = document.querySelector('section:nth-child(2) > div > p:first-child');
        if (contadorElement) {
            contadorElement.textContent = `Exibindo ${numeroLinhasVisiveis} de 250 produtos`;
        }
    }
});