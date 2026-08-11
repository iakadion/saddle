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
- [ ] Publicar a primeira implementação no repositório GitHub selecionado após confirmação final do diff.
