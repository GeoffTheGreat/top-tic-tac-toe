var events = {
  events: {},
  on: function (eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },
  off: function (eventName, fn) {
    if (this.events[eventName]) {
      for (var i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      }
    }
  },
  emit: function (eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function (fn) {
        fn(data);
      });
    }
  },
};

var playerSelect = (() => {
  let players = [];

  //event listener for submit btns
  const submitBtns = Array.from(
    document.getElementsByClassName("handle--submit")
  );
  submitBtns.forEach((btn) => btn.addEventListener("click", submitPlayer));

  const isCpuCheckbox = document.getElementById("play--cpu");
  isCpuCheckbox.addEventListener("change", displayLevel);

  function displayLevel(e) {
    if (e.target.checked) {
      document.getElementById("cpu--level--choice").style.display = "block";
    } else {
      document.getElementById("cpu--level--choice").style.display = "none";
    }
  }

  //handles player submit
  function submitPlayer(e) {
    let parentElement = e.target.parentElement;
    let parentId = parentElement.getAttribute("id");
    let playerDetails = { player: "", playerName: "" };
    if (parentId === "player--one") {
      playerDetails.player = "Player One";
      let playerNameInput = document.getElementById("player--one--name");
      assignPlayer(playerNameInput, playerDetails, e);
    } else if (parentId === "player--two") {
      if (isCpuCheckbox.checked) {
        playerDetails.player =
          document.getElementById("cpu--level--choice").value;
        let playerNameInput = document.getElementById("player--two--name");
        playerNameInput.value = "Geoff";
        assignPlayer(playerNameInput, playerDetails, e);
      } else {
        playerDetails.player = "Player Two";
        let playerNameInput = document.getElementById("player--two--name");
        assignPlayer(playerNameInput, playerDetails, e);
      }
    }
  }

  function assignPlayer(playerInput, playerDetails, e) {
    if (playerInput.value.length > 0) {
      playerDetails.playerName = playerInput.value;
      playerInput.disabled = true;
      e.target.disabled = true;
      players.push(playerDetails);
      removeForm();
    } else {
      playerInput.setAttribute("placeholder", `Field can't be empty`);
    }
  }

  function removeForm() {
    if (players.length === 2) {
      const playerForm = document.querySelector(".player--select");

      playerForm.style.display = "none";
      displayGame();
    }
  }
  function displayGame() {
    events.emit("playerCreated", players);
    events.emit("setBoard", "newGame");
  }
})();

var playerOne = (() => {
  let playerOneScore = 0;
  events.on("playerCreated", setPlayerOne);
  events.on("playerOneTileChange", makeMove);

  function setPlayerOne(players) {
    let playerName;
    if (players[0].player === "Player One") {
      playerName = players[0].playerName;
    } else {
      playerName = players[1].playerName;
    }
    renderPlayerOne(playerName);
  }
  function renderPlayerOne(playerName) {
    let playerSection = document.getElementById("player--one--name--display");
    playerSection.textContent = `Name: ${playerName}`;
    renderScore(0);
  }
  function renderScore(score) {
    let scoreBox = document.getElementById("player--one--score");
    scoreBox.textContent = `Score: ${score}`;
  }
  function makeMove(tileId) {
    let xmark = document.createElement("i");
    xmark.classList.add("fa-solid");
    xmark.classList.add("fa-xmark");
    let targetTile = document.getElementById(tileId);
    targetTile.appendChild(xmark);
  }
  events.on("updateScore", updatePlayerScore);
  function updatePlayerScore(player) {
    if (player === "playerOne") {
      let currentScore =
        document.getElementById("player--one--score").textContent;
      currentScore = parseInt(currentScore.replace("Score: ", ""));
      renderScore(currentScore + 1);
    }
  }
})();

