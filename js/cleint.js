// Configuração do Supabase (Verifique se as variáveis estão com os nomes corretos)
const hrlSupabase = "https://fsqsgpfwtmhaojkmlaso.supabase.co";
const chaveSupabase = "sb_publishable_VrOzm8fbWAGjQlHFdg022w_VIYW_Mgv";

const serverSupabase = supabase.createClient(hrlSupabase, chaveSupabase);

async function pegarDadosProdutos(id_produto) {
    
    let converter_id = id_produto.toString();



    const {data: data3, error: error3} = await serverSupabase
        .from("pizzas")
        .select("nome")
        .eq("id", id_produto)
        .single();

    if(data3){
        const nomeProduto = document.getElementById("nome_produto_" + converter_id);
        nomeProduto.textContent = data3.nome;

        const btnPedir = document.querySelector('.btn-pedir[data-nome="produto"]');
        btnPedir.setAttribute('data-nome', data3.nome);
    }
    // 1. Buscamos apenas o preço da pizza com ID 35
    const { data, error } = await serverSupabase
        .from("pizzas")
        .select("preco")
        .eq("id", id_produto)
        .single(); // Pega o objeto direto

    // 2. Se houver erro (Ex: ID 35 não existe mais)
    if (error) {
        console.error("Erro ao buscar preço:", error.message);
        return;
    }

    // 3. Se os dados existirem, atualizamos o SPAN
    if (data) {
        const spanPreco = document.getElementById("preco_" + converter_id);

        // Transformamos o número em formato de moeda Brasileira (R$ 45,00)
        const precoFormatado = parseFloat(data.preco).toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL'
        });

        spanPreco.textContent = precoFormatado;

        // Atualiza o data-preco no botão da Calabresa para o carrinho funcionar com o preço real
        const btnCalabresa = document.querySelector('button[data-nome="Calabresa"]');
        if (btnCalabresa) {
            btnCalabresa.setAttribute('data-preco', data.preco);
        }
    }
    const { data: data2, error: error2 } = await serverSupabase
        .from("pizzas")
        .select("descricao")
        .eq("id", id_produto)
        .single();
    if (data2) {
        const spanPreco = document.getElementById("descricao_" + converter_id);
        spanPreco.textContent = data2.descricao;
    }
}

async function espera() {

    for(let i = 1; i <= 1000; i++){
        pegarDadosProdutos(i);
        await espera(50)
    }
}

espera();


// --- LÓGICA DO CARRINHO DE COMPRAS ---
let pedido = [];

// Adiciona evento aos botões "Adicionar ao Pedido"
const botoesPedir = document.querySelectorAll('.btn-pedir');
botoesPedir.forEach(botao => {
    botao.addEventListener('click', function () {
        const card = this.closest('.pizza-info');
        const nomePizza = this.getAttribute('data-nome');

        // Pega o preço atual (pode ter sido atualizado pelo Supabase)
        const precoBase = parseFloat(this.getAttribute('data-preco'));

        const selectTamanho = card.querySelector('.tamanho-pizza');
        const tamanho = selectTamanho.value; // "Inteira" ou "Meia"

        let precoFinal = precoBase;
        if (tamanho === "Meia") {
            precoFinal = precoBase / 2;
        }

        pedido.push({
            nome: nomePizza,
            tamanho: tamanho,
            preco: precoFinal
        });

        atualizarCarrinho();

        // Pequeno feedback visual
        const textoOriginal = this.textContent;
        this.textContent = "Adicionado! ✔️";
        this.style.backgroundColor = "#25d366";
        setTimeout(() => {
            this.textContent = textoOriginal;
            this.style.backgroundColor = "#ffc107"; // volta pra cor original
        }, 1500);
    });
});

function atualizarCarrinho() {
    const iconeCarrinho = document.getElementById('icone-carrinho');
    const contadorCarrinho = document.getElementById('contador-carrinho');
    const carrinhoFlutuante = document.getElementById('carrinho-flutuante');
    const listaCarrinho = document.getElementById('lista-carrinho');
    const totalCarrinho = document.getElementById('total-carrinho');

    // Mostra o carrinho se houver itens
    if (pedido.length > 0) {
        iconeCarrinho.style.display = 'flex';
        contadorCarrinho.textContent = pedido.length;
    } else {
        iconeCarrinho.style.display = 'none';
        carrinhoFlutuante.style.display = 'none';
    }

    listaCarrinho.innerHTML = '';
    let total = 0;

    pedido.forEach((item, index) => {
        total += item.preco;

        const li = document.createElement('li');
        li.style.marginBottom = '8px';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';

        const nomeFormatado = item.tamanho === 'Meia' ? `1/2 ${item.nome}` : `1 ${item.nome}`;

        li.innerHTML = `
            <span>${nomeFormatado}</span>
            <span>
                R$ ${item.preco.toFixed(2).replace('.', ',')}
                <button onclick="removerDoCarrinho(${index})" style="background: none; border: none; color: #d32f2f; cursor: pointer; font-size: 0.8rem; margin-left: 10px; text-decoration: underline;">Remover</button>
            </span>
        `;
        listaCarrinho.appendChild(li);
    });

    totalCarrinho.textContent = total.toFixed(2).replace('.', ',');
}

