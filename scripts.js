const listaAlunos = document.querySelector('#listaAlunos');

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
    //Prepara para criar aluno novo
    criar: function(novoAluno){
        const query = `
            mutation ($nomeCompleto: String!, $idade: Int!){
                createAluno(data: {
                    nomeCompleto: $nomeCompleto
                    idade: $idade
                }){
                    id
                    nomeCompleto
                    idade
                }
            }
        `;
        return GraphQl.exec(query, novoAluno);
    },

    //Listar alunos
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

const Template ={
    /*Pag 92: função que chame a função de busca de alunos, 
    armazene os dados na lista e chame a função listarAluno() 
    para exibirmos os dados na tela.
    */
    iniciar: function(){
        Aluno.buscar()
            .then(({data:{alunoes}}) => {
                Aluno.lista = alunoes;
                Template.listarAluno();
            })
    },
    /**
     * Sempre que quisermos que os dados do servidor sejam
    exibidos, basta chamar Template.iniciar() . Para que nossa
    aplicação já inicie com os dados sendo apresentados, adicione a
    chamada desta função na última linha do arquivo scripts.js .
     */
    listarAluno: function () {
        listaAlunos.innerHTML = html;
    },

    listarAluno: function(){
        let html = ''
        Aluno.lista.forEach((aluno) => {
            html += `<li>Nome: ${aluno.nomeCompleto} - Idade: ${aluno.idade}`
        })
        listaAlunos.innerHTML = html;
    },

    //Pag:96: Criar aluno
    criarAluno: function(){
        /**
         * O comportamento padrão de um formulário HTML submetido
            é nos enviar para outra página, mas precisamos evitar isto, pois
            nossa aplicação possui apenas uma única tela. Então temos que
            executar event.preventDefault() .
         */
        event.preventDefault();
        const formulario = document.forms.novoAluno,
        novoAluno = {
            nomeCompleto: formulario.nomeCompleto.value,
            idade: parseInt(formulario.idade.value)
        };
        if(novoAluno.nomeCompleto && novoAluno.idade){
            formulario.nomeCompleto.value = '';
            formulario.idade.value = '';
            Aluno.criar(novoAluno)
                .then(({data: {createAluno}}) => {
                    Template.inserirAlunoLista(createAluno);
                })
        }
    },


    //Pag.95: Inserir na lista
    inserirAlunoLista: function(novoAluno){
        Aluno.lista.push(novoAluno);
        Template.listarAluno();
    }
}

Template.iniciar();