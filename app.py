from flask import Flask, render_template, request, jsonify
import time
import random
import uuid

app = Flask(__name__)

# base puzzle displayed on page load
PUZZLE = [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9]
]

SOLUTION = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
]

# store generated games so /check can validate by id
GAMES = {}
LEADERBOARD = []  # list of dicts: {'name','time','id','when'}

def generate_puzzle(prefilled=30):
    indices = list(range(81))
    keep = set(random.sample(indices, max(18, min(50, prefilled))))
    puzzle = [[0]*9 for _ in range(9)]
    for idx in keep:
        r = idx // 9
        c = idx % 9
        puzzle[r][c] = SOLUTION[r][c]
    return puzzle


@app.route("/")
def index():
    return render_template("index.html", puzzle=PUZZLE)


@app.route('/new')
def new_games():
    try:
        count = int(request.args.get('count', '1'))
    except ValueError:
        count = 1
    count = max(1, min(6, count))
    out = []
    for _ in range(count):
        prefilled = random.choice([22,26,30,34])
        puzzle = generate_puzzle(prefilled=prefilled)
        gid = str(uuid.uuid4())
        GAMES[gid] = SOLUTION
        out.append({'id': gid, 'puzzle': puzzle})
    return jsonify({'puzzles': out})


@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json
    if isinstance(data, list):
        grid = data
        solution = SOLUTION
    else:
        grid = data.get('grid')
        gid = data.get('id')
        solution = GAMES.get(gid, SOLUTION)

    mistakes = []
    for r in range(9):
        for c in range(9):
            try:
                val = int(grid[r][c])
            except Exception:
                val = 0
            if val != solution[r][c]:
                mistakes.append([r, c])
    if mistakes:
        return jsonify({'status': 'fail', 'mistakes': mistakes})
    # success: do not automatically record score here; client may submit via /score
    return jsonify({'status': 'success'})


@app.route('/solution')
def get_solution():
    gid = request.args.get('id')
    solution = GAMES.get(gid)
    if not solution:
        # fall back to canonical
        solution = SOLUTION
    return jsonify({'solution': solution})


@app.route('/score', methods=['POST'])
def submit_score():
    data = request.json or {}
    name = data.get('name', 'Anonymous')[:32]
    try:
        tm = float(data.get('time', 0))
    except Exception:
        tm = 0
    gid = data.get('id')
    entry = {'name': name, 'time': tm, 'id': gid}
    LEADERBOARD.append(entry)
    return jsonify({'status': 'ok'})


@app.route('/leaderboard')
def leaderboard():
    # return top 20 by time (ascending)
    sorted_list = sorted(LEADERBOARD, key=lambda e: e.get('time', 0))
    return jsonify({'leaders': sorted_list[:20]})


import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