var playerTwo = (() => {
  let playerTwoScore = 0;
  events.on("playerCreated", setPlayerTwo);
  events.on("playerTwoTileChange", makeMove);
  let cpuDifficulty = "easy";
  function setPlayerTwo(players) {
    let playerName;

    if (players[0].player !== "Player One") {
      playerName = players[0].playerName;
      if (players[0].player !== "Player Two") {
        cpuDifficulty = players[0].player;
        events.emit("cpuPlays", cpuDifficulty);
      }
    } else {
      playerName = players[1].playerName;
      if (players[1].player !== "Player Two") {
        cpuDifficulty = players[1].player;
        events.emit("cpuPlays", cpuDifficulty);
      }
    }
    renderPlayerTwo(playerName);
  }
  function renderPlayerTwo(playerName) {
    let playerSection = document.getElementById("player--two--name--display");
    playerSection.textContent = `Name: ${playerName}`;
    renderScore(0);
  }
  function renderScore(score) {
    let scoreBox = document.getElementById("player--two--score");
    scoreBox.textContent = `Score: ${score}`;
  }
  function makeMove(tileId) {
    // console.log("tile id ", tileId);
    let omark = document.createElement("i");
    omark.classList.add("fa-solid");
    omark.classList.add("fa-o");
    let targetTile = document.getElementById(tileId);
    targetTile.appendChild(omark);
  }

  events.on("updateScore", updatePlayerScore);
  function updatePlayerScore(player) {
    if (player === "playerTwo") {
      let currentScore =
        document.getElementById("player--two--score").textContent;
      currentScore = parseInt(currentScore.replace("Score: ", ""));
      renderScore(currentScore + 1);
    }
  }
})();

var gameBoard = (() => {
  let playerTurn = 1;
  let gameTiles = [];
  events.on("setBoard", bindTiles);
  document.getElementById("restart").addEventListener("click", resetBoard);
  document.getElementById("reset").addEventListener("click", reloadWindow);

  function reloadWindow() {
    location.reload();
  }
  function resetBoard() {
    bindTiles("newGame");
  }

  function bindTiles(gameType) {
    const newGameDiv = Array.from(document.querySelectorAll(".play-again"));
    newGameDiv.forEach((div) => div.remove());
    gameTiles = [];
    playerTurn = 1;
    document.querySelector(".game--section").style.display = "flex";
    document.getElementById("game__board").style.display = "grid";

    for (let i = 1; i < 10; i++) {
      gameTiles.push(document.getElementById(`gs${i}`));
      document.getElementById(`gs${i}`).classList.remove("occupied");
    }
    gameTiles.forEach((tile) => {
      tile.addEventListener("click", tileClick);
    });
    if (gameType === "newGame") {
      gameTiles.forEach((tile) => {
        if (tile.firstElementChild !== null) {
          tile.firstElementChild.remove();
        }
      });
    }
  }
  events.on("cpuTurnEnd", tileClick);
  function tileClick(e) {
    let tileId = e.target.id;

    if (playerTurn % 2 === 1) {
      events.emit("playerOneTileChange", tileId);
    } else if (playerTurn % 2 === 0) {
      events.emit("playerTwoTileChange", tileId);
    }
    document.getElementById(tileId).classList.add("occupied");
    document.getElementById(tileId).removeEventListener("click", tileClick);
    playerTurn++;

    events.emit("moveMade", gameTiles);
    if (playerTurn % 2 === 0 && playerTurn < 9) {
      events.emit("playerTwoTurn", gameTiles);
    }
  }
  events.on("roundOver", updateWinner);

  function updateWinner(winningTiles) {
    // console.log(winningTiles);
    gameTiles.forEach((tile) => {
      tile.removeEventListener("click", tileClick);
    });
    if (winningTiles !== "draw") {
      let winner;
      for (let i = 0; i < winningTiles.length; i++) {
        let tile = winningTiles[i][0];
        tile.firstElementChild.classList.add("winning--tile");
      }
      if (winningTiles[0][1] === "fa-xmark") {
        winner = "playerOne";
      } else if (winningTiles[0][1] === "fa-o") {
        winner = "playerTwo";
      }
      events.emit("updateScore", winner);
    } else {
      events.emit("updateScore", "draw");
    }
  }
})();

