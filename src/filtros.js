// Funções puras de filtragem (testadas em tests/filtros.test.js).

/** Remove acentos e deixa em minúsculas, para buscas mais tolerantes. */
export function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Lista de valores únicos de um campo, em ordem alfabética. */
export function valoresUnicos(destinos, campo) {
  return [...new Set(destinos.map((d) => d[campo]))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

/**
 * Filtra destinos por texto livre (nome, estado, descrição ou destaques),
 * região e tipo. Filtros vazios ou "todas"/"todos" são ignorados.
 */
export function filtrarDestinos(destinos, { busca = "", regiao = "", tipo = "" } = {}) {
  const termo = normalizar(busca);
  const ignorar = (v) => !v || v === "todas" || v === "todos";

  return destinos.filter((d) => {
    if (!ignorar(regiao) && d.regiao !== regiao) return false;
    if (!ignorar(tipo) && d.tipo !== tipo) return false;
    if (!termo) return true;
    const alvo = normalizar(
      [d.nome, d.estado, d.descricao, ...d.destaques].join(" "),
    );
    return alvo.includes(termo);
  });
}
