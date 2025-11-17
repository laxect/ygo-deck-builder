<script lang="js">
    import { onMount, createEventDispatcher } from "svelte";
    import {
        getDeck,
        setCurrentVersion,
        deleteVersion,
        updateVersionNotes,
    } from "../storage.js";
    import { loadDeck } from "../deck.js";
    import { currentTranslations } from "../language";
    import { getCardDb } from "../card_db.js";

    export let deckName;

    const dispatch = createEventDispatcher();

    let deckData = null;
    let editingNotes = null;
    let newNotes = "";

    onMount(() => {
        deckData = getDeck(deckName);
    });

    function handleRevert(index) {
        setCurrentVersion(deckName, index);
        loadDeck(deckName);
        deckData = getDeck(deckName);
    }

    function handleDelete(index) {
        if (confirm($currentTranslations.confirmDeleteVersion)) {
            if (deleteVersion(deckName, index)) {
                deckData = getDeck(deckName);
            } else {
                alert($currentTranslations.cannotDeleteVersion);
            }
        }
    }

    function handleEditNotes(index) {
        editingNotes = index;
        newNotes = deckData.versions[index].notes || "";
    }

    function handleSaveNotes(index) {
        if (updateVersionNotes(deckName, index, newNotes)) {
            deckData = getDeck(deckName);
        }
        editingNotes = null;
    }

    function getFormatName(format) {
        const formatMap = {
            none: $currentTranslations.formatNone,
            ocg: $currentTranslations.formatOCG,
            tcg: $currentTranslations.formatTCG,
            md: $currentTranslations.formatMD,
            cnocg: $currentTranslations.formatCNOCG,
            genesys: $currentTranslations.formatGenesys,
        };
        return formatMap[format] || format;
    }

    function getCardName(cardId) {
        const cardDb = getCardDb();
        if (!cardDb || !cardDb[cardId]) return `Card #${cardId}`;
        return (
            cardDb[cardId].name?.[$currentTranslations.key] ||
            cardDb[cardId].name?.en ||
            `Card #${cardId}`
        );
    }

    function calculateDetailedDiff(currentVersion, previousVersion) {
        if (!previousVersion) {
            return {
                added: [],
                removed: [],
                addedCount: 0,
                removedCount: 0,
                hasChanges: false,
            };
        }

        const currentDeck = currentVersion.deck || {};
        const prevDeck = previousVersion.deck || {};

        // Combine all cards from all zones
        const currentCards = [
            ...(currentDeck.main || []),
            ...(currentDeck.extra || []),
            ...(currentDeck.side || []),
        ];
        const prevCards = [
            ...(prevDeck.main || []),
            ...(prevDeck.extra || []),
            ...(prevDeck.side || []),
        ];

        // Count occurrences
        const currentCount = {};
        const prevCount = {};

        currentCards.forEach((id) => {
            currentCount[id] = (currentCount[id] || 0) + 1;
        });

        prevCards.forEach((id) => {
            prevCount[id] = (prevCount[id] || 0) + 1;
        });

        // Calculate differences
        const added = [];
        const removed = [];

        // Find added cards
        for (const id in currentCount) {
            const diff = currentCount[id] - (prevCount[id] || 0);
            if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                    added.push(id);
                }
            }
        }

        // Find removed cards
        for (const id in prevCount) {
            const diff = prevCount[id] - (currentCount[id] || 0);
            if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                    removed.push(id);
                }
            }
        }

        return {
            added,
            removed,
            addedCount: added.length,
            removedCount: removed.length,
            hasChanges: added.length > 0 || removed.length > 0,
        };
    }
</script>

