# Deploy com Docker Compose

Pré-requisitos
1. DNS A para `onpprod.site` e `www.onpprod.site` apontando para `163.176.131.109`.
2. Portas `80` e `443` liberadas no firewall do servidor.
3. Docker e Docker Compose (plugin) instalados no servidor.

Passos
1. Copie o projeto para o servidor.
2. Crie o arquivo `.env` a partir de `.env.example` e ajuste os valores.
3. Rode `docker compose build`.
4. Gere o certificado SSL: `EMAIL=seu@email.com ./deploy/init-letsencrypt.sh`.
5. Suba os serviços: `docker compose up -d`.

Notas
1. A renovacao do Let's Encrypt roda automaticamente via container `certbot`.
2. Para alterar dominio ou IP, atualize `DJANGO_ALLOWED_HOSTS`, `DJANGO_CSRF_TRUSTED_ORIGINS` e `nginx/conf.d/onpprod.conf`.