// Para ser chamada no onclick do HTML, precisa ser global
window.removerDoCarrinho = function (index) {
    pedido.splice(index, 1);
    atualizarCarrinho();
};

// Alterna a exibição dos campos de endereço
window.toggleEndereco = function () {
    const tipo = document.getElementById('tipo-entrega').value;
    const camposEndereco = document.getElementById('campos-endereco');
    if (tipo === 'entrega') {
        camposEndereco.style.display = 'block';
    } else {
        camposEndereco.style.display = 'none';
    }
};

// Lógica de finalizar pedido e enviar para WhatsApp
const btnFinalizar = document.getElementById('btn-finalizar-pedido');
if (btnFinalizar) {
    btnFinalizar.addEventListener('click', function () {
        if (pedido.length === 0) return;

        const tipoEntrega = document.getElementById('tipo-entrega').value;
        const rua = document.getElementById('endereco-rua').value.trim();
        const numero = document.getElementById('endereco-numero').value.trim();
        const pagamento = document.getElementById('forma-pagamento').value;

        if (!tipoEntrega) {
            alert("Por favor, selecione se será Entrega ou Retirada no Balcão.");
            return;
        }

        if (tipoEntrega === 'entrega' && (!rua || !numero)) {
            alert("Por favor, preencha a rua e o número para entrega.");
            return;
        }

        if (!pagamento) {
            alert("Por favor, selecione a forma de pagamento para finalizar o pedido.");
            return;
        }

        let textoMensagem = "Olá, gostaria de fazer o seguinte pedido:\n\n";
        let total = 0;

        pedido.forEach(item => {
            const textoTamanho = item.tamanho === "Meia" ? "1/2" : "1 Inteira";
            textoMensagem += `- ${textoTamanho} ${item.nome} (R$ ${item.preco.toFixed(2).replace('.', ',')})\n`;
            total += item.preco;
        });

        textoMensagem += `\n*Total:* R$ ${total.toFixed(2).replace('.', ',')}\n`;

        if (tipoEntrega === 'entrega') {
            textoMensagem += `\n*Endereço para Entrega:*`;
            textoMensagem += `\nRua: ${rua}, Nº ${numero}`;
        } else {
            textoMensagem += `\n*Retirada no Balcão*`;
        }

        textoMensagem += `\n*Forma de Pagamento:* ${pagamento}`;

        // Codifica a mensagem para formato de URL
        const mensagemCodificada = encodeURIComponent(textoMensagem);

        // O número de WhatsApp da Pizzaria
        const numeroWhatsApp = "551633714900";

        // Cria a URL usando a API oficial que é mais estável para textos
        const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensagemCodificada}`;

        // Abre o WhatsApp em nova aba
        window.open(urlWhatsApp, '_blank');
    });
}

// --- CONTROLE DE EXIBIÇÃO DO CARRINHO (MOSTRAR/ESCONDER) ---
const iconeCarrinho = document.getElementById('icone-carrinho');
const carrinhoFlutuante = document.getElementById('carrinho-flutuante');

if (iconeCarrinho && carrinhoFlutuante) {
    // Abrir / Fechar carrinho ao clicar no ícone
    iconeCarrinho.addEventListener('click', function (e) {
        e.stopPropagation(); // Impede que o clique seja pego pelo document
        if (carrinhoFlutuante.style.display === 'none' || carrinhoFlutuante.style.display === '') {
            carrinhoFlutuante.style.display = 'block';
        } else {
            carrinhoFlutuante.style.display = 'none';
        }
    });

    // Fechar carrinho se clicar em qualquer lugar fora dele
    document.addEventListener('click', function (e) {
        // Se o carrinho está aberto e o clique não foi dentro dele
        if (carrinhoFlutuante.style.display === 'block') {
            if (!carrinhoFlutuante.contains(e.target) && !iconeCarrinho.contains(e.target)) {
                carrinhoFlutuante.style.display = 'none';
            }
        }
    });
}