
         const getMessages = () =>
        {   
            axios.get("https://mock-api.driven.com.br/api/v4/uol/messages")
            .then(response  => {
                const mensagens = response.data;
                const listaMensagens = mensagens.map((mensagem) => {
                    if(mensagem.type === "status")
                    {
                        return `<li class="mensagem ${mensagem.type}">
                            <span>(${mensagem.time})</span>
                            <p>&nbsp;<strong>${mensagem.from}</strong> ${mensagem.text}</p>
                        </li>`;
                    }
                    else if(mensagem.type === "private_message")
                    {
                        if(mensagem.to === localStorage.userName || mensagem.from === localStorage.userName)
                        return `<li class="mensagem ${mensagem.type}">
                            <span>(${mensagem.time})</span>
                            <p>&nbsp;<strong>${mensagem.from}</strong> reservadamente para <strong>${mensagem.to}</strong>: ${mensagem.text}</p>
                        </li>`;
                    }
                    else if(mensagem.type === "message")
                    {
                        return `<li class="mensagem">
                            <span>(${mensagem.time})</span>
                            <p>&nbsp;<strong>${mensagem.from}</strong> para <strong>${mensagem.to}</strong>: ${mensagem.text}</p>
                        </li>`;
                    }
                    })
                    .join("");
                    let container = document.querySelector("ul");
                    container.innerHTML = listaMensagens; 
                    container.lastChild.scrollIntoView();
            });
        }

        const getParticipants = () =>
        {
            axios.get("https://mock-api.driven.com.br/api/v4/uol/participants")
            .then(response  => {
                const participants = response.data;
                let listaParticipants = '<li onClick="changeReceiver(this)"><img src="imagens/people.png" alt=""><strong>Todos</strong></li> ';
                listaParticipants += participants.map((participant) => {
                    let selected = participant.name === messageReceiver ? "selected" : '';
                    return `<li class="${selected}" onClick="changeReceiver(this)"><img class="person" src="imagens/person.png" alt=""><strong>${participant.name}</strong></li>`
                    })
                    .join("");
                    document.querySelector(".contacts-container-main ul").innerHTML = listaParticipants;    
            });
        }

        let messageReceiver = "Todos";
        
        const redirectUser = (route) => 
        {
            if(route === "home")
            return `
                <header>
                <a id="exit-btn" onClick="onExit()"><img src="imagens/uol.png"  alt=""></a>
                <p>Seja Bem-Vindo <strong>${localStorage.userName}</strong></p>
                <a onClick="toggleSideBar()"><img src="imagens/people.png" alt=""></a>
                </header>
                <ul class="mensagens-container"></ul>
                <footer> 
                    <textarea placeholder="Escreva aqui..." type="text"></textarea>
                    <a onClick="onSubmitSendMessage()"><img src="imagens/send.png" alt=""></a>
                </footer>
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

        const changeReceiver = (el) => 
        {
            let participant = el.querySelector("strong").innerHTML;
            messageReceiver = participant;
        }

        const validateUser = (userName) =>
        {
            axios.post('https://mock-api.driven.com.br/api/v4/uol/participants', {
                name: `${userName}`
            }).then(response => {
                console.log(response);
                localStorage.setItem("isLoggedIn", true);
                localStorage.setItem("userName", userName);
                loadPage();
            }).catch(error => {
                if(error.response.status === 400)
                alert("Escolha outro nome, esse aí já está em uso!!!");
            });
        }

        const onSubmitSignIn = (event) => 
        {
            let userName = document.querySelector("#sign-input").value;
            validateUser(userName);
        }

        const onSubmitSendMessage = () =>
        {
            let messageBox = document.querySelector("textarea");
            let type = (messageReceiver === "Todos") ? "message" : "private_message";
            let to = (messageReceiver === "Todos") ? "Todos" : `${messageReceiver}`;
            axios.post('https://mock-api.driven.com.br/api/v4/uol/messages', {
                from: localStorage.userName,
                to: to,
                text: messageBox.value,
                type: type
            })
            .then(response => {
                getMessages();
                messageBox.value = '';
            }).catch(error => {
                if(error.response.status === 400)
                {
                    onExit();
                }
            });
        }

        const loadPage = () =>
        {
            if (!localStorage.getItem("isLoggedIn"))
            {
                let interval_id = window.setInterval(()=>{}, 99999);
                for (let i = 0; i < interval_id; i++)
                window.clearInterval(i);

                document.querySelector("main").innerHTML = redirectUser("signin");
                
            }
            else if(localStorage.getItem("isLoggedIn"))
            {
                console.log("Entrou na página");
                document.querySelector("main").innerHTML = redirectUser("home");
                getMessages();
                getParticipants();
                setInterval(getMessages, 3000);
               // setInterval(getParticipants, 10000);
                setInterval(() => {
                    axios.post('https://mock-api.driven.com.br/api/v4/uol/status', {
                name: `${localStorage.userName}`
                 }).
                 then(() => {
                     console.log("ta atualizando");
                 })
                }, 5000);
            }
        }

        const toggleSideBar = () =>
        {
            let modal = document.querySelector(".modal");
            modal.classList.toggle("triggered");
            getParticipants();
        }

        const onExit = () =>
        {
            localStorage.clear();
            console.log("Saiu da página");
            loadPage();
        }

        loadPage();

          

        
         
