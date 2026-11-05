import { DESTINOS } from "./destinos.js";
import { filtrarDestinos, valoresUnicos } from "./filtros.js";
import { FOTOS, FOTO_HERO, urlFoto, paginaFoto, creditoFoto } from "./fotos.js";

const $ = (seletor) => document.querySelector(seletor);

const lista = $("#lista-destinos");
const contador = $("#contador");
const campoBusca = $("#busca");
const seletorTipo = $("#tipo");
const chipsRegiao = $("#chips-regiao");
const vazio = $("#vazio");
const dialogo = $("#detalhes");

const estado = { regiao: "todas" };

function el(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

/** Imagem com carregamento preguiçoso; se falhar, mostra o gradiente do destino. */
function criarFoto(destino, largura) {
  const foto = FOTOS[destino.id];
  const img = el("img");
  img.src = urlFoto(foto.arquivo, largura);
  img.alt = foto.legenda;
  img.loading = "lazy";
  img.decoding = "async";
  img.addEventListener("error", () => img.parentElement?.classList.add("sem-foto"));
  return img;
}

function preencherCredito(link, foto) {
  link.href = paginaFoto(foto.arquivo);
  link.textContent = creditoFoto(foto);
}

// ---------- Filtros ----------

function criarChip(valor, rotulo) {
  const chip = el("button", "chip", rotulo);
  chip.type = "button";
  chip.dataset.valor = valor;
  chip.setAttribute("aria-pressed", String(estado.regiao === valor));
  chip.addEventListener("click", () => {
    estado.regiao = valor;
    for (const c of chipsRegiao.children) {
      c.setAttribute("aria-pressed", String(c.dataset.valor === valor));
    }
    renderizar();
  });
  return chip;
}

function montarFiltros() {
  chipsRegiao.append(criarChip("todas", "Todas as regiões"));
  for (const regiao of valoresUnicos(DESTINOS, "regiao")) chipsRegiao.append(criarChip(regiao, regiao));
  for (const tipo of valoresUnicos(DESTINOS, "tipo")) {
    const opcao = el("option", undefined, tipo);
    opcao.value = tipo;
    seletorTipo.append(opcao);
  }
}

function limparFiltros() {
  campoBusca.value = "";
  seletorTipo.value = "todos";
  chipsRegiao.firstElementChild.click();
}

// ---------- Cards ----------

function criarCard(destino) {
  const card = el("article", "card");
  card.style.setProperty("--cor-1", destino.cores[0]);
  card.style.setProperty("--cor-2", destino.cores[1]);

  const capa = el("div", "card-capa");
  capa.append(criarFoto(destino, 640), el("span", "selo", destino.tipo), el("span", "uf", destino.estado));

  const corpo = el("div", "card-corpo");
  const epoca = el("p", "card-epoca");
  epoca.append(el("span", undefined, "Melhor época: "), el("strong", undefined, destino.melhorEpoca));
  const botao = el("button", "botao botao-contorno", "Ver detalhes");
  botao.type = "button";
  botao.addEventListener("click", () => abrirDetalhes(destino));
  corpo.append(
    el("p", "regiao", `Região ${destino.regiao}`),
    el("h3", undefined, destino.nome),
    el("p", "card-descricao", destino.descricao),
    epoca,
    botao,
  );

  card.append(capa, corpo);
  return card;
}

function renderizar() {
  const resultado = filtrarDestinos(DESTINOS, {
    busca: campoBusca.value,
    regiao: estado.regiao,
    tipo: seletorTipo.value,
  });
  lista.replaceChildren(...resultado.map(criarCard));
  vazio.hidden = resultado.length > 0;
  contador.textContent =
    resultado.length === 1 ? "1 destino encontrado" : `${resultado.length} destinos encontrados`;
}

// ---------- Detalhes ----------

function abrirDetalhes(destino) {
  const foto = FOTOS[destino.id];
  const figura = dialogo.querySelector(".detalhes-foto");
  figura.classList.remove("sem-foto");
  figura.style.setProperty("--cor-1", destino.cores[0]);
  figura.style.setProperty("--cor-2", destino.cores[1]);
  const img = figura.querySelector("img");
  img.onerror = () => figura.classList.add("sem-foto");
  img.src = urlFoto(foto.arquivo, 1280);
  img.alt = foto.legenda;
  preencherCredito(figura.querySelector(".credito"), foto);

  dialogo.querySelector(".detalhes-meta").textContent = `${destino.tipo} · Região ${destino.regiao}`;
  dialogo.querySelector("h3").textContent = `${destino.nome} (${destino.estado})`;
  dialogo.querySelector(".descricao").textContent = destino.descricao;
  dialogo.querySelector(".epoca").textContent = destino.melhorEpoca;
  dialogo
    .querySelector(".tags")
    .replaceChildren(...destino.destaques.map((item) => el("li", undefined, item)));
  dialogo.showModal();
}

// ---------- Rodapé e cabeçalho ----------

function montarCreditos() {
  const itens = [FOTO_HERO, ...DESTINOS.map((d) => FOTOS[d.id])].map((foto) => {
    const li = el("li");
    const link = el("a", undefined, foto.legenda);
    link.href = paginaFoto(foto.arquivo);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    li.append(link, ` · ${creditoFoto(foto).replace("Foto: ", "")}`);
    return li;
  });
  $("#lista-creditos").replaceChildren(...itens);
}

function cabecalhoAoRolar() {
  const topo = $("#topo");
  const atualizar = () => topo.classList.toggle("solido", window.scrollY > 40);
  window.addEventListener("scroll", atualizar, { passive: true });
  atualizar();
}

// ---------- Início ----------

montarFiltros();
montarCreditos();
cabecalhoAoRolar();
preencherCredito($("#credito-hero"), FOTO_HERO);
$("#num-destinos").textContent = String(DESTINOS.length);
$("#num-tipos").textContent = String(valoresUnicos(DESTINOS, "tipo").length);
// Se a foto de capa falhar (inclusive antes deste script rodar), fica só o gradiente.
const fotoHero = $(".hero-foto");
if (fotoHero.complete && fotoHero.naturalWidth === 0) fotoHero.remove();
else fotoHero.addEventListener("error", () => fotoHero.remove());

$("#form-busca").addEventListener("submit", (e) => {
  e.preventDefault();
  renderizar();
  $("#destinos").scrollIntoView({ behavior: "smooth" });
});
campoBusca.addEventListener("input", renderizar);
seletorTipo.addEventListener("change", renderizar);
$("#limpar").addEventListener("click", limparFiltros);
dialogo.querySelector(".fechar").addEventListener("click", () => dialogo.close());
dialogo.addEventListener("click", (e) => {
  if (e.target === dialogo) dialogo.close(); // clique fora fecha
});
$("#ano").textContent = String(new Date().getFullYear());
renderizar();
