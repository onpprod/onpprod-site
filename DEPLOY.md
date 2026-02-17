# Deploy com Docker Compose

Pré-requisitos
1. DNS A para `onpprod.site` e `www.onpprod.site`.
2. Portas `80` e `443` liberadas no firewall do servidor.
3. Docker e Docker Compose (plugin) instalados no servidor.

Passos
1. Copie o projeto para o servidor.
2. Torne o script executavel: `chmod +x deploy/deploy.sh`.
3. Rode o deploy completo com Let's Encrypt: `EMAIL=seu@email.com ./deploy/deploy.sh`.
   - Opcional: `DOMAIN=onpprod.site` e `STAGING=1` para testes.

Notas
1. Se o certificado ja existir, o script apenas sobe os containers.
2. Para ambiente de teste, use `STAGING=1` para evitar limite de emissao.
3. Para alterar dominio ou IP, atualize `nginx/conf.d/onpprod.conf`.
