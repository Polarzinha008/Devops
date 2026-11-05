// Fotos dos destinos, todas do Wikimedia Commons (licenças livres).
// O autor e a licença completos ficam na página de cada arquivo (paginaFoto).

const COMMONS = "https://commons.wikimedia.org";

export const FOTO_HERO = {
  arquivo: "Rio de Janeiro, Brazil -08.jpg",
  autor: "Wilfredor",
  licenca: "CC0",
  legenda: "Bondinho do Pão de Açúcar, Rio de Janeiro",
};

export const FOTOS = {
  "rio-de-janeiro": {
    arquivo: "Rio de Janeiro, Pão de Açúcar from Cristo Redentor (15744316848).jpg",
    legenda: "Pão de Açúcar visto do Cristo Redentor",
  },
  "foz-do-iguacu": {
    arquivo: "Iguazu Falls Cataratas Brazil Side Luca Galuzzi 2005.jpg",
    autor: "Luca Galuzzi",
    licenca: "CC BY-SA 2.5",
    legenda: "Cataratas do Iguaçu, lado brasileiro",
  },
  salvador: {
    arquivo: "Centro Histórico de Salvador Bahia Largo do Pelourinho 2019-6501.jpg",
    autor: "Paul R. Burley",
    licenca: "CC BY-SA 4.0",
    legenda: "Largo do Pelourinho, Salvador",
  },
  "fernando-de-noronha": {
    arquivo: "Fernando de Noronha Conceicao Beach.jpg",
    legenda: "Praia da Conceição, Fernando de Noronha",
  },
  bonito: {
    arquivo: "Gruta do Lago Azul em Bonito.jpg",
    autor: "Marcel Favery",
    licenca: "CC BY-SA 3.0",
    legenda: "Gruta do Lago Azul, Bonito",
  },
  manaus: {
    arquivo: "Teatro amazonas.jpg",
    autor: "Pontanegra",
    legenda: "Teatro Amazonas, Manaus",
  },
  gramado: {
    arquivo: "Lagonegro3.jpg",
    legenda: "Lago Negro, Gramado",
  },
  "ouro-preto": {
    arquivo: "Ouro Preto November 2009-7.jpg",
    autor: "Alvesgaspar",
    licenca: "CC BY-SA 3.0",
    legenda: "Centro histórico de Ouro Preto",
  },
  "lencois-maranhenses": {
    arquivo: "Os lencois.jpg",
    licenca: "CC BY-SA 4.0",
    legenda: "Dunas e lagoas dos Lençóis Maranhenses",
  },
  "chapada-dos-veadeiros": {
    arquivo: "Chapada dos Veadeiros 18.jpg",
    legenda: "Chapada dos Veadeiros, Goiás",
  },
};

/** URL da imagem redimensionada pelo próprio Wikimedia. */
export function urlFoto(arquivo, largura = 960) {
  return `${COMMONS}/wiki/Special:FilePath/${encodeURIComponent(arquivo)}?width=${largura}`;
}

/** Página do arquivo no Commons, com autor e licença. */
export function paginaFoto(arquivo) {
  return `${COMMONS}/wiki/File:${encodeURIComponent(arquivo.replaceAll(" ", "_"))}`;
}

/** Texto curto de crédito, ex.: "Foto: Luca Galuzzi (CC BY-SA 2.5)". */
export function creditoFoto(foto) {
  const autor = foto.autor ?? "Wikimedia Commons";
  return foto.licenca ? `Foto: ${autor} (${foto.licenca})` : `Foto: ${autor}`;
}
