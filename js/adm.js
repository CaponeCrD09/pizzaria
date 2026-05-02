const urlSupabase = "https://fsqsgpfwtmhaojkmlaso.supabase.co";
const chaveSupabase = "sb_publishable_VrOzm8fbWAGjQlHFdg022w_VIYW_Mgv";

const serverSupabase = supabase.createClient(urlSupabase, chaveSupabase);

// Elementos do HTML
const nome = document.getElementById("nome");
const ingredientes = document.getElementById("desc");
const preco = document.getElementById("preco");
const btnSalvar = document.getElementById("btn-salvar");

let idPizzaEdicao = null;

async function addPizzas(event){
    event.preventDefault();

    const nomePizza = nome.value.trim();
    const ingredientesPizza = ingredientes.value.trim();
    const precoPizza = preco.value; // Pegamos o valor bruto para validar primeiro

    // --- VALIDAÇÃO (Antes de enviar ao banco) ---
    if(nomePizza === "") {
        alert("Preencha o campo nome");
        return; // O 'return' para a função aqui e não tenta salvar
    }
    if(ingredientesPizza === "") {
        alert("Preencha o campo ingredientes");
        return;
    }
    if(precoPizza === "" || isNaN(precoPizza)) {
        alert("Preencha o campo preço com um valor válido");
        return;
    }

    if (idPizzaEdicao) {
        // --- ATUALIZAÇÃO NO SUPABASE ---
        const { data, error } = await serverSupabase
            .from("pizzas")
            .update({
                nome: nomePizza,
                descricao: ingredientesPizza,
                preco: parseFloat(precoPizza)
            })
            .eq("id", idPizzaEdicao);

        if (error) {
            console.error("Erro detalhado:", error);
            alert("Erro ao atualizar no banco: " + error.message);
        } else {
            alert("Pizza atualizada com sucesso!");

            // LIMPEZA DOS CAMPOS
            nome.value = "";
            ingredientes.value = ""; 
            preco.value = "";
            
            // RESETAR ESTADO DE EDIÇÃO
            idPizzaEdicao = null;
            btnSalvar.textContent = "Adicionar ao Cardápio";
            document.querySelector(".admin-form-card h3").textContent = "Cadastrar Novo Sabor";

            listarPizzas(); // Atualiza a tabela
        }
    } else {
        // --- ENVIO PARA O SUPABASE ---
        const { data, error } = await serverSupabase
            .from("pizzas")
            .insert([{
                nome: nomePizza,
                descricao: ingredientesPizza,
                preco: parseFloat(precoPizza)
            }]);

        // --- RESPOSTA DO SERVIDOR ---
        if (error) {
            console.error("Erro detalhado:", error);
            alert("Erro ao salvar no banco: " + error.message);
        } else {
            alert("Pizza adicionada com sucesso!");

            // LIMPEZA DOS CAMPOS (Agora dentro do sucesso)
            nome.value = "";
            ingredientes.value = ""; 
            preco.value = "";        

            listarPizzas(); // Atualiza a tabela
        }
    }
}

btnSalvar.addEventListener("click", addPizzas);

//// funcao para ver as pizzas cadastradas

const listaPizzas = document.getElementById("lista-admin-pizzas");

async function listarPizzas() {

    const { data, error } = await serverSupabase
        .from("pizzas")
        .select("*");

    if (error) {
        console.error("Erro ao listar pizzas:", error);
        return;
    }

    listaPizzas.innerHTML = "";

    data.forEach(pizza => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${pizza.nome}</td>
            <td>R$ ${Number(pizza.preco).toFixed(2)}</td>
            <td style="text-align: center;" class="acoes-td"></td>
        `;
        
        // Botão de Atualizar
        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Atualizar";
        btnEditar.style.cursor = "pointer";
        btnEditar.style.padding = "5px 10px";
        btnEditar.style.backgroundColor = "#ffc107";
        btnEditar.style.color = "#000";
        btnEditar.style.border = "none";
        btnEditar.style.borderRadius = "4px";
        btnEditar.onclick = () => editarPizza(pizza);
        
        tr.querySelector(".acoes-td").appendChild(btnEditar);
        listaPizzas.appendChild(tr);
    });
}

function editarPizza(pizza) {
    idPizzaEdicao = pizza.id;
    nome.value = pizza.nome;
    ingredientes.value = pizza.descricao;
    preco.value = pizza.preco;
    
    btnSalvar.textContent = "Atualizar Pizza";
    document.querySelector(".admin-form-card h3").textContent = "Atualizar Sabor";
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

listarPizzas();
