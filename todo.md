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
- [ ] Remover endereços e portas hardcoded do runtime e tornar opções parametrizáveis.
- [x] Manter o pacote `@devthink/saddle` como superfície de distribuição sem travar os adaptadores.

## Expansão do engine

- [x] Implementar os modos library, cli, binary, browser, headless e computer como superfícies independentes.
- [x] Adicionar memória interna, externa, física, vetorizada e de biblioteca como estratégias selecionáveis.
- [x] Adicionar adapters para GitHub, storage S3 compatible e dispatch de workflow sem credenciais no código.
- [x] Implementar API de sessão, replay abstrato e persistência JSONL.
- [x] Adicionar contrato de socket para realtime sem depender de uma plataforma única.
- [x] Manter alternativas de deploy abertas sem Netlify Functions ou Vercel Functions.
