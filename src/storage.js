const DECKS_KEY = 'ygo-decks';

function getAllDecks() {
    const decks = localStorage.getItem(DECKS_KEY);
    return decks ? JSON.parse(decks) : {};
}

function getDeck(name) {
    const decks = getAllDecks();
    return decks[name];
}

function saveDeck(name, deck, metadata = {}) {
    const decks = getAllDecks();
    if (!decks[name]) {
        decks[name] = {
            versions: [],
            current: 0,
        };
    }
    decks[name].versions.push({
        timestamp: Date.now(),
        deck: deck,
        format: metadata.format || 'none',
        notes: metadata.notes || '',
        stats: {
            mainCount: deck.main?.length || 0,
            extraCount: deck.extra?.length || 0,
            sideCount: deck.side?.length || 0,
        },
    });
    decks[name].current = decks[name].versions.length - 1;
    localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
}

function deleteDeck(name) {
    const decks = getAllDecks();
    delete decks[name];
    localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
}

function renameDeck(oldName, newName) {
    const decks = getAllDecks();
    if (decks[oldName]) {
        decks[newName] = decks[oldName];
        delete decks[oldName];
        localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
    }
}

function setCurrentVersion(name, index) {
    const decks = getAllDecks();
    if (decks[name] && index >= 0 && index < decks[name].versions.length) {
        decks[name].current = index;
        localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
    }
}

function deleteVersion(name, index) {
    const decks = getAllDecks();
    if (decks[name] && index >= 0 && index < decks[name].versions.length) {
        // Don't allow deleting if it's the only version
        if (decks[name].versions.length <= 1) {
            return false;
        }
        // Don't allow deleting the current version
        if (index === decks[name].current) {
            return false;
        }
        decks[name].versions.splice(index, 1);
        // Adjust current index if necessary
        if (decks[name].current > index) {
            decks[name].current--;
        }
        localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
        return true;
    }
    return false;
}

function updateVersionNotes(name, index, notes) {
    const decks = getAllDecks();
    if (decks[name] && index >= 0 && index < decks[name].versions.length) {
        decks[name].versions[index].notes = notes;
        localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
        return true;
    }
    return false;
}

export {
    getAllDecks,
    getDeck,
    saveDeck,
    deleteDeck,
    renameDeck,
    setCurrentVersion,
    deleteVersion,
    updateVersionNotes,
};
