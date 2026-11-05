import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizar, valoresUnicos, filtrarDestinos } from "../src/filtros.js";
import { DESTINOS } from "../src/destinos.js";

test("normalizar remove acentos e espaços", () => {
  assert.equal(normalizar("  Lençóis Maranhenses "), "lencois maranhenses");
  assert.equal(normalizar(undefined), "");
});

test("valoresUnicos retorna regiões sem repetição e ordenadas", () => {
  assert.deepEqual(valoresUnicos(DESTINOS, "regiao"), [
    "Centro-Oeste",
    "Nordeste",
    "Norte",
    "Sudeste",
    "Sul",
  ]);
});

test("sem filtros retorna todos os destinos", () => {
  assert.equal(filtrarDestinos(DESTINOS).length, DESTINOS.length);
  assert.equal(
    filtrarDestinos(DESTINOS, { regiao: "todas", tipo: "todos" }).length,
    DESTINOS.length,
  );
});

test("filtra por região", () => {
  const sul = filtrarDestinos(DESTINOS, { regiao: "Sul" });
  assert.ok(sul.length > 0);
  assert.ok(sul.every((d) => d.regiao === "Sul"));
});

test("filtra por tipo e região ao mesmo tempo", () => {
  const r = filtrarDestinos(DESTINOS, { regiao: "Nordeste", tipo: "Praia" });
  assert.deepEqual(r.map((d) => d.id), ["fernando-de-noronha"]);
});

test("busca ignora acentos e procura nos destaques", () => {
  assert.deepEqual(
    filtrarDestinos(DESTINOS, { busca: "cataratas" }).map((d) => d.id),
    ["foz-do-iguacu"],
  );
  assert.deepEqual(
    filtrarDestinos(DESTINOS, { busca: "lencois" }).map((d) => d.id),
    ["lencois-maranhenses"],
  );
});

test("busca sem resultado retorna lista vazia", () => {
  assert.equal(filtrarDestinos(DESTINOS, { busca: "antártida" }).length, 0);
});

test("todos os destinos têm os campos obrigatórios", () => {
  const ids = new Set();
  for (const d of DESTINOS) {
    for (const campo of ["id", "nome", "estado", "regiao", "tipo", "descricao", "melhorEpoca"]) {
      assert.ok(d[campo], `${d.id} sem ${campo}`);
    }
    assert.ok(d.destaques.length > 0);
    assert.equal(d.cores.length, 2);
    assert.ok(!ids.has(d.id), `id duplicado: ${d.id}`);
    ids.add(d.id);
  }
});