var playAgain = (() => {
  events.on("updateScore", displayPlayAgain);

  function displayPlayAgain(winner) {
    const playerOne = document.getElementById(
      "player--one--name--display"
    ).textContent;
    const playerTwo = document.getElementById(
      "player--two--name--display"
    ).textContent;
    const playAgain = document.createElement("div");
    playAgain.classList.add("play-again");
    const winMessage = document.createElement("p");
    const btnAgain = document.createElement("button");
    btnAgain.textContent = "play again";
    playAgain.appendChild(winMessage);
    playAgain.appendChild(btnAgain);
    const gameBoard = document.getElementById("game__board");
    // gameBoard.style.display = "none";
    if (winner === "playerOne") {
      winMessage.textContent = `Congratulations ${playerOne.replace(
        "Name: ",
        ""
      )} has Won! Better luck next time ${playerTwo.replace("Name: ", "")}`;
    }
    if (winner === "playerTwo") {
      winMessage.textContent = `Congratulations ${playerTwo.replace(
        "Name: ",
        ""
      )} has Won! Better luck next time ${playerOne.replace("Name: ", "")}`;
    }
    if (winner === "draw") {
      winMessage.textContent = `Ah ha your wits are matched its a draw`;
    }
    document.querySelector(".game--board--section").appendChild(playAgain);

    btnAgain.addEventListener("click", newGame);
  }

  function newGame(e) {
    events.emit("setBoard", "newGame");
    e.target.parentElement.remove();
    e.target.removeEventListener("click", newGame);
  }
})();

var playerComputer = (() => {
  events.on("cpuPlays", setDifficulty);
  let difficultyLevel = 0;
  function setDifficulty(cpuLevel) {
    switch (cpuLevel) {
      case "easy":
        difficultyLevel = 1;
        break;
      case "medium":
        difficultyLevel = 2;
        break;
      case "hard":
        difficultyLevel = 3;
        break;
      default:
        break;
    }
  }

  events.on("playerTwoTurn", canPlay);
  function canPlay(tiles) {
    // console.log("can play", tiles);
    let bestScore = -Infinity;
    let bestMove;
    if (difficultyLevel === 1) {
      let id;
      for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].firstElementChild === null) {
          id = i + 1;
        }
      }
      events.emit("cpuTurnEnd", { target: { id: `gs${id}` } });
    }
    if (difficultyLevel === 2) {
      let rounds = 0;
      if (rounds < 1) {
        for (let i = 0; i < tiles.length; i++) {
          if (tiles[i].firstElementChild === null) {
            bestMove = `gs${i + 1}`;
          }
        }
      } else {
        for (let i = 0; i < tiles.length; i++) {
          if (tiles[i].firstElementChild === null) {
            makeMove(tiles[i].id);
            let score = minimax(tiles, 0, false);
            tiles[i].firstElementChild.remove();
            if (score > bestScore) {
              bestScore = score;
              bestMove = tiles[i].id;
            }
            if (bestMove === undefined) {
              bestMove = tiles[i].id;
            }
          }
        }
      }
      events.emit("cpuTurnEnd", { target: { id: bestMove } });
    }

    if (difficultyLevel === 3) {
      for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].firstElementChild === null) {
          makeMove(tiles[i].id);
          let score = minimax(tiles, 0, false);
          tiles[i].firstElementChild.remove();
          if (score > bestScore) {
            bestScore = score;
            bestMove = tiles[i].id;
          }
          if (bestMove === undefined) {
            bestMove = tiles[i].id;
          }
        }
      }

      events.emit("cpuTurnEnd", { target: { id: bestMove } });
    }
  }
  function makeMove(tileId) {
    let omark = document.createElement("i");
    omark.classList.add("fa-solid");
    omark.classList.add("fa-o");
    omark.classList.add("algoTest");
    let targetTile = document.getElementById(tileId);
    targetTile.appendChild(omark);
  }
  function makeXmove(tileId) {
    let xmark = document.createElement("i");
    xmark.classList.add("fa-solid");
    xmark.classList.add("fa-xmark");
    xmark.classList.add("algoTest");
    let targetTile = document.getElementById(tileId);
    targetTile.appendChild(xmark);
  }

  function minimax(board, depth, isMaximizing) {
    let result = checkWinner.checkBoard(board);
    let tiles = board;
    // console.log("tileList", tiles);
    if (result[0] !== "undeclared") {
      let score = result[0];
      return score;
    }
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].firstElementChild === null) {
          makeMove(tiles[i].id);
          let score = minimax(tiles, depth + 1, false);
          tiles[i].firstElementChild.remove();
          if (score > bestScore) {
            bestScore = score;
          }
        }
      }
      return bestScore;
    } else {
      let bestScore = +Infinity;
      for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].firstElementChild === null) {
          makeXmove(tiles[i].id);
          let score = minimax(tiles, depth + 1, true);
          tiles[i].firstElementChild.remove();
          if (score < bestScore) {
            bestScore = score;
          }
        }
      }
      return bestScore;
    }
  }
})();

