# Ecossistema Público da Bella Nyelle

## Visão geral

O site mantém uma única experiência pública em `/observatorio`. As áreas de status, estatísticas, atividade, segurança, infraestrutura, evolução, comunidade, relatórios e comandos usam a mesma projeção de dados. Nenhuma tela consulta o Discord diretamente.

Fluxo implementado:

```text
Bella Discord Bot
  -> POST autenticado por HMAC
  -> validação Zod + escopo + anti-replay + idempotência
  -> PostgreSQL privado
  -> projeção pública server-only
  -> API pública de leitura e SSR
  -> Bella Observatory
```

O horário da personagem e o estado operacional são conceitos separados. A rotina usa `America/Recife`, com Bella acordada entre 07h00 e 20h59 e descansando entre 21h00 e 06h59. Um heartbeat expirado produz estado operacional `unknown`; o descanso nunca mascara indisponibilidade.

## Módulos

- `src/lib/public-platform.ts`: contratos públicos, períodos, fuso horário, estados vazios e formatação.
- `src/server/public-platform/contracts.ts`: contratos de escrita estritos e versionados.
- `src/server/public-platform/auth.server.ts`: assinatura HMAC, janela temporal e hashes de nonce/payload.
- `src/server/public-platform/repository.ts`: interface de persistência e implementação em memória para testes/desenvolvimento.
- `src/server/public-platform/database.server.ts`: implementação PostgreSQL e projeções públicas.
- `src/server/public-platform/service.server.ts`: ingestão, autorização por escopo e composição do dashboard.
- `src/routes/api`: endpoints HTTP públicos e de integração.
- `src/components/observatory`: interface do Observatório.
- `migrations/001_bella_public_platform.sql`: banco reproduzível.

## Persistência

Tabelas criadas:

- `bella_ingestion_events`: eventos aceitos, hashes, idempotência e anti-replay.
- `bella_heartbeat_history`: estado operacional e cálculo de disponibilidade.
- `bella_public_services` e `bella_service_history`: estado atual e histórico de componentes autorizados.
- `bella_metric_points`: deltas ou snapshots agregados.
- `bella_public_activities`: feed explicitamente público.
- `bella_public_incidents`: incidentes e manutenções públicas.
- `bella_editorial_items`: changelog, roadmap, release notes, milestones, achievements, resumos e relatórios.
- `bella_public_commands`: catálogo limitado a comandos autorizados.
- `bella_community_snapshots`: métricas de comunidades participantes.
- `bella_ingestion_rate_limits`: limite persistente por chave/minuto.
- `bella_schema_migrations`: controle de migrations aplicado pelo script.

Não existe tabela para conteúdo de mensagens, contatos, usuários ou servidores privados. A migration revoga acesso do papel SQL `PUBLIC`. O usuário da aplicação deve receber apenas as permissões necessárias no banco escolhido.

## Variáveis de ambiente

Use `.env.example` como referência.

| Variável | Obrigatória | Finalidade |
| --- | --- | --- |
| `DATABASE_URL` | produção | conexão PostgreSQL usada somente no servidor |
| `DATABASE_SSL` | recomendada | `require` por padrão; use `disable` somente em ambiente local confiável |
| `BELLA_INGESTION_KEYS` | para sincronização | JSON de chaves, secrets e escopos do bot |
| `BELLA_ALLOW_MEMORY_STORE` | não | libera armazenamento volátil; nunca habilitar em produção |

Exemplo de configuração de chaves:

```json
{
  "bella-bot-prod": {
    "secret": "gere-um-segredo-aleatorio-com-ao-menos-32-caracteres",
    "scopes": [
      "status:write",
      "metrics:write",
      "activity:write",
      "infrastructure:write",
      "editorial:write",
      "commands:write",
      "community:write"
    ]
  }
}
```

Use chaves diferentes por ambiente e rotacione-as removendo a chave antiga após atualizar o bot. O token do Discord nunca pertence ao site.

## APIs

### Leitura pública

- `GET /api/public/dashboard?period=today|7d|30d|12m`
- `GET /api/public/activity?category=release&limit=20&cursor=<ISO-8601>`
- `GET /api/public/commands?q=ticket&category=Comunidade&limit=100`

Esses endpoints retornam somente projeções públicas. Respostas podem ser armazenadas em cache por períodos curtos.

### Escrita autenticada

- `POST /api/integration/v1/events`

Headers obrigatórios:

```text
Content-Type: application/json
X-Bella-Key-Id: bella-bot-prod
X-Bella-Timestamp: 1792076400
X-Bella-Nonce: valor-aleatorio-unico-com-16-ou-mais-caracteres
X-Bella-Signature: sha256=<hex>
```

A assinatura é:

```text
HMAC_SHA256(secret, timestamp + "." + nonce + "." + corpo_json_exato)
```

O corpo é limitado a 256 KiB. O timestamp aceita diferença máxima de cinco minutos. O nonce é armazenado por chave e não pode ser reutilizado. `eventId` torna reenvios seguros: o mesmo evento retorna `duplicate: true` sem duplicar métricas.

Tipos e escopos:

