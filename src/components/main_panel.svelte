<script lang="js">
    import CardThumb from "./card_thumb.svelte";
    import DeckManager from "./deck_manager.svelte";
    import {
        deck,
        setDeck,
        deckOps,
        format,
        setFormat,
        formatState,
        saveCurrentDeck,
        currentDeckName,
    } from "../deck";
    import { cornerMark } from "../card_db";
    import { parseYdk, genYdk, genYdke, downloadStringAsFile, generateDeckImage, downloadCanvasAsImage, copyCanvasToClipboard } from "../utils";
    import { language, setLanguage, currentTranslations } from "../language";

    let fileInput;
    let viewMode = "deck"; // 'deck' or 'manager'
    let deckSectionElement;

    function openDeck() {
        fileInput.click();
    }

    function loadDeck(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                let content = event.target.result;
                setDeck(parseYdk(content));
            };
            reader.readAsText(file);
        }
    }

    function clearDeck() {
        setDeck({
            main: [],
            extra: [],
            side: [],
        });
    }

    function exportDeck() {
        let deckString = genYdk($deck);
        downloadStringAsFile(deckString);
    }

    function handleSaveDeck() {
        if ($currentDeckName) {
            saveCurrentDeck($currentDeckName);
            alert($currentTranslations.ydkCopied);
        }
    }

    function copyDeck() {
        let deckString = genYdk($deck);
        navigator.clipboard
            .writeText(deckString)
            .then(() => {
                alert($currentTranslations.ydkCopied);
            })
            .catch((err) => {
                alert($currentTranslations.failed);
            });
    }

    async function shareDeck() {
        if (!deckSectionElement) {
            alert($currentTranslations.failed);
            return;
        }
        
        try {
            const canvas = await generateDeckImage(deckSectionElement);
            
            // Try to copy to clipboard first
            try {
                await copyCanvasToClipboard(canvas);
                alert($currentTranslations.shareImageCopied);
            } catch (clipboardErr) {
                // If clipboard fails, download the image instead
                downloadCanvasAsImage(canvas);
                alert($currentTranslations.shareImageCopied);
            }
        } catch (err) {
            console.error("Error generating deck image:", err);
            alert($currentTranslations.failed);
        }
    }

    function onDrop(to, event, targetIdx) {
        event.preventDefault();
        event.stopPropagation();
        const data = JSON.parse(event.dataTransfer.getData("text"));
        let from = data.area;
        if (from === "search") {
            if (to === "main") {
                deckOps.add2main(data.id, targetIdx);
            } else if (to === "side") {
                deckOps.add2side(data.id, targetIdx);
            } else if (to === "extra") {
                deckOps.add2extra(data.id, targetIdx);
            }
        } else {
            deckOps.move(from, to, data.idx, targetIdx);
        }
    }

    function toggleView() {
        viewMode = viewMode === "deck" ? "manager" : "deck";
    }
</script>

<input
    bind:this={fileInput}
    style="display:none;"
    onchange={loadDeck}
    type="file"
    class="file-input"
    accept=".ydk"
/>

