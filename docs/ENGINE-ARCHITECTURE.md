# Saddle Engine — arquitetura executável inicial

## Decisão central

O primeiro corte do Saddle será uma biblioteca TypeScript para Node.js 22+, com o núcleo escrito contra APIs web universais sempre que possível. A biblioteca não dependerá de GitHub, Docker, S3, navegador ou banco de dados para funcionar em memória; essas superfícies entrarão por adaptadores explícitos.

> **Storage e compute não serão tratados como a mesma coisa física.** O engine modelará a relação como uma mudança de uso do mesmo artefato: `keep` representa estado persistente e `process` representa um working set temporário. Latência, capacidade e disponibilidade continuarão sendo propriedades reais do backend.

## Escopo do primeiro release técnico

O primeiro release deve ser pequeno o suficiente para ser testado em um runner limpo, mas já conter a ponte que o restante do sistema poderá reutilizar.

| Área | Primeiro corte | Fora do primeiro corte |
|---|---|---|
| Job model | Job, sessão, artefato, status, prioridade e manifest | Banco remoto obrigatório |
| Storage | Adaptador local em diretório temporário, streaming e checksums | R2, HF, Kaggle, Terabox e WebDAV reais |
| Memory bridge | Working set com `prepare`, `process`, `sync` e `cleanup` | mmap nativo, zram e montagem FUSE |
| Runners | Scheduler determinístico com capacidade declarada | Dispatch real para contas externas |
| Sessions | Event log versionado, validação e replay de eventos abstratos | Captura de navegador, stealth e captcha |
| Delivery | Biblioteca, CLI e exemplo Node executável | Publicação automática em todos os registries |

Essa ordem reduz o risco de acoplar o contrato público a credenciais, APIs externas ou detalhes de infraestrutura antes de haver testes determinísticos.

## Mapa de módulos

```text
src/
  index.ts                  # API pública estável
  core/
    errors.ts               # erros tipados e códigos de recuperação
    events.ts               # eventos de domínio e event sink
    ids.ts                  # IDs e relógio injetável
    result.ts               # resultado de operação sem exceção acidental
  domain/
    artifacts.ts            # manifest, chunks, checksums e ponteiros
    jobs.ts                 # job, status, prioridade e resultado
    sessions.ts             # sessão e eventos de interação
    providers.ts            # capacidade e estado de runner
  storage/
    adapter.ts              # contrato StorageAdapter
    local.ts                # implementação local segura para testes
    checksum.ts             # SHA-256 por streaming
  memory/
    bridge.ts               # ciclo do working set
    working-set.ts          # diretório de execução e lifecycle
  runners/
    scheduler.ts            # first-free-runner com critérios explícitos
    executor.ts             # execução do job contra um runner selecionado
  runtime/
    engine.ts               # orquestração: job → storage → runner → result
  cli/
    main.ts                 # comando `saddle`
tests/
  *.test.ts                 # testes unitários e de integração local
examples/
  local-job.ts              # exemplo sem credenciais
```

## Contratos públicos

O contrato público deve privilegiar objetos serializáveis. Isso torna possível executar a mesma definição em uma CLI, em um workflow ou em um endpoint sem obrigar o consumidor a importar classes internas.

| Contrato | Responsabilidade | Regra de desenho |
|---|---|---|
| `StorageAdapter` | Guardar, ler, remover e verificar artefatos | Conteúdo é `Uint8Array`/stream; o adapter não conhece jobs |
| `MemoryBridge` | Materializar e sincronizar um working set | Cada etapa é idempotente e registra transição |
| `RunnerProvider` | Declarar capacidade e executar uma função | O provider não escolhe o job seguinte |
| `RunnerScheduler` | Escolher o primeiro runner elegível | Ordenação é estável; empate usa prioridade declarada |
| `SessionLog` | Validar e persistir eventos | A sequência é append-only e versionada |
| `SaddleEngine` | Orquestrar o ciclo completo | Depende apenas das interfaces acima |

## Ciclo de execução

O ciclo principal é deliberadamente explícito:

```text
createJob
  → validate input
  → select runner
  → storage.prepare(manifest)
  → memory.prepare(job)
  → runner.execute(context)
  → memory.sync(result)
  → storage.commit(result)
  → emit completed
  → cleanup temporary state
```

Se uma etapa falhar, o engine preservará o `jobId`, a causa tipada, o último estado confirmado e os artefatos intermediários conhecidos. Retry será uma decisão do scheduler, não um efeito colateral escondido dentro do adapter.

## Estados e invariantes

Jobs seguem `queued → preparing → running → syncing → completed`. Os caminhos de erro são `failed` e `cancelled`; nenhuma transição volta silenciosamente para `queued`. Um job só pode ser `completed` depois de um commit de resultado verificável.

Uma sessão segue `created → recording → closed`. Eventos carregam `t` relativo, tipo discriminado e payload específico. O parser rejeita tipos desconhecidos, tempos negativos e IDs ausentes antes de entregar dados ao replay.

## Segurança e limites

O core não executará código arbitrário recebido pela rede e não terá acesso automático a credenciais. Adaptadores de execução deverão receber dependências por injeção e declarar explicitamente se aceitam rede, filesystem ou subprocesso. Nenhuma implementação de bypass de captcha, evasão de controles ou coleta de credenciais será incluída no primeiro corte do engine.

O adaptador local usará diretório temporário criado pelo processo, traversal protection e checksum SHA-256. Workflows GitHub serão adicionados somente para build e testes; dispatch remoto, publicação de pacote e escrita em repositórios externos ficarão em comandos separados e explícitos.

## Estratégia de compatibilidade

O core deve evitar `fs`, `Buffer`, `process` e `child_process`; essas dependências ficam confinadas em `src/storage/local.ts` e `src/cli/main.ts`. A biblioteca será distribuída como ESM, com declaração de tipos e um binário CLI Node. O contrato poderá ganhar adaptadores de browser, Deno, Bun e Cloudflare sem alterar os tipos de domínio.

## Critério de pronto desta etapa

Esta arquitetura será considerada implementada quando um teste puder criar um job, gravar um artefato no adapter local, selecionar um runner fake, executar uma função determinística, sincronizar um resultado, validar o checksum e recuperar um relatório final sem rede ou credenciais.
