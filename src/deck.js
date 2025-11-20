import { writable } from "svelte/store";
import { parseYdke } from "./utils";
import { getCardDb, getAltId, cardLimit, cardGenesysPoint } from "./card_db";
import { getAllDecks, saveDeck as saveDeckToStorage } from "./storage";

let deck = writable({ main: [], extra: [], side: [] });
let deckState = { main: [], extra: [], side: [] };

let currentDeckName = writable(null);
let currentDeckNameState = null;

function setCurrentDeckName(name) {
  currentDeckNameState = name;
  currentDeckName.set(name);
}

let defaultFormat = "none";
let format = writable(defaultFormat);
let formatState = defaultFormat;

function sanitizeDeck(cardCnt, deck) {
  let cardDb = getCardDb();
  let altId = getAltId();
  let ret = [];
  for (let id of deck) {
    if (altId[id] !== undefined) {
      id = String(altId[id]);
    }
    if (cardDb[id] === undefined) {
      continue;
    }
    if (!cardCnt.has(id)) {
      cardCnt.set(id, 0);
    }
    if (cardCnt.get(id) >= 3) {
      continue;
    }
    ret.push(id);
    cardCnt.set(id, cardCnt.get(id) + 1);
  }
  return ret;
}

function groupAndSort(arr) {
  const seen = {};
  const count = {};
  const uniqueList = [];

  for (const num of arr) {
    if (!(num in seen)) {
      seen[num] = true;
      uniqueList.push(num);
    }
    count[num] = (count[num] || 0) + 1;
  }

  const result = [];
  for (const num of uniqueList) {
    const times = count[num];
    for (let i = 0; i < times; i++) {
      result.push(num);
    }
  }
  return result;
}

function genesysPoint(d) {
  let point = 0;
  for (let c of d.main) {
    point += cardGenesysPoint(c);
  }
  for (let c of d.extra) {
    point += cardGenesysPoint(c);
  }
  for (let c of d.side) {
    point += cardGenesysPoint(c);
  }
  return point;
}

function setDeck(d) {
  let cardCnt = new Map();

  d.main = sanitizeDeck(cardCnt, d.main);
  d.main = groupAndSort(d.main);

  d.side = sanitizeDeck(cardCnt, d.side);
  d.side = groupAndSort(d.side);

  d.extra = sanitizeDeck(cardCnt, d.extra);
  d.extra = groupAndSort(d.extra);

  if (formatState === "genesys") {
    d.point = genesysPoint(d);
  }

  deckState = d;
  deck.set(d);
}

function canAdd(d, id) {
  let count = 0;
  for (let c of d.main) {
    if (c === id) count += 1;
  }
  for (let c of d.side) {
    if (c === id) count += 1;
  }
  for (let c of d.extra) {
    if (c === id) count += 1;
  }
  if (count + 1 > cardLimit(id, formatState)) return false;
  return true;
}

