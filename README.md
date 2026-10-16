# Bellas Elegant Sanctuary

Crie um site fofo pra essa personagem chamada Bella. Pra vc criar um site que diz as funcionalidades to enviando o readme. Só não poe tokens, APIS;

Observação: Ela é uma bot privada

Sobre a identidade visual, pro hero poe esse background dela, do lado esquerdo poe a logo nome dela e uma descrição. Não poe botoes e afins, o navbar e footer poe essa logo só escrito Bella. O design do site deve ser extremamente bonito, elegante e afins. Não crie em hipotese alguma design de IA, elementos, cards e afins. 

O navbar e footer devem ser com design unico, não faça navbar e footer generico demais. Pode fazer flutuante e tals. As cores devem ser Vermelho do background e etc e preto

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/96ad0698-76cb-4d90-ab24-902446f8c744).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Bella Observatory

O site possui um ecossistema público integrado em `/observatorio`, com status operacional separado da rotina da personagem, métricas autorizadas, feed público, segurança agregada, infraestrutura, incidentes, evolução, comunidade e catálogo de comandos.

A integração de escrita usa HMAC, escopos, idempotência e anti-replay. O navegador nunca recebe credenciais do bot ou acesso direto ao banco. Configure PostgreSQL e execute:

```sh
npm run db:migrate
```

A arquitetura, variáveis, contratos, payloads e exemplo Python estão documentados em [`docs/BELLA_PUBLIC_ECOSYSTEM.md`](docs/BELLA_PUBLIC_ECOSYSTEM.md).
