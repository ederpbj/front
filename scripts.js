const GraphQl = {
    endpoint: 'https://eu1.prisma.sh/ederpbj-833032/cursos-online/dev',

    exec: function(query, variaveis ){
        return fetch(GraphQl.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: query, variaveis: variaveis }),
        }).then(resposta = resposta.json())
    }
}

const Aluno = {
    lista: [],
    buscar: function(){
        const query = `
            query{
                alunoes{
                    id
                    nomeCompleto
                    idade
                }
            }
        `;
        return GraphQl.exec(query);
    }
}