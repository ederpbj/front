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
    },

    //Pag 97: apagar aluno
    apagar: function(id){
        const query = `
            mutation ($id: ID!){
                deleteAluno(
                    where: {
                        id: $id
                    }
                ){
                    id
                }
            }
        `;
        return GraphQl.exec(query, {id});
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

     /**Adicionaremos um botão que, ao ser clicado, chamará a função
    Template.apagarAluno() com o id do aluno a ser apagado. */
    listarAluno: function(){
        let html = ''
        Aluno.lista.forEach((aluno) => {
            html += `<li>Nome: ${aluno.nomeCompleto} - Idade: ${aluno.idade} - <button onclick="Template.apagarAluno('${aluno.id}'
            )" >X</button></li>`
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
    },

    //Pag 98, apagar da lista
    removerAlunoLista: function(id){
        const alunoIndice = Aluno.lista.findIndex(aluno => aluno.id === id);
        if(alunoIndice >= 0){
            Aluno.lista.splice(alunoIndice, 1);
            Template.listarAluno();
        }
    },

    /**
     * Para não precisarmos ficar chamando uma função de cada vez
    sempre que quisermos apagar um aluno, vamos criar uma função
    que chame essas duas funções.
     */
    apagarAluno: function(id){
        Aluno.apagar(id)
            .then(()=> {
                Template.removerAlunoLista(id)
            })
    },

   


}

Template.iniciar();