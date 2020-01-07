const listaAlunos = document.querySelector('#listaAlunos');

const GraphQl = {
    //API propria
    endpoint: 'http://localhost:3000/',
    wsConnection: new WebSocket('ws://localhost:3000/graphql', 'graphql-subscriptions'),

    //Prisma
    //endpoint: 'https://eu1.prisma.sh/ederpbj-833032/cursos-online/dev',
    //wsConnection: new WebSocket('wss://eu1.prisma.sh/ederpbj-833032/cursos-online/dev', 'graphql-subscriptions'),
        
    exec: function(query, variaveis ){
        return fetch(GraphQl.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: query, variaveis: variaveis }),
            
        })
        .then(resposta => resposta.json()) //.catch(err => {console.log(err)})
        
    },

    /**Pag 101
     função chamada iniciarWs() . Como teremos que executar outras
    tarefas após a conexão ser feita, e criar conexões é algo assíncrono,
    vamos começar a iniciarWs() retornando uma Promise para
    podermos saber quando a conexão estiver estabelecida. 
        Com isso nós indicamos ao Prisma que queremos iniciar uma
    conexão. Ao final disso executamos o resolve() da Promise,
    indicando que nossa ação acabou.
    */
    iniciarWS: function(){
        return new Promise(resolve => {
            GraphQl.wsConnection.onopen = function(){
                const mensagem = {
                    type: 'init'
                };
                GraphQl.wsConnection.send(JSON.stringify(mensagem)); //init
                GraphQl.wsConnection.onmessage = function (event) {
                    const resposta = JSON.parse(event.data);
                    console.log("Resposta1",resposta)
                   
                    //console.log(event.data)
                    //if(resposta.type === 'subscription_data'){
                    if(resposta.type === 'subscription_data'){
                        const aluno = resposta.payload.data.aluno;
                        console.log("Aluno: ",aluno)
                        if(aluno.mutation === 'CREATED'){
                            Template.inserirAlunoLista(aluno.node);
                        }else if(aluno.mutation === 'DELETED'){
                            const id = aluno.previousValues.id.replace(/StringIdGCValue\((.*)\)/, '$1');  
                            Template.removerAlunoLista(id);
                        }
                    }
                }

                resolve();
            }
        })
    }
}

const Aluno = {
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
        //console.log("Novo aluno", novoAluno)
        return GraphQl.exec(query, novoAluno);
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
    },

    //Pag 105
	subscription: function(){
		const query = `
		subscription updatedAlunos {
		  aluno(where: {
		    mutation_in: [CREATED, DELETED]
		  }){
		    mutation
		    node{
		      id
		      nomeCompleto
		      idade
		    }
	    	previousValues{
			  	id
	    	}
		  }
		}
		`;
		GraphQl.wsConnection.send(JSON.stringify({
			id: '1',
			type: 'subscription_start',
			query
		}))
	}
}

const Template ={
    /*Pag 92: função que chame a função de busca de alunos, 
    armazene os dados na lista e chame a função listarAluno() 
    para exibirmos os dados na tela.
    */
   /** Precisamos arrumar um único detalhe agora: quando alguém
    criar ou apagar um dado, receberemos esta informação e
    atualizaremos nossa lista. Porém, nós também seremos notificados
    sobre nossas próprias ações de criar e apagar.*/
    iniciar: function(){
        Aluno.buscar()
            .then(({data:{alunoes}}) => {
                Aluno.lista = alunoes;
                Template.listarAluno();
            })

            GraphQl.iniciarWS().then(Aluno.subscription);
    },
    /**
     * Sempre que quisermos que os dados do servidor sejam
    exibidos, basta chamar Template.iniciar() . Para que nossa
    aplicação já inicie com os dados sendo apresentados, adicione a
    chamada desta função na última linha do arquivo scripts.js .
     */

     /**Adicionaremos um botão que, ao ser clicado, chamará a função
    Template.apagarAluno() com o id do aluno a ser apagado. */
    listarAluno: function(){
        let html = ''
        Aluno.lista.forEach((aluno) => {
            html += `<li>Nome: ${aluno.nomeCompleto} - Idade: ${aluno.idade} 
                - <button onclick="Template.apagarAluno('${aluno.id}')"> X </button></li>`
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
        
        //console.log("Passou: ", novoAluno.nomeCompleto)

        if(novoAluno.nomeCompleto && novoAluno.idade){
            formulario.nomeCompleto.value = '';
            formulario.idade.value = '';
            Aluno.criar(novoAluno)
            
            //console.log(novoAluno)
            /*Removido
                .then(({data: {createAluno}}) => {
                    Template.inserirAlunoLista(createAluno);
                })
            */
        }
    },

    //Pag.95: Inserir na lista
    inserirAlunoLista: function(novoAluno){
        Aluno.lista.push(novoAluno);
        Template.listarAluno();
    },

     /**
     * Para não precisarmos ficar chamando uma função de cada vez
    sempre que quisermos apagar um aluno, vamos criar uma função
    que chame essas duas funções.
     */
    apagarAluno: function(id){
        Aluno.apagar(id)
        
        //console.log(id)
        /*Removido
            .then(()=> {
                Template.removerAlunoLista(id)
            })
        */
    },

    //Pag 98, apagar da lista do index
    removerAlunoLista: function(id){
		const alunoIndice = Aluno.lista.findIndex(aluno => aluno.id === id);
		if(alunoIndice >= 0){
			Aluno.lista.splice(alunoIndice, 1);
			Template.listarAluno();
		}
	}

}

Template.iniciar();