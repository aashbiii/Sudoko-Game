let puzzles = [];
let currentIndex = 0;
let currentId = null;
let timer = 0;
let interval = null;

function startTimer() {
    stopTimer();
    timer = 0;
    document.getElementById("timer").innerText = `Time: ${timer}s`;
    interval = setInterval(() => { timer++; document.getElementById("timer").innerText = `Time: ${timer}s`; }, 1000);
}
function stopTimer() { if (interval) { clearInterval(interval); interval = null; } }

function buildTableHTML(puzzle) {
    let html = '';
    for (let r = 0; r < 9; r++) {
        html += '<tr>';
        for (let c = 0; c < 9; c++) {
            let v = puzzle[r][c];
            if (v && v !== 0) {
                html += `<td><input class="cell fixed" value="${v}" disabled></td>`;
            } else {
                html += `<td><input class="cell" maxlength="1" value=""></td>`;
            }
        }
        html += '</tr>';
    }
    return html;
}

function renderPuzzle(puzzle, id) {
    currentId = id || null;
    const table = document.getElementById('sudoku');
    table.innerHTML = buildTableHTML(puzzle);
    attachInputListeners();
    document.getElementById('puzzleLabel').innerText = `${currentIndex + 1} / ${puzzles.length}`;
    startTimer();
    document.getElementById('message').innerText = '';
}

function attachInputListeners() {
    document.querySelectorAll('#sudoku .cell').forEach(inp => {
        inp.addEventListener('input', e => {
            e.target.value = e.target.value.replace(/[^1-9]/g, '');
        });
    });
}

function getGridFromDOM() {
    let grid = [];
    const rows = document.querySelectorAll('#sudoku tr');
    rows.forEach((tr, r) => {
        grid[r] = [];
        const inputs = tr.querySelectorAll('input');
        inputs.forEach((inp, c) => {
            grid[r][c] = inp.value ? parseInt(inp.value) : 0;
        });
    });
    return grid;
}

function loadInitial() {
    // capture server-rendered puzzle as initial single puzzle
    const initial = [];
    document.querySelectorAll('#sudoku tr').forEach((tr, r) => {
        initial[r] = [];
        tr.querySelectorAll('input').forEach((inp, c) => {
            initial[r][c] = inp.value ? parseInt(inp.value) : 0;
        });
    });
    puzzles = [{ id: 'initial', puzzle: initial }];
    currentIndex = 0;
    renderPuzzle(puzzles[0].puzzle, puzzles[0].id);
    updateNavButtons();
}

function updateNavButtons() {
    document.getElementById('prevBtn').disabled = currentIndex <= 0;
    document.getElementById('nextBtn').disabled = currentIndex >= puzzles.length - 1;
    document.getElementById('puzzleLabel').innerText = `${currentIndex + 1} / ${puzzles.length}`;
}

function loadNewAndAppend() {
    fetch(`/new`)
        .then(r => r.json())
        .then(data => {
            if (!data.puzzles || !data.puzzles.length) return;
            // append returned puzzles
            data.puzzles.forEach(p => puzzles.push(p));
            // jump to the last added puzzle
            currentIndex = puzzles.length - 1;
            renderPuzzle(puzzles[currentIndex].puzzle, puzzles[currentIndex].id);
            updateNavButtons();
            // subtle pop animation on card
            const card = document.querySelector('.card');
            if (card) {
                card.classList.add('pop');
                setTimeout(() => card.classList.remove('pop'), 360);
            }
        });
}

function checkSolution() {
    const grid = getGridFromDOM();
    const payload = { id: currentId, grid: grid };
    fetch('/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success') {
                stopTimer();
                document.getElementById('message').innerText = `🎉 Completed in ${timer} seconds!`;
                document.getElementById('message').style.color = 'green';
            } else {
                document.getElementById('message').innerText = `❌ Incorrect — ${data.mistakes ? data.mistakes.length : 0} mistakes`;
                document.getElementById('message').style.color = 'red';
                highlightMistakes(data.mistakes || []);
            }
        });
}

function highlightMistakes(mistakes) {
    // clear previous
    document.querySelectorAll('#sudoku .cell').forEach(i => i.classList.remove('invalid'));
    mistakes.forEach(([r, c]) => {
        const row = document.querySelectorAll('#sudoku tr')[r];
        if (row) {
            const cell = row.querySelectorAll('input')[c];
            if (cell) cell.classList.add('invalid');
        }
    });
}

function resetCurrent() {
    // re-render original puzzle state stored in puzzles array
    renderPuzzle(puzzles[currentIndex].puzzle, puzzles[currentIndex].id);
}

document.addEventListener('DOMContentLoaded', () => {
    loadInitial();

    document.getElementById('newGameBtn').addEventListener('click', () => {
        loadNewAndAppend();
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentIndex > 0) { currentIndex--; renderPuzzle(puzzles[currentIndex].puzzle, puzzles[currentIndex].id); updateNavButtons(); }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentIndex < puzzles.length - 1) { currentIndex++; renderPuzzle(puzzles[currentIndex].puzzle, puzzles[currentIndex].id); updateNavButtons(); }
    });

    document.getElementById('checkBtn').addEventListener('click', checkSolution);
    document.getElementById('resetBtn').addEventListener('click', resetCurrent);
});