var checkWinner = (() => {
  events.on("moveMade", checkWin);
  function checkWin(gameTiles) {
    if (checkWinner.checkBoard(gameTiles)[0] !== "undeclared") {
      events.emit("roundOver", checkWinner.checkBoard(gameTiles)[1]);
    }
  }
  function checkBoard(tileList) {
    let tileContent = [];
    for (let i = 0; i < tileList.length; i++) {
      if (tileList[i].firstElementChild === null) {
        tileContent.push([tileList[i], ""]);
      } else {
        tileContent.push([
          tileList[i],
          tileList[i].firstElementChild.classList[1],
        ]);
      }
    }
    let checkResult = checkIfWins(tileContent);
    if (checkResult !== undefined) {
      if (checkResult === "draw") {
        return [0, checkResult];
      } else if (checkResult[0][1] === "fa-xmark") {
        return [-1, checkResult];
      } else if (checkResult[0][1] === "fa-o") {
        return [1, checkResult];
      }
    } else {
      // console.log(checkResult);
      return ["undeclared", checkResult];
    }
  }
  function checkIfWins(tileContent) {
    // console.log(tileContent);
    let tilesPlayed = 0;

    tileContent.forEach((tile) => {
      if (tile[1] !== "") {
        tilesPlayed++;
      }
    });

    const grid = [
      [tileContent[0], tileContent[1], tileContent[2]],
      [tileContent[3], tileContent[4], tileContent[5]],
      [tileContent[6], tileContent[7], tileContent[8]],
    ];
    let hasWon = false;
    let winningTiles = [];
    //check rows
    for (let i = 0; i < grid.length; i++) {
      if (grid[i][0][1] !== "") {
        if (
          grid[i][0][1] === grid[i][1][1] &&
          grid[i][0][1] === grid[i][2][1]
        ) {
          hasWon = true;
          winningTiles = [grid[i][0], grid[i][1], grid[i][2]];
        }
      }
    }
    //check cols
    for (let i = 0; i < 3; i++) {
      if (grid[0][i][1] !== "") {
        if (
          grid[0][i][1] === grid[1][i][1] &&
          grid[0][i][1] === grid[2][i][1]
        ) {
          hasWon = true;
          winningTiles = [grid[0][i], grid[1][i], grid[2][i]];
        }
      }
    }
    //check diagonal
    if (grid[0][0][1] !== "") {
      if (grid[0][0][1] === grid[1][1][1] && grid[0][0][1] === grid[2][2][1]) {
        hasWon = true;
        winningTiles = [grid[0][0], grid[1][1], grid[2][2]];
      }
    }
    if (grid[0][2][1] !== "") {
      if (grid[0][2][1] === grid[1][1][1] && grid[0][2][1] === grid[2][0][1]) {
        hasWon = true;
        winningTiles = [grid[0][2], grid[1][1], grid[2][0]];
      }
    }
    if (tilesPlayed === 9 && hasWon === false) {
      hasWon = true;
      winningTiles = "draw";
    }

    if (hasWon) {
      return winningTiles;
    }
  }
  return { checkBoard, checkIfWins };
})();
