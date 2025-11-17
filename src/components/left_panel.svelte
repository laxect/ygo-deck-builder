<script lang="js">
    import {
        leftPanelCardId,
        leftPanelCardImgUrl,
        leftPanelCardDesc,
        leftPanelCardRuby,
        isMobileInfoVisible,
        closeMobileInfo,
    } from "../left_panel";

    import { currentTranslations } from "../language";
</script>

<div class="left-panel">
    <div class="card-preview">
        <div class="card-image-container">
            {#if $leftPanelCardImgUrl !== ""}
                <img
                    src={$leftPanelCardImgUrl}
                    alt="card image"
                    class="card-image"
                />
            {:else}
                <div class="card-placeholder">
                    <span class="placeholder-text">No card selected</span>
                </div>
            {/if}
        </div>
        <div class="card-description">
            {#if $leftPanelCardRuby !== ""}
                <p class="card-ruby">{@html $leftPanelCardRuby}</p>
            {/if}
            <pre class="card-text">{$leftPanelCardDesc}</pre>
            <div class="footer">
                <small>
                    <a
                        class="link"
                        href="https://github.com/mistivia/ygo-deck-builder"
                        >{$currentTranslations.sourceCode}</a
                    >
                    <br />{$currentTranslations.followMistivia}
                    <a class="link" href="https://mistivia.com">Mistivia</a>
                    {$currentTranslations.thankYou}
                </small>
            </div>
        </div>
    </div>
</div>

{#if $isMobileInfoVisible}
    <div class="overlay">
        <div class="mobile-info">
            <button class="close-btn" on:click={closeMobileInfo}>×</button>
            <div class="content">
                <div class="card-image-container">
                    {#if $leftPanelCardImgUrl !== ""}
                        <img
                            src={$leftPanelCardImgUrl}
                            alt="card image"
                            class="card-image"
                        />
                    {/if}
                </div>
                <div class="card-description">
                    {#if $leftPanelCardRuby !== ""}
                        <p class="card-ruby">{@html $leftPanelCardRuby}</p>
                    {/if}
                    <pre class="card-text">{$leftPanelCardDesc}</pre>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .left-panel {
        width: 25%;
        padding: 32px;
        background-color: #fafafa;
        display: flex;
        flex-direction: column;
    }

    .card-preview {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .card-image-container {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
    }

    .card-image {
        max-width: 100%;
        max-height: 400px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .card-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 400px;
        background: #f5f5f5;
        border-radius: 4px;
    }

    .placeholder-text {
        color: #999;
        font-size: 14px;
    }

    .card-description {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
    }

    .card-ruby {
        margin: 0 0 12px 0;
        color: #1a1a1a;
        font-size: 14px;
        line-height: 1.6;
    }

    .card-text {
        margin: 0 0 16px 0;
        color: #333;
        font-size: 13px;
        line-height: 1.6;
        white-space: pre-wrap;
        font-family: inherit;
    }

    .footer {
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;
        text-align: center;
        color: #666;
    }

    .link {
        color: #4a90e2;
        text-decoration: none;
        transition: color 0.2s;
    }

    .link:hover {
        color: #357abd;
        text-decoration: underline;
    }

    /* Mobile Overlay */
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    }

    .mobile-info {
        background: white;
        border-radius: 12px;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .close-btn {
        position: sticky;
        top: 0;
        right: 0;
        margin-left: auto;
        display: block;
        width: 40px;
        height: 40px;
        background: white;
        border: 1px solid #d0d0d0;
        border-radius: 8px;
        font-size: 24px;
        cursor: pointer;
        z-index: 1001;
        color: #666;
        margin: 16px 16px 0 0;
        transition: all 0.2s;
    }

    .close-btn:hover {
        background: #f5f5f5;
        color: #333;
    }

    .content {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    @media screen and (max-width: 768px) {
        .left-panel {
            display: none;
        }
    }
</style>
