import { saveAs } from 'file-saver';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 20;
const GRID_SIZE = Math.floor(canvas.width / CELL_SIZE);
let currentGrid = createRandomGrid();
let nextGrid = createGrid();
let intervalId = null;

// Function to create and initialize a random initial grid
function createRandomGrid() {
    let grid = new Array(GRID_SIZE);
    for (let i = 0; i < GRID_SIZE; i++) {
        grid[i] = new Array(GRID_SIZE);
        for (let j = 0; j < GRID_SIZE; j++) {
            grid[i][j] = Math.random() > 0.5; // Randomly set cells to true (alive) or false (dead)
        }
    }
    return grid;
}

// Function to create and initialize the grid
function createGrid() {
    let grid = new Array(GRID_SIZE);
    for (let i = 0; i < GRID_SIZE; i++) {
        grid[i] = new Array(GRID_SIZE).fill(false); // Initialize all cells as dead
    }
    return grid;
}

// Function to update the grid based on Game of Life rules
function updateGrid() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            let neighbors = countNeighbors(i, j);
            if (currentGrid[i][j]) {
                // Any live cell with fewer than two live neighbors dies
                // Any live cell with two or three live neighbors lives
                // Any live cell with more than three live neighbors dies
                nextGrid[i][j] = neighbors === 2 || neighbors === 3;
            } else {
                // Any dead cell with exactly three live neighbors becomes a live cell
                nextGrid[i][j] = neighbors === 3;
            }
        }
    }
    // Swap grids
    let temp = currentGrid;
    currentGrid = nextGrid;
    nextGrid = temp;
}

// Function to count neighbors of a cell
function countNeighbors(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue; // Skip the current cell
            let nx = x + i;
            let ny = y + j;
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                count += currentGrid[nx][ny] ? 1 : 0;
            }
        }
    }
    return count;
}

// Function to draw the grid on the canvas
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (currentGrid[i][j]) {
                ctx.fillStyle = 'purple';
                ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

let saveCycleCounter = 0;

function saveCanvasAsPNG() {
    canvas.toBlob(function(blob) {
        saveAs(blob, "gameState.png");
    });
    setTimeout(saveCanvasAsPNG, 10000); // 10000 milliseconds = 10 seconds
    saveCycleCounter += 1;
    if (saveCycleCounter === 3) {
        window.location.reload();
    }
}

// Function to start the simulation
function startSimulation() {
    // Start the simulation loop
    intervalId = setInterval(() => {
        updateGrid();
        drawGrid();
    }, 100); // Adjust speed as needed

    // Schedule saving canvas as PNG after 10 seconds
    setTimeout(saveCanvasAsPNG, 10000); // 10000 milliseconds = 10 seconds
}

// Initialize grid and start simulation
startSimulation();
