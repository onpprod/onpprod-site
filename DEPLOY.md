# Deploy com Docker Compose

Pré-requisitos
1. DNS A para `onpprod.site` e `www.onpprod.site` apontando para `163.176.131.109`.
2. Porta `80` liberada no firewall do servidor.
3. Docker e Docker Compose (plugin) instalados no servidor.

Passos
1. Copie o projeto para o servidor.
2. Crie o arquivo `.env` a partir de `.env.example` e ajuste os valores.
3. Rode `docker compose build`.
4. Suba os serviços: `docker compose up -d`.

Notas
1. Este deploy esta apenas em HTTP. Se for habilitar HTTPS depois, sera necessario ajustar o NGINX e adicionar o fluxo do Let's Encrypt.
2. Para alterar dominio ou IP, atualize `DJANGO_ALLOWED_HOSTS` e `nginx/conf.d/onpprod.conf`.