let deckOps = {
  deleteCard: (from, idx) => {
    if (from === "main") {
      deckState.main.splice(idx, 1);
      setDeck(deckState);
    } else if (from === "side") {
      deckState.side.splice(idx, 1);
      setDeck(deckState);
    } else if (from === "extra") {
      deckState.extra.splice(idx, 1);
      setDeck(deckState);
    }
  },
  move: (from, to, fromIdx, toIdx) => {
    let cardDb = getCardDb();
    let id = deckState[from][fromIdx];
    if (cardDb[id].isExtra && to === "main") return;
    if (!cardDb[id].isExtra && to === "extra") return;
    if (from === to) {
      let count = 0;
      for (let c of deckState[from]) {
        if (c === id) count += 1;
      }
      deckState[from] = deckState[from].map((x) => (x === id ? null : x));
      if (to === "main") {
        for (let i = 0; i < count; i++) {
          deckOps.add2main(id, toIdx);
        }
      } else if (to === "extra") {
        for (let i = 0; i < count; i++) {
          deckOps.add2extra(id, toIdx);
        }
      } else if (to === "side") {
        for (let i = 0; i < count; i++) {
          deckOps.add2side(id, toIdx);
        }
      }
      deckState[from] = deckState[from].filter((x) => x !== null);
    } else {
      if (to === "extra") {
        deckState[from][fromIdx] = null;
        deckOps.add2extra(id, toIdx);
        deckState[from] = deckState[from].filter((x) => x !== null);
      } else if (to === "main") {
        deckState[from][fromIdx] = null;
        deckOps.add2main(id, toIdx);
        deckState[from] = deckState[from].filter((x) => x !== null);
      } else if (to === "side") {
        deckState[from][fromIdx] = null;
        deckOps.add2side(id, toIdx);
        deckState[from] = deckState[from].filter((x) => x !== null);
      }
    }
    setDeck(deckState);
  },
  add2extra: (id, targetIdx) => {
    let cardDb = getCardDb();
    if (!cardDb[id].isExtra) return;
    let d = deckState;
    if (canAdd(d, id)) {
      if (targetIdx === -1) d.extra.push(id);
      else if (d.extra.includes(id)) {
        d.extra.push(id);
        d.extra = groupAndSort(d.extra);
      } else {
        d.extra.splice(targetIdx, 0, id);
      }
      setDeck(d);
    }
  },
  add2main: (id, targetIdx) => {
    let cardDb = getCardDb();
    if (cardDb[id].isExtra) return;
    let d = deckState;
    if (canAdd(d, id)) {
      if (targetIdx === -1) d.main.push(id);
      else if (d.main.includes(id)) {
        d.main.push(id);
        d.main = groupAndSort(d.main);
      } else {
        d.main.splice(targetIdx, 0, id);
      }
      setDeck(d);
    }
  },
  add2side: (id, targetIdx) => {
    let d = deckState;
    if (canAdd(d, id)) {
      if (targetIdx === -1) d.side.push(id);
      else if (d.side.includes(id)) {
        d.side.push(id);
        d.side = groupAndSort(d.side);
      } else {
        d.side.splice(targetIdx, 0, id);
      }
      setDeck(d);
    }
  },
};

function loadDeck(name, version) {
  const decks = getAllDecks();
  const deckData = decks[name];
  if (deckData) {
    const versionIndex = version === undefined ? deckData.current : version;
    const deckToLoad = deckData.versions[versionIndex].deck;
    setDeck(deckToLoad);
    setCurrentDeckName(name);
  }
}

function saveCurrentDeck(name, notes = "") {
  const deckToSave = { ...deckState };
  saveDeckToStorage(name, deckToSave, { format: formatState, notes });
  setCurrentDeckName(name);
}

function initDeck() {
  const DEFAULT_DECK_NAME = "Default";

  let url = window.location.href.split("#");
  if (url.length === 2) {
    let deck = parseYdke(url[1]);
    if (deck.main.length > 0 || deck.extra.length > 0 || deck.side.length > 0) {
      setDeck(deck);
      // Save the imported deck to Default deck
      saveCurrentDeck(DEFAULT_DECK_NAME, "Imported from URL");
      window.location.href = url[0];
      return;
    }
  }

  const decks = getAllDecks();
  const deckNames = Object.keys(decks);

  // Load the most recently edited deck if any decks exist
  if (deckNames.length > 0) {
    const lastDeckName = deckNames.reduce((a, b) => {
      const aTimestamp = decks[a].versions[decks[a].current].timestamp;
      const bTimestamp = decks[b].versions[decks[b].current].timestamp;
      return aTimestamp > bTimestamp ? a : b;
    });
    loadDeck(lastDeckName);
  } else {
    // Only create Default deck when no decks exist
    setDeck({ main: [], extra: [], side: [] });
    saveCurrentDeck(DEFAULT_DECK_NAME, "Auto-created default deck");
  }

  let cachedFormat = localStorage.getItem("format");
  if (cachedFormat !== null) {
    setFormat(cachedFormat);
  }
}

function setFormat(newFormat) {
  localStorage.setItem("format", newFormat);
  formatState = newFormat;
  format.set(newFormat);
  setDeck(deckState);
}

export {
  deck,
  format,
  formatState,
  currentDeckName,
  setFormat,
  setDeck,
  deckOps,
  initDeck,
  loadDeck,
  saveCurrentDeck,
  setCurrentDeckName,
};