<div class="middle-panel">
    {#if viewMode === "deck"}
        <div class="panel-header">
            {#if $currentDeckName}
                <div class="deck-badge">
                    <span class="badge-label"
                        >{$currentTranslations.currentDeck}</span
                    >
                    <span class="badge-value">{$currentDeckName}</span>
                </div>
            {/if}

            <div class="header-controls">
                <select
                    bind:value={$language}
                    class="select"
                    onchange={() => setLanguage($language)}
                >
                    <option value="chinese">中文</option>
                    <option value="english">English</option>
                    <option value="japanese">日本語</option>
                </select>
                <select
                    bind:value={$format}
                    class="select"
                    onchange={() => setFormat($format)}
                >
                    <option value="none">{$currentTranslations.noLimit}</option>
                    <option value="ocg">OCG</option>
                    <option value="tcg">TCG</option>
                    <option value="md">{$currentTranslations.masterDuel}</option
                    >
                    <option value="cnocg"
                        >{$currentTranslations.cnSimplified}</option
                    >
                    <option value="genesys">Genesys</option>
                </select>
                {#if $format === "genesys"}
                    <span class="points"
                        >{$currentTranslations.points}{$deck.point}</span
                    >
                {/if}
            </div>
        </div>

        <div class="action-bar">
            <div class="action-group">
                <button class="action-btn" onclick={openDeck}
                    >{$currentTranslations.open}</button
                >
                <button class="action-btn" onclick={exportDeck}
                    >{$currentTranslations.export}</button
                >
                {#if $currentDeckName}
                    <button class="action-btn primary" onclick={handleSaveDeck}
                        >{$currentTranslations.save}</button
                    >
                {/if}
                <button class="action-btn secondary" onclick={clearDeck}
                    >{$currentTranslations.clear}</button
                >
            </div>
            <div class="action-group">
                <button class="action-btn" onclick={copyDeck}
                    >{$currentTranslations.copyToClipboard}</button
                >
                <button class="action-btn" onclick={shareDeck}
                    >{$currentTranslations.share}</button
                >
                <button class="action-btn accent" onclick={toggleView}
                    >{$currentTranslations.manageDeck}</button
                >
            </div>
        </div>

        <div class="deck-section" bind:this={deckSectionElement}>
            <div class="deck-group">
                <h3>
                    {$currentTranslations.mainDeck}
                    <span class="count">({$deck.main.length})</span>
                </h3>
                <div
                    role="region"
                    ondragover={(e) => e.preventDefault()}
                    ondrop={(e) => onDrop("main", e, -1)}
                    class="card-grid"
                >
                    {#each $deck.main as card, i}
                        <div
                            class="card-grid-thumb"
                            role="region"
                            ondragover={(e) => e.preventDefault()}
                            ondrop={(e) => onDrop("main", e, i)}
                        >
                            <CardThumb
                                id={card}
                                idx={i}
                                area="main"
                                limitNum={cornerMark(card, $format)}
                            />
                        </div>
                    {/each}
                </div>
            </div>

            <div class="deck-group">
                <h3>
                    {$currentTranslations.extraDeck}
                    <span class="count">({$deck.extra.length})</span>
                </h3>
                <div
                    role="region"
                    ondragover={(e) => e.preventDefault()}
                    ondrop={(e) => onDrop("extra", e, -1)}
                    class="card-grid"
                >
                    {#each $deck.extra as card, i}
                        <div
                            class="card-grid-thumb"
                            role="region"
                            ondragover={(e) => e.preventDefault()}
                            ondrop={(e) => onDrop("extra", e, i)}
                        >
                            <CardThumb
                                id={card}
                                idx={i}
                                area="extra"
                                limitNum={cornerMark(card, $format)}
                            />
                        </div>
                    {/each}
                </div>
            </div>

            <div class="deck-group">
                <h3>
                    {$currentTranslations.sideDeck}
                    <span class="count">({$deck.side.length})</span>
                </h3>
                <div
                    role="region"
                    ondragover={(e) => e.preventDefault()}
                    ondrop={(e) => onDrop("side", e, -1)}
                    class="card-grid"
                >
                    {#each $deck.side as card, i}
                        <div
                            class="card-grid-thumb"
                            role="region"
                            ondragover={(e) => e.preventDefault()}
                            ondrop={(e) => onDrop("side", e, i)}
                        >
                            <CardThumb
                                id={card}
                                idx={i}
                                area="side"
                                limitNum={cornerMark(card, $format)}
                            />
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {:else}
        <div class="manager-header">
            <button class="back-btn" onclick={toggleView}
                >← {$currentTranslations.backToEdit}</button
            >
        </div>
        <DeckManager />
    {/if}
</div>

<style>
    .middle-panel {
        width: 55%;
        padding: 32px;
        background-color: #fafafa;
        overflow-y: auto;
    }

    @media screen and (max-width: 768px) {
        .middle-panel {
            width: 100%;
            padding: 16px;
        }
    }

    /* Header */
    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e0e0e0;
        flex-wrap: wrap;
        gap: 16px;
    }

    .deck-badge {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .badge-label {
        font-size: 12px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 500;
    }

    .badge-value {
        font-size: 20px;
        color: #1a1a1a;
        font-weight: 600;
    }

    .header-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }

    .select {
        padding: 8px 16px;
        background: white;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        font-size: 14px;
        color: #333;
        cursor: pointer;
        transition: all 0.2s;
    }

    .select:hover {
        border-color: #999;
    }

    .select:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    .points {
        padding: 8px 16px;
        background: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 6px;
        color: #856404;
        font-size: 14px;
        font-weight: 500;
    }

    /* Action Bar */
    .action-bar {
        display: flex;
        justify-content: space-between;
        margin-bottom: 32px;
        gap: 12px;
        flex-wrap: wrap;
    }

    .action-group {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .action-btn {
        padding: 10px 20px;
        background: white;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        color: #333;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .action-btn:hover {
        background: #f5f5f5;
        border-color: #999;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .action-btn:active {
        transform: translateY(0);
    }

    .action-btn.primary {
        background: #4a90e2;
        border-color: #4a90e2;
        color: white;
    }

    .action-btn.primary:hover {
        background: #357abd;
        border-color: #357abd;
    }

    .action-btn.secondary {
        background: #ef5350;
        border-color: #ef5350;
        color: white;
    }

    .action-btn.secondary:hover {
        background: #e53935;
        border-color: #e53935;
    }

    .action-btn.accent {
        background: #7b68ee;
        border-color: #7b68ee;
        color: white;
    }

    .action-btn.accent:hover {
        background: #6a5acd;
        border-color: #6a5acd;
    }

    /* Manager Header */
    .manager-header {
        margin-bottom: 24px;
    }

    .back-btn {
        padding: 10px 20px;
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
    }

    /* Deck Section */
    .deck-section {
        animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .deck-group {
        margin-bottom: 32px;
    }

    .deck-group h3 {
        margin-bottom: 12px;
        color: #1a1a1a;
        font-size: 18px;
        font-weight: 600;
    }

    .deck-group h3 .count {
        color: #666;
        font-weight: 400;
        font-size: 16px;
    }

    .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
        grid-auto-flow: dense;
        padding: 16px;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        min-height: 120px;
        gap: 4px;
    }

    .card-grid-thumb {
        position: relative;
        aspect-ratio: 1/1.4;
        border-radius: 4px;
    }

    @media screen and (max-width: 768px) {
        .panel-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .action-bar {
            flex-direction: column;
        }

        .action-group {
            width: 100%;
        }

        .action-btn {
            flex: 1;
        }
    }
</style>
