# Saddle engine — checklist de implementação

## Auditoria e contratos

- [x] Auditar a base atual do repositório e confirmar branch, remotes e arquivos existentes.
- [x] Separar o escopo da biblioteca do escopo da interface visual.
- [x] Definir o runtime mínimo suportado e a política de compatibilidade.
- [x] Transformar a tese `storage == compute` em interfaces executáveis e testáveis.

## Núcleo da biblioteca

- [x] Criar o modelo de job, sessão, artefato, provider, storage backend e working set.
- [x] Implementar o event log versionado e a validação do Session JSON.
- [x] Implementar o scheduler que seleciona o primeiro runner disponível.
- [x] Implementar o bridge de storage com um adaptador local seguro e extensível.
- [x] Implementar o executor de jobs com ciclo `prepare → process → sync → cleanup`.

## Superfícies e entrega

- [x] Criar a API pública da biblioteca e a CLI inicial.
- [x] Adicionar testes unitários e testes de integração sem credenciais reais.
- [x] Adicionar package metadata, build, exports e exemplo executável.
- [x] Adicionar workflows GitHub Actions sem executar ações destrutivas.
- [x] Validar tudo localmente e revisar o diff antes do push.
- [x] Publicar a primeira implementação no repositório GitHub selecionado após confirmação final do diff.

## Migração de arquitetura

- [x] Remover o layout `src` e mover a lógica para módulos root based.
- [x] Migrar o engine de TypeScript para JavaScript ESM.
- [x] Renomear arquivos internos para lowercase sem underscore ou hyphen.
- [x] Substituir classes e identificadores públicos por nomes lowercase compatíveis com a skill.
- [x] Remover endereços e portas hardcoded do runtime e tornar opções parametrizáveis.
- [x] Manter o pacote `@devthink/saddle` como superfície de distribuição sem travar os adaptadores.

## Expansão do engine

- [x] Implementar os modos library, cli, binary, browser, headless e computer como superfícies independentes.
- [x] Adicionar memória interna, externa, física, vetorizada e de biblioteca como estratégias selecionáveis.
- [x] Adicionar adapters para GitHub, storage S3 compatible e dispatch de workflow sem credenciais no código.
- [x] Implementar API de sessão, replay abstrato e persistência JSONL.
- [x] Adicionar contrato de socket para realtime sem depender de uma plataforma única.
- [x] Manter alternativas de deploy abertas sem Netlify Functions ou Vercel Functions.

## Próxima frente do engine

- [x] Criar contratos de persistência para jobs sessions artifacts chunks e providers.
- [x] Adicionar schema operacional compatível com Prisma Drizzle e MySQL2 sem impor um driver.
- [x] Implementar queue de jobs idempotência retry e saga de compensação.
- [x] Adicionar workflow dispatch parametrizado e registro de run.
- [x] Adicionar browser session replay abstrato sem acoplar o core a um browser.
- [x] Adicionar scraping seguro com robots cache extraction e content types.
- [x] Criar packager para binary container e manifest de distribuição.
- [x] Adicionar adapters multiforge para GitLab Forgejo Gitea Codeberg e Hugging Face.
- [x] Criar contrato de browser e replay de eventos sem acoplar a um navegador.
- [x] Implementar parser de robots e respeito ao crawl delay.
- [x] Implementar cache com ttl e stale while revalidate.
- [x] Implementar extraction estruturada de metadata links e texto.
- [x] Criar manifest de distribuição para library cli binary e container.
- [x] Gerar plano de container sem fixar host ou port.
- [x] Criar adapter genérico de forge e wrappers GitLab Forgejo Gitea Codeberg e Hugging Face.

## Próxima camada operacional

- [x] Criar bot unificado com start stop command webhook schedule e status.
- [x] Criar parser de comandos e registro de adapters de plataforma.
- [x] Criar serializadores JSON NDJSON e SSE sem servidor obrigatório.
- [x] Criar streaming de blocos com backpressure configurável.
- [x] Adicionar adapter SQL neutro para Drizzle Prisma e MySQL2.
- [x] Adicionar workflows multiforge e manifests de execução.

## Roadmap P0 e P1

- [x] Criar memory engine com `memoryobject`, `computeresult`, targets e `safeload`.
- [x] Implementar transformações storage to compute e compute to storage.
- [x] Adicionar API universal de scrape, crawl, batch e health com SSE.
- [x] Adicionar rate limiting global, por usuário e por domínio.
- [x] Implementar crawling BFS com normalização de URL, sitemap e limite de domínio.
- [x] Adicionar queue persistente para crawl e fallback em memória.
- [x] Implementar `save` e `load` de sessões e extraction por schema.
- [x] Adicionar servidor MCP opcional com ferramentas scrape, crawl, batch, extract e serialize.
- [x] Criar Dockerfile seguro e docker compose parametrizado.
- [x] Adicionar runtime universal sem exigir fs, process ou Buffer no núcleo.
