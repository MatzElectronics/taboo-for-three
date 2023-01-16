window.roundTime = 60;
window.timer = {
    start: 60,
    current: 60,
    mark: 0,
    interval: null
};
window.round = 1;
window.player = ['Player 1', 'Player 2', 'Player 3'];
window.scores = [0, 0, 0];

window.roundRoles = [
    [1, 2, 3],
    [3, 1, 2],
    [2, 3, 1],
    [1, 3, 2],
    [2, 1, 3],
    [3, 2, 1]
];

window.sfx = {
    buzz: new Audio('buzz.mp3'),
    score: new Audio('score.mp3'),
    pass: new Audio('pass.mp3'),
    timer: new Audio('timer.mp3'),
    start: new Audio('start.mp3'),
}

function getRoundRoles() {
    return roundRoles[(round - 1) % 6];
}

function $(e) {
    return document.querySelector(e);
} 

function $$(e) {
    return document.querySelectorAll(e);
} 

function navTo(panelId) {
    let panels = $$('.panel');
    let tabs = $$('nav li');

    for (let i = 0; i < panels.length; i++) {
        panels[i].style.display = 'none';
    }
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.backgroundColor = '#333';
    }

    $('#' + panelId).style.display = 'block';
    $('#' + panelId + '-tab').style.backgroundColor = '#221952';
}

function saveSettings() {
    for (let i = 1; i < 4; i++) {
        player[i - 1] = $('#name-' + i).value;
        $(`#player-${i}-display`).innerText = player[i - 1];
    }

    roundTime = parseInt($('#round-time').value || 60);
    $('#next-round').disabled = true;
    //$('#prev-round').disabled = true;

    displayRoles();
    resetTimer(false);
    saveData();
    navTo('game');
}

function displayRoles() {
    let roles = getRoundRoles();
    let i = 0;
    player.forEach((p) => {
        $(`#role-${roles[i]}-display`).innerText = p;
        i++;
    });
}

function playPauseTimer() {
    let btn = $('#timer-play');

    if (btn.innerHTML == '<i class="fa fa-pause"></i>') {
        btn.innerHTML = '<i class="fa fa-play"></i>';
        clearInterval(timer.interval);
        timer.mark = 0;
    } else {
        btn.innerHTML = '<i class="fa fa-pause"></i>';

        if (timer.current <= 0) {
            timer.current = roundTime;
        }

        timer.mark = Date.now() / 1000;
        timer.start = timer.current;
        $('#count-time').innerText = timer.current.toFixed(1);

        timer.interval = setInterval(() => {
            if (timer.current <= 0) {
                timer.current = 0;
                $('#count-time').innerText = 0;
                resetTimer(true);
            } else {
                timer.current = timer.start - ((Date.now() / 1000) - timer.mark);
                if (timer.current <= 0) {
                    timer.current = 0;
                    $('#next-round').disabled = false;
                    //$('#prev-round').disabled = false;
                }
                $('#count-time').innerText = timer.current.toFixed(1);
            }

        }, 100);
        sfx.start.play();
    }

    saveData();
}

function resetTimer(expired) {
    clearInterval(timer.interval);
    if (expired) {
        sfx.timer.play();
    }
    timer.start = roundTime;
    timer.current = roundTime;
    timer.interval = null;
    timer.mark = 0;

    $('#timer-play').innerHTML = '<i class="fa fa-play"></i>';
    $('#count-time').innerText = timer.start.toFixed(1);
}

function action(doAction, undo) {
    let mult = undo ? -1 : 1;
    let newValue = parseInt($('#count-' + doAction).innerText) + (1 * mult);

    if (newValue < 0) {
        return;
    }

    let roles = getRoundRoles();

    if (doAction === 'buzz') {
        scores[roles[2] - 1] += (1 * mult);    // Ref +
        scores[roles[1] - 1] += (1 * -mult);   // Giver -

    } else if (doAction === 'pass') {
        scores[roles[0] - 1] += (1 * -mult);    // Guess -
        scores[roles[1] - 1] += (1 * -mult);    // Giver -

    } else if (doAction === 'score') {
        scores[roles[0] - 1] += (1 * mult);     // Guess +
        scores[roles[1] - 1] += (1 * mult);     // Giver +

    }

    $('#count-' + doAction).innerText = newValue;
    for (let i = 0; i < 3; i++) { $(`#player-${i + 1}-score`).innerText = scores[i]; }

    if (!undo) {
        sfx[doAction].play();
    }

    saveData();
}

function nextRound(reset) {
    round += (reset ? -1 : 1);
    if (round < 1) {
        round = 1;
    }

    displayRoles();

    $('#timer-play').innerHTML = '<i class="fa fa-play"></i>';

    $('#round-display').innerText = 'Round ' + round;
    $('#count-buzz').innerText = 0;
    $('#count-pass').innerText = 0;
    $('#count-score').innerText = 0;
    $('#next-round').disabled = true;
    //$('#prev-round').disabled = true;
}

function resetSettings() {
    roundTime = 60;
    timer = {
        start: 60,
        current: 60,
        mark: 0,
        interval: null
    };
    round = 1;
    player = ['Player 1', 'Player 2', 'Player 3'];
    scores = [0, 0, 0];

    $('#round-display').innerText = 'Round ' + round;
    $('#count-buzz').innerText = 0;
    $('#count-pass').innerText = 0;
    $('#count-score').innerText = 0;
    $('#next-round').disabled = true;

    for (let i = 0; i < 3; i++) { 
        $(`#player-${i + 1}-score`).innerText = scores[i]; 
        $(`#player-${i + 1}-display`).innerText = 'Player';
        $(`#role-${i + 1}-display`).innerText = 'Player';
    }

    $('#role-1-display').innerText = 'Player';
    $('#role-2-display').innerText = 'Player';
    $('#role-3-display').innerText = 'Player';

    $('#name-1').value = '';
    $('#name-2').value = '';
    $('#name-3').value = '';

    localStorage.setItem('gameData', '');
}

function saveData() {
    let gameData = {
        roundTime: roundTime,
        timer: timer,
        round: round,
        player: player,
        scores: scores,
        counts: {
            buzz: $('#count-buzz').innerText,
            pass: $('#count-pass').innerText,
            score: $('#count-score').innerText
        }
    };

    localStorage.setItem('gameData', JSON.stringify(gameData));
}

function loadData() {
    let gameDataString = localStorage.getItem('gameData');

    if (gameDataString && gameDataString.length > 10) {
        let gameData = JSON.parse(gameDataString);

        roundTime = gameData.roundTime;
        timer = gameData.timer;
        round = gameData.round;
        player = gameData.player;
        scores = gameData.scores;
        let counts = gameData.counts;

        $('#round-display').innerText = 'Round ' + round;
        $('#count-buzz').innerText = counts.buzz;
        $('#count-pass').innerText = counts.pass;
        $('#count-score').innerText = counts.score;
        $('#next-round').disabled = true;
    
        for (let i = 0; i < 3; i++) {
            $(`#player-${i + 1}-score`).innerText = scores[i]; 
            $(`#player-${i + 1}-display`).innerText = player[i]; 
        }
    
        displayRoles();

        $('#round-time').value = roundTime;
        $('#name-1').value = player[0];
        $('#name-2').value = player[1];
        $('#name-3').value = player[2];    
    }
}

loadData();
navTo('setup');