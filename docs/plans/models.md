# Modelos Grátis (Free) — Catálogo Completo

Listas de modelos **free** separadas por API (filtro: `-free`, `/free`, `:free`).
Fontes: `api.kilo.ai/api/gateway/models`, `opencode.ai/zen/v1/models`, `openrouter.ai/api/v1/models`.

**Total único (desduplicado): 26 modelos** (OpenCode 8 + OpenRouter 6 únicos + Kilo 3 únicos + 9 compartilhados).

> **Ctrl+F vs deduplicado:** se você busca a string `:free` no JSON cru, o contador mostra **14 no OpenRouter e 14 no Kilo**. Isso porque o Ctrl+F conta *ocorrências de texto*, não modelos únicos: no Kilo o gateway cita `stepfun/step-3.7-flash:free`, `poolside/laguna-s-2.1:free` e `tencent/hy3:free` duas vezes (bloco `autoRouting` + lista de dados), e o OpenRouter tem 14 com `:free` + 1 com `/free` (`openrouter/free`). O número real de modelos únicos por API é **15 OpenRouter, 12 Kilo, 8 OpenCode**.

---

## 1. OpenCode Zen — 8

| Modelo | Contexto total | Max output | Input → Output |
|---|---|---|---|
| deepseek-v4-flash-free | 1 048 576 | 393 216 | text → text |
| mimo-v2.5-free | 1 050 000 | 131 072 | text+audio+image+video → text |
| ling-3.0-flash-free | 262 144 | 32 768 | text → text |
| ling-3.0-tiny-free | 262 144 | 32 768 | text → text |
| nemotron-3-ultra-free | 1 000 000 | 65 536 | text → text |
| north-mini-code-free | 256 000 | 64 000 | text → text |
| laguna-s-2.1-free | 262 144 | 32 768 | text → text |
| longcat-2.0-free | 1 048 756 | 262 144 | text → text |

## 2. OpenRouter — 15

| Modelo | Contexto total | Max output | Input → Output |
|---|---|---|---|
| openrouter/free | 200 000 | n/a | text+image → text |
| nvidia/nemotron-3.5-content-safety:free | 128 000 | 8 192 | text+image → text |
| nvidia/nemotron-3-ultra-550b-a55b:free | 1 000 000 | 65 536 | text → text |
| nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free | 256 000 | 65 536 | text+audio+image+video → text |
| nvidia/nemotron-3-super-120b-a12b:free | 262 144 | 262 144 | text → text |
| nvidia/nemotron-3-nano-30b-a3b:free | 256 000 | 262 144¹ | text → text |
| nvidia/nemotron-nano-12b-v2-vl:free | 128 000 | 128 000 | text+image+video → text |
| nvidia/nemotron-nano-9b-v2:free | 128 000 | n/a | text → text |
| google/gemma-4-26b-a4b-it:free | 262 144 | 32 768 | text+image+video → text |
| google/gemma-4-31b-it:free | 262 144 | 32 768 | text+image+video → text |
| openai/gpt-oss-20b:free | 131 072 | 32 768 | text → text |
| poolside/laguna-s-2.1:free | 262 144 | 32 768 | text → text |
| poolside/laguna-xs-2.1:free | 262 144 | 32 768 | text → text |
| inclusionai/ling-3.0-tiny:free | 262 144 | 32 768 | text → text |
| cohere/north-mini-code:free | 256 000 | 64 000 | text → text |

## 3. Kilo — 12

| Modelo | Contexto total | Max output | Input → Output |
|---|---|---|---|
| kilo-auto/free | 256 000 | 10 000 | text → text |
| openrouter/free | 200 000 | n/a | text+image → text |
| stepfun/step-3.7-flash:free | 262 144 | 262 144 | text+image → text |
| tencent/hy3:free | 262 144 | 128 000 | text → text |
| poolside/laguna-s-2.1:free | 262 144 | 32 768 | text → text |
| poolside/laguna-xs-2.1:free | 262 144 | 32 768 | text → text |
| inclusionai/ling-3.0-tiny:free | 262 144 | 32 768 | text → text |
| cohere/north-mini-code:free | 256 000 | 64 000 | text → text |
| nvidia/nemotron-3.5-content-safety:free | 128 000 | 8 192 | text+image → text |
| nvidia/nemotron-3-ultra-550b-a55b:free | 1 000 000 | 65 536 | text → text |
| nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free | 256 000 | 65 536 | text+audio+image+video → text |
| nvidia/nemotron-3-super-120b-a12b:free | 262 144 | 262 144 | text → text |

---

**Desduplicação:** os 9 modelos a seguir aparecem em OpenRouter **e** Kilo (`openrouter/free`, `poolside/laguna-s-2.1:free`, `poolside/laguna-xs-2.1:free`, `inclusionai/ling-3.0-tiny:free`, `cohere/north-mini-code:free`, `nvidia/nemotron-3.5-content-safety:free`, `nvidia/nemotron-3-ultra-550b-a55b:free`, `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`, `nvidia/nemotron-3-super-120b-a12b:free`).