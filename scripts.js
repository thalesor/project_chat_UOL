
        let messageReceiver = "Todos";
        let globalScope = "Público";
        let user = undefined;

        //Como o nome já diz, a função recebe as mensagens do servidor e exibe-as
         const getMessages = () =>
        {   
            axios.get("https://mock-api.driven.com.br/api/v4/uol/messages")
            .then(response  => {
                const mensagens = response.data;
                const listaMensagens = mensagens.map((mensagem) => {
                    if(mensagem.type === "status")
                    {
                        return `<li class="mensagem ${mensagem.type}">
                            <div class="mensagem-header"> <span>(${mensagem.time})</span>
                            <span><strong>${mensagem.from}</strong></span><span>${mensagem.text}</span>
                            </div>
                        </li>`;
                    }
                    else if(mensagem.type === "private_message")
                    {
                        if(mensagem.to === user.name || mensagem.from === user.name)
                        return `<li class="mensagem ${mensagem.type}">
                        <div class="mensagem-header"><span>(${mensagem.time})</span>
                            <span><strong>${mensagem.from}</strong> reservadamente para <strong>${mensagem.to}</strong>:</span>
                        </div>
                        <div class="mensagem-content">${mensagem.text}</div>
                            </li>`;
                    }
                    else if(mensagem.type === "message")
                    {
                        return `<li class="mensagem">
                        <div class="mensagem-header"> <span>(${mensagem.time})</span>
                            <span><strong>${mensagem.from}</strong> para <strong>${mensagem.to}</strong>:</span>
                            </div>
                            <div class="mensagem-content"> ${mensagem.text}</div>
                        </li>`;
                    }
                    })
                    .join("");
                    let container = document.querySelector("ul");
                    container.innerHTML = listaMensagens; 
                    container.lastChild.scrollIntoView();
            });
        }

        //Como o nome diz, a funçãlo recebe a lista de participantes ativos no servidor e exibe na sidebar
        const getParticipants = () =>
        {
            axios.get("https://mock-api.driven.com.br/api/v4/uol/participants")
            .then(response  => {
                const participants = response.data;
                let check = "Todos" === messageReceiver ? `<img class="check" src="imagens/check.png">` : '';
                let listaParticipants = `<li onClick="changeReceiver(this)"><img src="imagens/people.png" alt=""><strong>Todos</strong>${check}</li> `;
                listaParticipants += participants.map((participant) => {
                    let check = participant.name === messageReceiver ? `<img class="check" src="imagens/check.png">` : '';
                    return `<li onClick="changeReceiver(this)"><img class="person" src="imagens/person.png" alt=""><strong>${participant.name}</strong>${check}</li>`
                    })
                    .join("");
                    document.querySelector(".contacts-container-main ul").innerHTML = listaParticipants;    
            });
        }

        //Essa função faz o roteamento para a página correta dependendo das ações do usuário
        const redirectUser = (route) => 
        {
            if(route === "home")
            return `
                <header>
                <img src="imagens/uol.png"  alt="">
                <div>
                    <a onClick="toggleSideBar()"><img src="imagens/people.png" alt=""></a>
                    <a onClick="onExit()"><img src="imagens/exit.png" alt=""></a>
                </div>
                </header>
                <ul class="mensagens-container"></ul>
                <footer> 
                    <textarea placeholder="Escreva aqui..." type="text"></textarea>
                    <a onClick="onSubmitSendMessage()"><img src="imagens/send.png" alt=""></a>
                </footer>
                <div onClick="toggleSideBar()" class="modal">
                <div class="contacts-container">
                    <div class="contacts-container-header">
                        <strong>Escolha um contato para enviar mensagem:</strong>
                    </div>
                    <div class="contacts-container-main">
                        <ul></ul>
                    </div>
                    <div class="contacts-container-footer">
                        <ul>
                            <li onClick="changeScope(this)"><strong>Público</strong> <img class="check" src="imagens/check.png"> </li>
                            <li onClick="changeScope(this)"><strong>Reservado</strong> <img class="check" src="imagens/check.png"> </li>
                        </ul>
                    </div>
                </div>     
                </div>
            `;
            else if(route === "signin")
            return `
                <div class="signin-container">
                    <img src="imagens/uol.png" />
                    <input id="sign-input" type="text" placeholder="Digite seu nome" />
                    <input type="button" id="sign-button" value="Entrar" onClick="onSubmitSignIn()"></button>
                </div>
        `;
        }

        //Essa função permite a troca do participante para o qual será enviada a mensagem
        const changeReceiver = (el) => 
        {
            let participant = el.querySelector("strong").innerHTML;
            messageReceiver = participant;
            getParticipants();
        }

        //Essa função modifica o escopo de mensagens, se será público ou privado
        const changeScope = (el) =>
        {
            let scope = el.querySelector("strong").innerHTML;
            globalScope = scope;
            let children = el.parentNode.children;
            children[0].classList.remove("selected");
            children[1].classList.remove("selected");
            el.classList.add("selected");
        }

        //Essa função faz o login, ela verifica se o nome solicitado está disponível para uso no servidor,
        //se estiver, o usuário será redirecionado para a página de chat, e receberá o nome escolhido
        const validateUser = (userName) =>
        {
            axios.post('https://mock-api.driven.com.br/api/v4/uol/participants', {
                name: `${userName}`
            }).then(response => {
                user = {
                    name: userName
                };
                loadPage();
            }).catch(error => {
                alert(`${error.response.data}: 
                Escolha outro nome, esse aí já está em uso!!!`);
            });
        }

        //Função chamada ao clicar no botão deentrar no chat
        const onSubmitSignIn = () => 
        {
            let userName = document.querySelector("#sign-input").value;
            validateUser(userName);
        }

        //Função chamada ao enviar uma mensagem no chat
        const onSubmitSendMessage = () =>
        {
            let messageBox = document.querySelector("textarea");
            let type = (globalScope === "Público") ? "message" : "private_message";
            let to = (messageReceiver === "Todos") ? "Todos" : `${messageReceiver}`;
            axios.post('https://mock-api.driven.com.br/api/v4/uol/messages', {
                from: user.name,
                to: to,
                text: messageBox.value,
                type: type
            })
            .then(response => {
                getMessages();
                messageBox.value = '';
            }).catch(error => {
                onExit();
            });
        }

        //Função chamada sempre que deve-se iniciar o processo de verificar se o usuário está logado e redireciona-lo se
        //o login for feito com sucesso
        const loadPage = () =>
        {
            if (user === undefined)
            {
                let interval_id = window.setInterval(()=>{}, 99999);
                for (let i = 0; i < interval_id; i++)
                window.clearInterval(i);

                document.querySelector("main").innerHTML = redirectUser("signin");

            }
            else if(user !== undefined)
            {
                axios.get("https://mock-api.driven.com.br/api/v4/uol/participants")
                .then(response => {
                    let participants = response.data;
                    if(!participants.find(p => p.name === user.name))
                    onExit();
                    else
                    {
                        document.querySelector("main").innerHTML = redirectUser("home");
                        let textBox = document.querySelector("textarea");
                        textBox.addEventListener('keyup', function(e)
                        {
                            var key = e.which || e.keyCode;
                            if (key === 13) 
                            { 
                                onSubmitSendMessage();
                            }
                        });
                        getMessages();
                        getParticipants();
                        setInterval(getMessages, 3000);
                        setInterval(getParticipants, 10000);
                        setInterval(() => {
                            axios.post('https://mock-api.driven.com.br/api/v4/uol/status', {
                        name: `${user.name}`
                        })
                        }, 5000);
                    }
                });  
            }
        }

        //função chamada ao clicar para exibir a lista de participantes ativos
        const toggleSideBar = () =>
        {
            let modal = document.querySelector(".modal");
            modal.classList.toggle("triggered");
        }   

        //Função chamada ao clicar no ícone da porta, serve para deslogar o usuário e reiniciar o processo de login
        const onExit = () =>
        {
            alert("você não se encontra mais presente na sala e portanto será deslogado");
            user = undefined;
            messageReceiver = "Todos";
            loadPage();
        }

        loadPage();

          

        
         
