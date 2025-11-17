<script lang="js">
    import { onMount } from "svelte";
    import { getAllDecks, deleteDeck, renameDeck } from "../storage.js";
    import {
        loadDeck,
        saveCurrentDeck,
        currentDeckName,
        setDeck,
    } from "../deck.js";
    import DeckVersions from "./deck_versions.svelte";
    import { currentTranslations } from "../language";

    let decks = {};
    let saveNotes = "";
    let renamingDeck = null;
    let newName = "";
    let selectedDeck = null;
    let showCreateNew = false;
    let newDeckName = "";

    onMount(() => {
        decks = getAllDecks();
    });

    function handleDelete(name) {
        const confirmMessage = $currentTranslations.confirmDelete
            ? $currentTranslations.confirmDelete.replace("{name}", name)
            : `Are you sure you want to delete deck "${name}"?`;

        if (confirm(confirmMessage)) {
            const isCurrentDeck = $currentDeckName === name;

            try {
                deleteDeck(name);
                decks = getAllDecks();

                // If we deleted the current deck, we need to switch to another one
                if (isCurrentDeck) {
                    const deckNames = Object.keys(decks);
                    if (deckNames.length > 0) {
                        // Load the first available deck
                        loadDeck(deckNames[0]);
                    } else {
                        // No decks left, create an empty Default deck
                        setDeck({ main: [], extra: [], side: [] });
                        saveCurrentDeck(
                            "Default",
                            "Auto-created after deck deletion",
                        );
                        decks = getAllDecks();
                    }
                }
            } catch (error) {
                alert("Error deleting deck: " + error.message);
            }
        }
    }

    function handleRename(name) {
        renamingDeck = name;
        newName = name;
    }

    function handleRenameSubmit() {
        if (newName && newName !== renamingDeck) {
            renameDeck(renamingDeck, newName);
            if ($currentDeckName === renamingDeck) {
                loadDeck(newName);
            }
            decks = getAllDecks();
        }
        renamingDeck = null;
    }

    function handleSave() {
        if ($currentDeckName) {
            saveCurrentDeck($currentDeckName, saveNotes);
            decks = getAllDecks();
            saveNotes = "";
        }
    }

    function handleCreateNew() {
        if (newDeckName) {
            // Create an empty deck
            setDeck({ main: [], extra: [], side: [] });
            saveCurrentDeck(newDeckName, "New deck");
            decks = getAllDecks();
            newDeckName = "";
            showCreateNew = false;
        }
    }

    function handleSelectDeck(name) {
        selectedDeck = name;
    }
</script>

