//====================CONSTANTES Y VARIABLES====================//

//----------Constantes tomadas del HTML----------//
const HTMLtag = document.getElementsByTagName("html");
const page_theme = document.getElementById("page-theme");

const header = document.getElementsByTagName("header");
const footer = document.getElementsByTagName("footer");

const canvas = document.getElementById("lienzo");
const ctx = canvas.getContext("2d");

const cellSizeInput = document.getElementById("cellSize");

const gameBtn = document.getElementById("gameBtn");

const stepNum = document.getElementById("stepNum");

//----------Constantes insertadas en el HTML----------//
const sun = "<svg class='w-6 h-6 fill-yellow-400'> <path class='stroke-yellow-400 stroke-2' d='M12 3V4M12 20V21M4 12H3M6.31412 6.31412L5.5 5.5M17.6859 6.31412L18.5 5.5M6.31412 17.69L5.5 18.5001M17.6859 17.69L18.5 18.5001M21 12H20M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z' stroke-linecap='round' stroke-linejoin='round'/> </svg>";
const moon = "<svg class='w-6 h-6 fill-sky-700'> <path class='stroke-sky-700 stroke-2' d='M3.32031 11.6835C3.32031 16.6541 7.34975 20.6835 12.3203 20.6835C16.1075 20.6835 19.3483 18.3443 20.6768 15.032C19.6402 15.4486 18.5059 15.6834 17.3203 15.6834C12.3497 15.6834 8.32031 11.654 8.32031 6.68342C8.32031 5.50338 8.55165 4.36259 8.96453 3.32996C5.65605 4.66028 3.32031 7.89912 3.32031 11.6835Z' stroke-linecap='round' stroke-linejoin='round'/> </svg>";

const play = "<svg class='w-4 h-4 fill-sky-100 dark:fill-slate-700' viewBox='0 0 512 512'> <path d='M490.667,0H21.333C9.536,0,0,9.557,0,21.333v469.333C0,502.443,9.536,512,21.333,512h469.333 c11.797,0,21.333-9.557,21.333-21.333V21.333C512,9.557,502.464,0,490.667,0z'/> </svg>";
const pause = "<svg class='w-4 h-4 fill-sky-100 dark:fill-slate-700' viewBox='0 0 512 512'> <path d='M500.203,236.907L30.869,2.24c-6.613-3.285-14.443-2.944-20.736,0.939C3.84,7.083,0,13.931,0,21.333v469.333 c0,7.403,3.84,14.251,10.133,18.155c3.413,2.112,7.296,3.179,11.2,3.179c3.264,0,6.528-0.747,9.536-2.24l469.333-234.667 C507.435,271.467,512,264.085,512,256S507.435,240.533,500.203,236.907z'/> </svg>";

//----------Variables de estado----------//
let darkTheme = false;
let gameOn = false;
let intervalId = null;

//----------Variables del CANVAS----------//
let cellSize = parseInt(cellSizeInput.value, 10);
let rows, cols, offsetX, offsetY;
let cells = [];

//----------Variables del STEP----------//
let step = 0;

//====================FUNCIONES====================//

//----------Función del tema----------//
function changeTheme() { //Cambia el aspecto de la página entre claro y oscuro
    HTMLtag[0].classList.toggle("dark");
    if (!darkTheme) {
        darkTheme = true;
        page_theme.innerHTML = sun;
    } else if (darkTheme) {
        darkTheme = false;
        page_theme.innerHTML = moon;
    }
    drawGrid()
}

//----------Funciones del CANVAS----------//
function resizeCanvas() { // Ajusta tamaño del CANVAS al tamaño de la pantalla
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - (header[0].offsetHeight + footer[0].offsetHeight);

    calculateGrid();
    drawGrid();
}

function calculateGrid() { // Calcular las filas y columnas según el tamaño del canvas y de las celdas
    rows = Math.floor(canvas.height / cellSize);
    cols = Math.floor(canvas.width / cellSize);
    offsetX = (canvas.offsetWidth - (cols * cellSize))/2;
    offsetY = (canvas.offsetHeight - (rows * cellSize))/2;
  
    // Generar una nueva cuadrícula vacía si es necesario
    cells = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => 0) // Inicializar aleatoriamente
    );
}

function drawGrid() { // Dibuja el grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = (col * cellSize) + offsetX;
            const y = (row * cellSize) + offsetY;
            if (!darkTheme) {
                ctx.fillStyle = cells[row][col] ? "#0369a1" : "#f0f9ff"; //alive - dead
                ctx.strokeStyle = "#e0f2fe"; // sky-100
            } else if (darkTheme) {
                ctx.fillStyle = cells[row][col] ? "#facc15" : "#475569"; //alive - dead
                ctx.strokeStyle = "#334155"; // slate-700
            }
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.strokeRect(x, y, cellSize, cellSize);
        }
    }
}

//----------Funciones de lógica del juego----------//
function gameStatus() { // Cambia el botón entre play y pause
    if (!gameOn) {
        gameOn = true;
        gameBtn.title = "Stop";
        gameBtn.innerHTML = play;
        startGame();
    } else if (gameOn) {
        gameOn = false;
        gameBtn.title = "Start";
        gameBtn.innerHTML = pause;
        stopGame();
    }
}

function countAliveNeighbors(cells, row, col) { // Cuenta los vecinos vivos de una celda
    let count = 0;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], /* 0,0 */ [0, 1],
        [1, -1], [1, 0], [1, 1],
    ];
  
    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < rows && // Dentro de límites verticales
            newCol >= 0 && newCol < cols && // Dentro de límites horizontales
            cells[newRow][newCol] // Celda viva
            ){
            count++;
        }
    }
    return count;
}
  
function nextGeneration() { // Genera el siguiente step del juego
    const newCells = Array.from({ length: rows }, () => Array(cols).fill(false));
  
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const aliveNeighbors = countAliveNeighbors(cells, row, col);

            if (cells[row][col]) { // Regla 1 y 3: Celdas vivas mueren por subpoblación o sobrepoblación
                newCells[row][col] = aliveNeighbors === 2 || aliveNeighbors === 3;
            } else { // Regla 4: Celdas muertas reviven si tienen exactamente 3 vecinos vivos
                newCells[row][col] = aliveNeighbors === 3;
            }
        }
    }

    cells = newCells; // Actualiza el estado global
    drawGrid(); // Redibuja el canvas

    step++;
    stepNum.innerHTML = String(step); // Actualiza el conteo de los steps
}
  
function startGame() { // Inicia el juego
    if (!intervalId) {
        intervalId = setInterval(nextGeneration, 500); // Ejecutar cada 500 ms
    }
}

function stopGame() { // Pausa el juego
    clearInterval(intervalId);
    intervalId = null;
}


//====================EVENT LISTENERS====================//
canvas.addEventListener("click", (e) => { // Detecta clicks en las celdas
    if (!gameOn) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - offsetX;
        const y = e.clientY - rect.top - offsetY;

        const col = Math.floor((x / (cellSize)));
        const row = Math.floor((y / (cellSize)));

        if (row >= 0 && row < rows && col >= 0 && col < cols) {
            cells[row][col] = !cells[row][col]; // Cambia el estado de la celda
            drawGrid(); // Actualiza el CANVAS
        }
    }
});

cellSizeInput.addEventListener("input", (e) => { // Maneja el cambio en el tamaño de las celdas
    cellSize = parseInt(e.target.value, 10);
    calculateGrid();
    drawGrid();
});
  
window.addEventListener("resize", resizeCanvas); // Redimensiona el CANVAS cuando cambia el tamaño de la ventana


//====================FIRST CALL====================//
resizeCanvas();