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
    // fade-in animation for table
    table.classList.remove('fade-in');
    void table.offsetWidth;
    table.classList.add('fade-in');
}

function fillSolution(solution) {
    stopTimer();
    // render all cells with solution values
    const rows = document.querySelectorAll('#sudoku tr');
    rows.forEach((tr, r) => {
        tr.querySelectorAll('input').forEach((inp, c) => {
            inp.value = solution[r][c];
            inp.classList.remove('invalid');
        });
    });
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
            const card = document.querySelector('.board-card');
            if (card) {
                card.classList.add('pop');
                setTimeout(() => card.classList.remove('pop'), 360);
            }
        });
}

function fetchSolution() {
    if (!currentId) return;
    fetch(`/solution?id=${currentId}`)
        .then(r => r.json())
        .then(data => {
            if (data && data.solution) {
                fillSolution(data.solution);
                document.getElementById('message').innerText = 'Solution revealed.';
                document.getElementById('message').style.color = 'var(--muted)';
            }
        });
}

function checkSolution() {
    const grid = getGridFromDOM();
    const payload = { id: currentId, grid: grid };
    fetch('/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(r => r.json())
        .then(data => {
            // clear previous highlights
            document.querySelectorAll('#sudoku .cell').forEach(i => { i.classList.remove('invalid'); i.classList.remove('correct'); });
            if (data.status === 'success') {
                stopTimer();
                document.getElementById('message').innerText = `🎉 Completed in ${timer} seconds!`;
                document.getElementById('message').style.color = 'green';
                // mark all cells correct
                document.querySelectorAll('#sudoku tr').forEach((tr, r) => {
                    tr.querySelectorAll('input').forEach((inp, c) => {
                        inp.classList.add('correct');
                    });
                });
                // celebration: board pulse + confetti
                const board = document.querySelector('.board-card');
                if (board) {
                    board.classList.add('celebrate');
                    setTimeout(() => board.classList.remove('celebrate'), 1200);
                }
                launchConfetti(40);
                // auto-submit score if name present
                const name = document.getElementById('playerName')?.value || '';
                if (name.trim().length > 0) {
                    fetch('/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), time: timer, id: currentId }) });
                }
            } else {
                document.getElementById('message').innerText = `❌ Incorrect — ${data.mistakes ? data.mistakes.length : 0} mistakes`;
                document.getElementById('message').style.color = 'red';
                // mark incorrect and correct (for entered numbers)
                const mistakes = (data.mistakes || []).map(x => `${x[0]}_${x[1]}`);
                document.querySelectorAll('#sudoku tr').forEach((tr, r) => {
                    tr.querySelectorAll('input').forEach((inp, c) => {
                        const key = `${r}_${c}`;
                        const val = inp.value ? parseInt(inp.value) : 0;
                        if (mistakes.indexOf(key) !== -1) {
                            inp.classList.add('invalid');
                        } else if (val !== 0) {
                            inp.classList.add('correct');
                        }
                    });
                });
            }
        });
}

// simple confetti launcher
function launchConfetti(count) {
    const colors = ['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#a29bfe', '#fd79a8'];
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti';
        el.style.left = (10 + Math.random() * 80) + '%';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.transform = `translateY(-10vh) rotate(${Math.random() * 360}deg)`;
        el.style.width = (6 + Math.random() * 8) + 'px';
        el.style.height = (8 + Math.random() * 10) + 'px';
        el.style.opacity = (0.8 + Math.random() * 0.2);
        document.body.appendChild(el);
        // remove after animation
        setTimeout(() => { el.remove(); }, 1500 + Math.random() * 600);
    }
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

    document.getElementById('showSolBtn').addEventListener('click', fetchSolution);

    document.getElementById('leaderboardBtn').addEventListener('click', () => {
        const panel = document.getElementById('leaderboardPanel');
        panel.setAttribute('aria-hidden', 'false');
        panel.classList.add('open');
        // load leaders
        fetch('/leaderboard').then(r => r.json()).then(data => {
            const ol = document.getElementById('leaderList');
            ol.innerHTML = '';
            (data.leaders || []).forEach((e, i) => {
                const li = document.createElement('li');
                li.innerText = `${e.name} — ${e.time}s`;
                ol.appendChild(li);
            });
        });
    });

    document.getElementById('closeLeaderboard').addEventListener('click', () => {
        const panel = document.getElementById('leaderboardPanel');
        panel.setAttribute('aria-hidden', 'true');
        panel.classList.remove('open');
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
