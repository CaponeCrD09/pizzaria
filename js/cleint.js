// Configuração do Supabase (Verifique se as variáveis estão com os nomes corretos)
const hrlSupabase = "https://fsqsgpfwtmhaojkmlaso.supabase.co";
const chaveSupabase = "sb_publishable_VrOzm8fbWAGjQlHFdg022w_VIYW_Mgv";

const serverSupabase = supabase.createClient(hrlSupabase, chaveSupabase);

async function pegarValor() {
    // 1. Buscamos apenas o preço da pizza com ID 35
    const { data, error } = await serverSupabase
        .from("pizzas")
        .select("preco")
        .eq("id", 35)
        .single(); // Pega o objeto direto

    // 2. Se houver erro (Ex: ID 35 não existe mais)
    if (error) {
        console.error("Erro ao buscar preço:", error.message);
        return;
    }

    // 3. Se os dados existirem, atualizamos o SPAN
    if (data) {
        const spanPreco = document.getElementById("preco_calabresa");
        
        // Transformamos o número em formato de moeda Brasileira (R$ 45,00)
        const precoFormatado = parseFloat(data.preco).toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL'
        });

        spanPreco.textContent = precoFormatado;
    }
}

// 4. Executa a função ao carregar a página
pegarValor();