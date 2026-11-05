import { test } from "node:test";
import assert from "node:assert/strict";
import { DESTINOS } from "../src/destinos.js";
import { FOTOS, FOTO_HERO, urlFoto, paginaFoto, creditoFoto } from "../src/fotos.js";

test("todo destino tem uma foto com arquivo e legenda", () => {
  for (const d of DESTINOS) {
    const foto = FOTOS[d.id];
    assert.ok(foto, `${d.id} sem foto`);
    assert.match(foto.arquivo, /\.(jpe?g|png)$/i);
    assert.ok(foto.legenda);
  }
  assert.ok(FOTO_HERO.arquivo);
});

test("não há fotos sobrando sem destino", () => {
  const ids = new Set(DESTINOS.map((d) => d.id));
  for (const id of Object.keys(FOTOS)) assert.ok(ids.has(id), `foto órfã: ${id}`);
});

test("urlFoto aponta para o Commons com largura e nome codificado", () => {
  assert.equal(
    urlFoto("Os lencois.jpg", 640),
    "https://commons.wikimedia.org/wiki/Special:FilePath/Os%20lencois.jpg?width=640",
  );
  assert.match(urlFoto("a.jpg"), /width=960$/);
});

test("paginaFoto troca espaços por _ e codifica acentos", () => {
  assert.equal(
    paginaFoto("Gruta do Lago Azul em Bonito.jpg"),
    "https://commons.wikimedia.org/wiki/File:Gruta_do_Lago_Azul_em_Bonito.jpg",
  );
  assert.match(paginaFoto("Pão.jpg"), /File:P%C3%A3o\.jpg$/);
});

test("creditoFoto monta o texto com ou sem autor/licença", () => {
  assert.equal(creditoFoto({ autor: "Ana", licenca: "CC0" }), "Foto: Ana (CC0)");
  assert.equal(creditoFoto({ autor: "Ana" }), "Foto: Ana");
  assert.equal(creditoFoto({ licenca: "CC BY-SA 4.0" }), "Foto: Wikimedia Commons (CC BY-SA 4.0)");
  assert.equal(creditoFoto({}), "Foto: Wikimedia Commons");
});
