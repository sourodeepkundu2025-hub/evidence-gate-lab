# Evidence Gate Lab

![Interactive evidence pipeline and decision trace](assets/demo.png)

[Open the interactive demo](https://sourodeepkundu2025-hub.github.io/evidence-gate-lab/)

A working reference implementation of a small, inspectable evidence pipeline: retrieve passages, fit a word budget, quote with source IDs, check citations, or abstain.

Created as a public engineering showcase in October 2026. It demonstrates ideas from retrieval and agentic-system engineering without including employer systems, private documents or claims of enterprise deployment.

## Run

```sh
npm test
npm run demo
python -m http.server 8001 --bind 127.0.0.1
```

Open http://127.0.0.1:8001/. Choose a query, reduce the evidence budget, or request a write action. Observe the evidence and decision trace.

Node.js 22+ is required for tests; browser operation has no dependencies or keys.

## Implemented decisions

1. Validate the query, budget and unique evidence IDs.
2. Permit only explicitly granted read requests.
3. Exclude private fixtures from retrieval.
4. Rank public passages by unique query-word coverage, with stable ID tie-breaking.
5. Select complete passages within an explicit word budget.
6. Verify each normalized quotation against its cited passage.
7. Return supported extractive evidence or an explicit abstention reason.

## What this proves

The regression suite verifies source-ID handling, provenance checks, budget bounds, private-fixture exclusion and refusal behavior. All example passages are synthetic; even the private-labeled fixture is invented.

## What it does not prove

This is **not a trained LLM or semantic RAG benchmark**. Word coverage is a lexical heuristic, not confidence. A verified quote proves provenance, not truth, relevance or entailment. The trace records real deterministic decisions, not simulated model reasoning.

The permission gate is an application-layer teaching example; it is not a production security boundary. This project performs no tool writes, network actions or model calls. Provenance-aware generative answers require a separate model adapter, evaluation dataset and entailment checks.

## Architecture and extension

`src/gate.mjs` is shared by browser, tests and CLI. `fixtures.mjs` holds the invented corpus. The UI uses text nodes rather than rendering corpus text as HTML.

Future experiments: add independently evaluated BM25/vector retrieval, counterfactual evidence tests, per-adapter permission enforcement, signed execution receipts and an explicitly opt-in local-model interface.

Keep model benchmarks separate from this deterministic baseline. Record precision/recall, abstention trade-offs and latency on a fixed labeled dataset before making performance claims.

## Contributing

Use a branch and PR; run `npm test`. Submit reproducible cases for wrong citations, budget errors or unsupported requests. No private input corpus, credentials or employer code belongs here.
