<script>
    import { flagged } from './flagged.js';
    import { unmasked } from './masked';

    // send event of game over to grid
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    // before square is clicked
    let isMask = true;
    $: isMask = !$unmasked.includes(id);

    // whether this square is flagged, or is a mine
    let isFlag = false; 
    $: isFlag = $flagged.includes(id);

    export let isMine;

    // the number of mines in the surrounding
    export let surrounding;
    // whether the game is won
    export let gameState;

    // id identifies which square this is
    export let id;

    function clickSquare(e) {
        if (gameState || !isMask) {
            return;
        }
        
        if (e.which === 1) {
            if (isFlag) return;

            // turn off mask
            $unmasked = [...$unmasked, id];

            // send game over event
            if (isMine) {
                dispatch("gameover", {});
            } else if (surrounding === 0) {
                // if square is 0
                dispatch("iszero", {id: id});
            }           
        } else if (e.which === 3) {
            if (isFlag) {                
                // remove flag from store                
                $flagged = $flagged.filter(flag => flag !== id)

            } else {
                $flagged = [...$flagged, id];
            }            
        }
    }
</script>


{#if gameState}
    {#if isMine}
        <img src="rick.jpeg" alt="cat mine" width="50" height="50">
    {:else}
        <div>
            {surrounding}
        </div>    
    {/if}  
{:else}
    <button on:click|preventDefault={clickSquare} on:contextmenu|preventDefault={clickSquare}>
        {#if isMask}
            <div>
                <!-- {surrounding} -->
            </div>
        {:else}
            {#if isMine}
                <img src="/rick.jpeg" alt="rick mine" width="50" height="50">
            {:else}
                <div>
                    {surrounding}
                </div>    
            {/if}
        {/if}

        {#if isFlag}
            <img src="/cat.jpeg" alt="cat flag" width="50" height="50">
        {/if}
    </button>
{/if}




<style>
    button {
        padding: 0;
        outline: 0;
        border-radius: 4px;
        background-color: orange;
        width: 3em;
        height: 3em;
    }

    button:hover {
        background-color: aquamarine;
        border-color: aqua;
    }
</style>


