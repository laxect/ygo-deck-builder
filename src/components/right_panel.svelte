<script lang="js">
    import CardThumb from "./card_thumb.svelte";
    import {
        changeInput,
        showingCards,
        onPrevPage,
        onNextPage,
    } from "../search";
    import { deckOps, format } from "../deck";
    import { cardLimit, cornerMark } from "../card_db";
    import { currentTranslations } from "../language";

    function onChange(event) {
        changeInput(event.target.value);
    }

    function onDrop(event) {
        event.preventDefault();
        const data = JSON.parse(event.dataTransfer.getData("text"));
        if (
            data.area === "main" ||
            data.area === "side" ||
            data.area === "extra"
        ) {
            deckOps.deleteCard(data.area, data.idx);
        }
    }
</script>

<div
    class="right-panel"
    role="region"
    ondragover={(e) => e.preventDefault()}
    ondrop={onDrop}
>
    <div class="panel-header">
        <input
            type="text"
            class="search-input"
            placeholder={$currentTranslations.searchPlaceholder}
            oninput={onChange}
        />
    </div>

    <div class="card-list">
        {#each $showingCards as card}
            <div class="card-item">
                <div class="card-thumbnail">
                    <CardThumb
                        id={card.id}
                        idx={-1}
                        area="search"
                        limitNum={cornerMark(card.id, $format)}
                    />
                </div>
                <span class="card-name"
                    >{card.names[card[$currentTranslations.key]]}</span
                >
            </div>
        {/each}
    </div>

    <div class="pagination">
        <button class="page-btn" onclick={onPrevPage}
            >{$currentTranslations.prevPage}</button
        >
        <button class="page-btn" onclick={onNextPage}
            >{$currentTranslations.nextPage}</button
        >
    </div>
</div>

<style>
    .right-panel {
        width: 20%;
        padding: 32px;
        background-color: #fafafa;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    @media screen and (max-width: 768px) {
        .right-panel {
            display: none;
        }
    }

    .panel-header {
        padding-bottom: 16px;
        border-bottom: 1px solid #e0e0e0;
    }

    .search-input {
        width: 100%;
        padding: 10px 16px;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        font-size: 14px;
        background: white;
        transition: all 0.2s;
    }

    .search-input:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    .search-input::placeholder {
        color: #999;
    }

    .card-list {
        flex-grow: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .card-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        cursor: grab;
        transition: all 0.2s;
    }

    .card-item:hover {
        border-color: #4a90e2;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
    }

    .card-item:active {
        cursor: grabbing;
    }

    .card-thumbnail {
        width: 50px;
        height: 70px;
        flex-shrink: 0;
        border-radius: 3px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
    }

    .card-name {
        flex-grow: 1;
        font-size: 13px;
        color: #333;
        line-height: 1.4;
    }

    .pagination {
        display: flex;
        gap: 8px;
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;
    }

    .page-btn {
        flex: 1;
        padding: 10px 16px;
        background: white;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        color: #333;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .page-btn:hover {
        background: #f5f5f5;
        border-color: #999;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .page-btn:active {
        transform: translateY(0);
    }
</style>
