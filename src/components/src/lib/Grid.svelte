<script>
    import Square from './Square.svelte'
    import { flagged } from './flagged';
    import { unmasked } from './masked';
    import { onDestroy } from 'svelte';

    // size of grid
    let width = 10;
    let height = 10;

    // no mines on board
    let noMines = 0;

    // keeps track of the squares, 1 is mine, 0 is safe
    let squares = [];
    // keeps track of the no mines in the neighbouring squares
    let surrounding = [];

    let starting = true;
    let gameover = false;

    // no of correct flags on mines
    let score = 0;
    // no of incorrect flags
    let wrongScore = 0;

    // percentage of squares that's a mine
    let PERCENTAGE_MINE = 0.2;

    $unmasked = [];
    $flagged = [];

    $: {
        surrounding = [];   
        $unmasked = [];   

        newRandomGrid();

        for (let i=0; i < width * height; i++) {
            let noNeighbours = 0;

            let neighbours = listNeighbours(i, width, height);

            for (let neighbour of neighbours) {
                if (neighbour >= 0 
                && neighbour < squares.length
                && squares[neighbour] === 1
                ) {
                    noNeighbours++;
                }
            }

            surrounding.push(noNeighbours);
        }     
    }

    function newRandomGrid() {
        squares = [];
        noMines = 0;

        for (let i=0; i < width * height; i++) {
            if (Math.random() < PERCENTAGE_MINE) {
                squares.push(1);
                noMines += 1;
            } else {
                squares.push(0);
            }
        }
    }

    function listNeighbours(itemNo, width, height) {
        // neighbouring squares indices
        let normalNeighbours = [
                itemNo - width - 1, itemNo - width, itemNo - width + 1,
                itemNo - 1, itemNo + 1,
                itemNo + width - 1, itemNo + width, itemNo + width + 1
            ];

            // shouldn't wrap around to other side of grid
            let leftEdgeNeighbour = [
                itemNo - width, itemNo - width + 1,
                itemNo + 1,
                itemNo + width, itemNo + width + 1
            ];
            
            let rightEdgeNeighbour = [
                itemNo - width - 1, itemNo - width, 
                itemNo - 1, 
                itemNo + width - 1, itemNo + width
            ];

            // check noMines in neighbours
            if (itemNo % width === 0) {
                return leftEdgeNeighbour;
            } else if (itemNo % width === width-1) {
                return rightEdgeNeighbour;
            } else {
                return normalNeighbours;
            }
    }


    function handleGameover() {
        gameover = true;
    }   

    function updateScore() {
        score = 0;
        wrongScore = 0;

        console.log(score);
        for (let index of $unmasked) {
            if (squares[index] === 0) {
                score++;
            }             
        }

        for (let index of $flagged) {
            if (squares[index] === 0) {
                wrongScore++;
            }             
        }
    }

    const unsubscribe = unmasked.subscribe(() => {
        updateScore();
    });


    function reset() {
        gameover = false;
        starting = true;
        newRandomGrid();

        $unmasked = [];
        $flagged = [];
    }

    function handleZero(event) {
        recursiveZero(event.detail.id);
    }

    function recursiveZero(id) {
        let neighbours = listNeighbours(id, width, height);
        
        for (let neighbour of neighbours) {
            if (!$unmasked.includes(neighbour)) {
                $unmasked = [...$unmasked, neighbour];   
            
                if (surrounding[neighbour] === 0) {
                    recursiveZero(neighbour);
                }
            }            
        }        
    }

    onDestroy(() => unsubscribe());
   
</script>



<main>
    {#if gameover} 
        <h1>Game Over :()</h1>

        <h2>You flagged {score} out of {noMines} mines!</h2>
        <h2>You uncovered {$unmasked.length-1} out of {squares.length-noMines} safe squares!</h2>

        {#if wrongScore != 0} 
            <h2>You wrongly flagged {wrongScore} safe squares as mines.</h2>
        {/if}

        <button on:click={reset}>
            Try again!
        </button>

        <div class="grid-mines" 
            style="grid-template-columns: repeat({width}, 2em);
            grid-template-rows: repeat({height}, 2em);">
            {#each squares as square, i}
                <Square 
                on:gameover={handleGameover} 
                on:iszero={handleZero}
                isMine={square} 
                surrounding={surrounding[i]} 
                gameState={gameover}
                id={i}/>
            {/each}
        </div>      

    {:else}
        {#if score===squares.length-noMines}
            <h1>You WON!!!</h1>

            <button on:click={reset}>
                Another!
            </button>   
        {/if}

        {#if starting}
            <div>
                <h3>The Grid is {width} by {height}.</h3>

                <h3>Left click to uncover. Right click to flag.</h3>
            </div>

            <div>
                <input type="range" id="width" name="width" min="2" max="15" bind:value={width}>
                <label for="width">Width</label>
            </div>

            <div>
                <input type="range" id="height" name="height" min="2" max="15" bind:value={height}>
                <label for="height">Height</label>
            </div>

            <button on:click={()=> {starting = false}}>
                Start!
            </button>
        {:else}
            <div class="grid-mines" 
            style="grid-template-columns: repeat({width}, 2em);
            grid-template-rows: repeat({height}, 2em);">
                {#each squares as square, i}
                    <Square 
                    on:gameover={handleGameover} 
                    on:iszero={handleZero}
                    isMine={square} 
                    surrounding={surrounding[i]} 
                    gameState={gameover}
                    id={i}/>
                {/each}
            </div>            
        {/if}
    {/if}    

    
</main>


<style>
	div.grid-mines {
		display: grid;
		grid-gap: 2em;
        justify-content: center;
	}

    button {
        padding: 2em;
    }

    div {
        margin: 1em;
        padding: 1em;
    }

    main {
        max-width: 90em;
    }
</style>