| Tipo | Escopo |
| --- | --- |
| `heartbeat` | `status:write` |
| `metrics` | `metrics:write` |
| `public_activity` | `activity:write` |
| `incident` | `infrastructure:write` |
| `editorial` | `editorial:write` |
| `command_catalog` | `commands:write` |
| `community_snapshot` | `community:write` |

Os schemas rejeitam propriedades extras. Assim, identificadores privados adicionados por engano não são silenciosamente persistidos.

## Payloads

Exemplos ficam em `docs/examples`. Eles são documentação e não alimentam a produção.

Métricas aceitas:

- `commands_executed`
- `interactions_processed`
- `tickets_opened`
- `tickets_completed`
- `security_events`
- `messages_blocked`
- `automod_actions`
- `analyses_completed`
- `community_interactions`
- `community_events`
- `operation_seconds`

`mode: delta` soma ocorrências dentro do período. `mode: snapshot` usa o snapshot mais recente do recorte. Não alterne modos para a mesma métrica sem uma estratégia explícita de reconciliação.

## Integração com Python

`docs/examples/bella_sync.py` contém um cliente apenas com a biblioteca padrão. No bot:

1. Gere um `eventId` estável para cada evento persistido.
2. Monte e serialize o JSON uma única vez.
3. Assine exatamente os bytes enviados.
4. Reenvie com o mesmo `eventId` em falhas transitórias, mas use nonce novo.
5. Trate `202` como aceito e `200` com `duplicate: true` como sucesso idempotente.
6. Faça retry com backoff apenas para `429` e erros `5xx`.

Heartbeats devem ser enviados em intervalo inferior a três minutos. A recomendação inicial é 60 segundos.

## Conteúdo editorial e administração

O repositório original não possui autenticação administrativa. Para não introduzir login improvisado, a publicação editorial usa o mesmo endpoint autenticado com o escopo `editorial:write`. Chaves de automação e de publicação podem ser separadas.

Uma área administrativa humana futura deve usar OAuth com sessão `HttpOnly`, `Secure`, `SameSite` e RBAC no servidor. Até essa infraestrutura existir, não há formulário administrativo público.

## Segurança e Supabase

Esta implementação não adiciona SDK Supabase ao navegador, chave `anon` nem escrita via cliente. O site usa PostgreSQL exclusivamente no servidor. Se a hospedagem escolhida for Supabase Postgres, utilize apenas a connection string no ambiente server-side e mantenha PostgREST/anon sem privilégios sobre as tabelas da Bella. A migration já executa `REVOKE ... FROM PUBLIC`; revise grants específicos no provedor.

Outras proteções:

- HMAC com comparação constante.
- Escopos mínimos por tipo de evento.
- Anti-replay persistente.
- Idempotência por evento.
- Limite persistente de 120 requisições por chave/minuto.
- Payloads estritos, tamanho máximo e datas ISO com offset.
- Atualizações fora de ordem não substituem estado mais recente.
- Headers de segurança globais.
- Nenhum secret em respostas ou logs de erro públicos.
- Ausência de banco em produção resulta em estado vazio/`503`, nunca dados simulados.

## Migrations

Configure `DATABASE_URL` e execute:

```bash
npm run db:migrate
```

O script registra checksum. Alterar uma migration já aplicada causa falha; crie um novo arquivo numerado para mudanças futuras.

## Desenvolvimento

```bash
npm install
npm run dev
```

Sem `DATABASE_URL`, desenvolvimento e testes usam armazenamento em memória. Os dados desaparecem quando o processo reinicia e a interface deixa isso claro por meio dos estados vazios.

Validação:

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

## Vercel

1. Importe o repositório.
2. Configure `DATABASE_URL`, `DATABASE_SSL` e `BELLA_INGESTION_KEYS` nos ambientes corretos.
3. Execute a migration contra o banco de produção antes de liberar a sincronização.
4. Faça deploy com o comando padrão `npm run build`.
5. Teste `/api/public/dashboard` e depois envie um heartbeat assinado.
6. Confirme que `/observatorio` deixa de exibir estado vazio somente após o heartbeat real.

## Retenção e operação

Política inicial recomendada:

- heartbeats detalhados: 90 dias;
- limites de requisição: 48 horas;
- métricas agregadas diárias: retenção longa;
- eventos públicos, versões e marcos: enquanto publicados;
- incidentes: histórico institucional;
- eventos de ingestão: 180 dias ou conforme auditoria necessária.

A limpeza deve ocorrer em job do provedor de banco ou automação operacional. Não foi criado cron sem conhecer a infraestrutura definitiva.

## Limitações atuais

- A comunicação real com o bot depende da configuração dos secrets no site e da incorporação do cliente no repositório Python da Bella.
- Não há métricas anteriores até o bot iniciar a sincronização.
- Não existe login humano no projeto original; publicação editorial é feita pela API de serviço.
- O cálculo de disponibilidade representa a proporção de heartbeats `online`/`away` recebidos, não um SLA contratual.
- Grupos pequenos devem ser suprimidos pelo bot antes do envio de relatórios de moderação; o contrato não aceita dados individuais.