<div class="deck-versions">
    <button class="back-btn" on:click={() => dispatch("back")}
        >← {$currentTranslations.backToDecks}</button
    >
    <h2>{deckName} - {$currentTranslations.versionHistory}</h2>
    <div class="version-list">
        {#if deckData && deckData.versions}
            {#each deckData.versions as version, i}
                {@const diff = calculateDetailedDiff(
                    version,
                    i > 0 ? deckData.versions[i - 1] : null,
                )}
                <div
                    class="version-item"
                    class:current={i === deckData.current}
                >
                    <div class="version-header">
                        <div class="version-info">
                            <span class="version-time"
                                >{new Date(
                                    version.timestamp,
                                ).toLocaleString()}</span
                            >
                            <span class="version-format"
                                >{getFormatName(version.format || "none")}</span
                            >
                            {#if i === deckData.current}
                                <span class="current-badge"
                                    >{$currentTranslations.current}</span
                                >
                            {/if}
                        </div>
                        <div class="version-stats">
                            <span
                                >{$currentTranslations.mainCount}: {version
                                    .stats?.mainCount || 0}</span
                            >
                            <span
                                >{$currentTranslations.extraCount}: {version
                                    .stats?.extraCount || 0}</span
                            >
                            <span
                                >{$currentTranslations.sideCount}: {version
                                    .stats?.sideCount || 0}</span
                            >
                        </div>
                    </div>

                    {#if i > 0 && diff}
                        <div class="version-diff">
                            {#if diff.hasChanges}
                                {#if diff.addedCount > 0}
                                    <span class="diff-added">
                                        +{diff.addedCount}
                                        {$currentTranslations.cardsAdded}
                                        <div class="diff-tooltip">
                                            <div class="tooltip-title">
                                                📈 {$currentTranslations.cardsAdded}:
                                            </div>
                                            <ul>
                                                {#each diff.added as cardId}
                                                    <li>
                                                        {getCardName(cardId)}
                                                    </li>
                                                {/each}
                                            </ul>
                                        </div>
                                    </span>
                                {/if}
                                {#if diff.removedCount > 0}
                                    <span class="diff-removed">
                                        -{diff.removedCount}
                                        {$currentTranslations.cardsRemoved}
                                        <div class="diff-tooltip">
                                            <div class="tooltip-title">
                                                📉 {$currentTranslations.cardsRemoved}:
                                            </div>
                                            <ul>
                                                {#each diff.removed as cardId}
                                                    <li>
                                                        {getCardName(cardId)}
                                                    </li>
                                                {/each}
                                            </ul>
                                        </div>
                                    </span>
                                {/if}
                            {:else}
                                <span class="diff-none"
                                    >{$currentTranslations.noChanges}</span
                                >
                            {/if}
                        </div>
                    {/if}

                    {#if editingNotes === i}
                        <div class="notes-edit">
                            <input
                                type="text"
                                bind:value={newNotes}
                                placeholder={$currentTranslations.addNotesPlaceholder}
                            />
                            <button on:click={() => handleSaveNotes(i)}
                                >{$currentTranslations.save}</button
                            >
                            <button on:click={() => (editingNotes = null)}
                                >{$currentTranslations.cancel}</button
                            >
                        </div>
                    {:else}
                        {#if version.notes}
                            <div class="version-notes">{version.notes}</div>
                        {/if}
                        <div class="version-actions">
                            <button on:click={() => handleEditNotes(i)}>
                                {version.notes
                                    ? $currentTranslations.editNotes
                                    : $currentTranslations.addNotes}
                            </button>
                            {#if i !== deckData.current}
                                <button
                                    class="revert-btn"
                                    on:click={() => handleRevert(i)}
                                    >{$currentTranslations.revertToVersion}</button
                                >
                                <button
                                    class="delete-btn"
                                    on:click={() => handleDelete(i)}
                                    >{$currentTranslations.deleteVersion}</button
                                >
                            {/if}
                        </div>
                    {/if}
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .deck-versions {
        padding: 0;
    }

    .back-btn {
        padding: 10px 20px;
        margin-bottom: 24px;
        background: white;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        color: #333;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .back-btn:hover {
        background: #f5f5f5;
        border-color: #999;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    h2 {
        margin-bottom: 24px;
        color: #1a1a1a;
        font-size: 20px;
        font-weight: 600;
    }

    .version-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .version-item {
        padding: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: white;
        transition: all 0.2s;
    }

    .version-item:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-color: #4a90e2;
    }

    .version-item.current {
        border-color: #4a90e2;
        background: #f0f7ff;
    }

    .version-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        flex-wrap: wrap;
        gap: 10px;
    }

    .version-info {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }

    .version-time {
        font-weight: 500;
        color: #1a1a1a;
        font-size: 14px;
    }

    .version-format {
        padding: 4px 10px;
        background: #f5f5f5;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-size: 12px;
        color: #666;
    }

    .current-badge {
        padding: 4px 10px;
        background: #4a90e2;
        color: white;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
    }

    .version-stats {
        display: flex;
        gap: 16px;
        font-size: 13px;
        color: #666;
    }

    .version-diff {
        display: flex;
        gap: 10px;
        margin-bottom: 12px;
        padding: 8px 12px;
        background: #fafafa;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 13px;
    }

    .diff-added,
    .diff-removed {
        position: relative;
        cursor: help;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .diff-added {
        color: #28a745;
        font-weight: 600;
    }

    .diff-added:hover {
        background: #d4edda;
    }

    .diff-added::before {
        content: "📈 ";
    }

    .diff-removed {
        color: #dc3545;
        font-weight: 600;
    }

    .diff-removed:hover {
        background: #f8d7da;
    }

    .diff-removed::before {
        content: "📉 ";
    }

    .diff-tooltip {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 8px;
        padding: 12px;
        background: white;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        min-width: 200px;
        max-width: 300px;
        max-height: 300px;
        overflow-y: auto;
    }

    .diff-added:hover .diff-tooltip,
    .diff-removed:hover .diff-tooltip {
        display: block;
    }

    .tooltip-title {
        font-weight: 600;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e0e0e0;
        color: #1a1a1a;
        font-size: 13px;
    }

    .diff-tooltip ul {
        margin: 0;
        padding-left: 20px;
        list-style: disc;
    }

    .diff-tooltip li {
        padding: 4px 0;
        color: #555;
        font-size: 12px;
    }

    .diff-none {
        color: #999;
        font-style: italic;
    }

    .version-notes {
        margin-bottom: 12px;
        padding: 10px 12px;
        background: #fffbf0;
        border-left: 3px solid #ffc107;
        border-radius: 4px;
        font-size: 13px;
        color: #555;
    }

    .notes-edit {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
    }

    .notes-edit input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        font-size: 14px;
    }

    .notes-edit input:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    .notes-edit button {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
    }

    .notes-edit button:first-of-type {
        background: #4a90e2;
        color: white;
    }

    .notes-edit button:first-of-type:hover {
        background: #357abd;
    }

    .notes-edit button:last-of-type {
        background: #6c757d;
        color: white;
    }

    .notes-edit button:last-of-type:hover {
        background: #5a6268;
    }

    .version-actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }

    .version-actions button {
        padding: 8px 14px;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
    }

    .version-actions button:hover {
        background: #f5f5f5;
        border-color: #999;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .version-actions button:first-of-type {
        background: #4a90e2;
        border-color: #4a90e2;
        color: white;
    }

    .version-actions button:first-of-type:hover {
        background: #357abd;
        border-color: #357abd;
    }

    .revert-btn {
        background: #28a745;
        border-color: #28a745;
        color: white;
    }

    .revert-btn:hover {
        background: #218838;
        border-color: #218838;
    }

    .delete-btn {
        background: #ef5350;
        border-color: #ef5350;
        color: white;
    }

    .delete-btn:hover {
        background: #e53935;
        border-color: #e53935;
    }

    @media screen and (max-width: 768px) {
        .version-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .version-stats {
            font-size: 12px;
            gap: 10px;
        }

        .diff-tooltip {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            max-width: 90vw;
        }
    }
</style>