<div class="deck-manager">
    {#if selectedDeck}
        <DeckVersions
            deckName={selectedDeck}
            on:back={() => (selectedDeck = null)}
        />
    {:else}
        {#if $currentDeckName}
            <div class="current-deck-section">
                <div class="section-header">
                    <h3>
                        {$currentTranslations.currentDeck}: {$currentDeckName}
                    </h3>
                </div>
                <div class="save-form">
                    <input
                        type="text"
                        class="input"
                        placeholder={$currentTranslations.notesOptional}
                        bind:value={saveNotes}
                    />
                    <button class="btn primary" on:click={handleSave}
                        >{$currentTranslations.save}</button
                    >
                </div>
            </div>
        {/if}

        <div class="create-section">
            {#if showCreateNew}
                <div class="create-form">
                    <input
                        type="text"
                        class="input"
                        placeholder={$currentTranslations.newDeckName}
                        bind:value={newDeckName}
                    />
                    <button class="btn primary" on:click={handleCreateNew}
                        >{$currentTranslations.create}</button
                    >
                    <button
                        class="btn secondary"
                        on:click={() => {
                            showCreateNew = false;
                            newDeckName = "";
                        }}>{$currentTranslations.cancel}</button
                    >
                </div>
            {:else}
                <button
                    class="btn create-btn"
                    on:click={() => (showCreateNew = true)}
                    >+ {$currentTranslations.createNewDeck}</button
                >
            {/if}
        </div>

        <div class="deck-list-section">
            <h3 class="section-title">{$currentTranslations.savedDecks}</h3>
            <div class="deck-list">
                {#if Object.keys(decks).length === 0}
                    <p class="empty-message">
                        {$currentTranslations.noDecksYet}
                    </p>
                {:else}
                    {#each Object.entries(decks) as [name, deckData]}
                        <div
                            class="deck-item"
                            class:active={name === $currentDeckName}
                        >
                            {#if renamingDeck === name}
                                <input
                                    type="text"
                                    class="input"
                                    bind:value={newName}
                                />
                                <div class="deck-actions">
                                    <button
                                        class="btn small primary"
                                        on:click={handleRenameSubmit}
                                        >{$currentTranslations.save}</button
                                    >
                                    <button
                                        class="btn small secondary"
                                        on:click={() => (renamingDeck = null)}
                                        >{$currentTranslations.cancel}</button
                                    >
                                </div>
                            {:else}
                                <div
                                    class="deck-info"
                                    on:click={() => handleSelectDeck(name)}
                                    role="button"
                                    tabindex="0"
                                >
                                    <div class="deck-header">
                                        <span class="deck-name">{name}</span>
                                        {#if name === $currentDeckName}
                                            <span class="current-badge"
                                                >{$currentTranslations.current}</span
                                            >
                                        {/if}
                                    </div>
                                    <div class="deck-meta">
                                        <span
                                            >{new Date(
                                                deckData.versions[
                                                    deckData.current
                                                ].timestamp,
                                            ).toLocaleDateString()}</span
                                        >
                                        <span
                                            >{deckData.versions.length}
                                            {$currentTranslations.versions}</span
                                        >
                                    </div>
                                </div>
                                <div class="deck-actions">
                                    <button
                                        class="btn small"
                                        on:click={() => loadDeck(name)}
                                        >{$currentTranslations.load}</button
                                    >
                                    <button
                                        class="btn small"
                                        on:click={() => handleRename(name)}
                                        >{$currentTranslations.rename}</button
                                    >
                                    <button
                                        class="btn small danger"
                                        on:click={() => handleDelete(name)}
                                        >{$currentTranslations.delete}</button
                                    >
                                </div>
                            {/if}
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .deck-manager {
        animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .current-deck-section {
        margin-bottom: 24px;
        padding: 20px;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .section-header h3 {
        margin: 0 0 16px 0;
        color: #1a1a1a;
        font-size: 16px;
        font-weight: 600;
    }

    .save-form {
        display: flex;
        gap: 8px;
    }

    .create-section {
        margin-bottom: 24px;
    }

    .create-form {
        display: flex;
        gap: 8px;
        padding: 16px;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
    }

    .create-btn {
        width: 100%;
        padding: 12px;
        background: #4a90e2;
        border: 1px solid #4a90e2;
        color: white;
    }

    .create-btn:hover {
        background: #357abd;
        border-color: #357abd;
    }

    .deck-list-section {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
    }

    .section-title {
        margin: 0 0 16px 0;
        color: #1a1a1a;
        font-size: 16px;
        font-weight: 600;
    }

    .deck-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .empty-message {
        padding: 40px 20px;
        text-align: center;
        color: #999;
        font-size: 14px;
    }

    .deck-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        background: #fafafa;
        transition: all 0.2s;
        gap: 12px;
    }

    .deck-item:hover {
        border-color: #4a90e2;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .deck-item.active {
        border-color: #4a90e2;
        background: #f0f7ff;
    }

    .deck-info {
        flex: 1;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .deck-header {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .deck-name {
        font-size: 15px;
        font-weight: 600;
        color: #1a1a1a;
    }

    .current-badge {
        padding: 2px 8px;
        background: #4a90e2;
        color: white;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
    }

    .deck-meta {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: #666;
    }

    .deck-actions {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
    }

    /* Form Elements */
    .input {
        flex: 1;
        padding: 10px 16px;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        font-size: 14px;
        background: white;
        transition: border-color 0.2s;
    }

    .input:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    /* Buttons */
    .btn {
        padding: 10px 16px;
        background: white;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        color: #333;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .btn:hover {
        background: #f5f5f5;
        border-color: #999;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .btn:active {
        transform: translateY(0);
    }

    .btn.small {
        padding: 6px 12px;
        font-size: 13px;
    }

    .btn.primary {
        background: #4a90e2;
        border-color: #4a90e2;
        color: white;
    }

    .btn.primary:hover {
        background: #357abd;
        border-color: #357abd;
    }

    .btn.secondary {
        background: #6c757d;
        border-color: #6c757d;
        color: white;
    }

    .btn.secondary:hover {
        background: #5a6268;
        border-color: #5a6268;
    }

    .btn.danger {
        background: #ef5350;
        border-color: #ef5350;
        color: white;
    }

    .btn.danger:hover {
        background: #e53935;
        border-color: #e53935;
    }

    @media screen and (max-width: 768px) {
        .deck-item {
            flex-direction: column;
            align-items: stretch;
        }

        .deck-actions {
            justify-content: flex-end;
        }

        .save-form,
        .create-form {
            flex-direction: column;
        }
    }
</style>
