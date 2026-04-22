const urlSupabase = "https://fsqsgpfwtmhaojkmlaso.supabase.co";
const chaveSupabase = "sb_publishable_VrOzm8fbWAGjQlHFdg022w_VIYW_Mgv";

const serverSupabase = supabase.createClient(urlSupabase, chaveSupabase);

// Elementos do HTML
const nome = document.getElementById("nome");
const ingredientes = document.getElementById("desc");
const preco = document.getElementById("preco");
const btnSalvar = document.getElementById("btn-salvar");

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
            <td>${pizza.preco}</td>
        `;
        listaPizzas.appendChild(tr);
    });
}

listarPizzas();
