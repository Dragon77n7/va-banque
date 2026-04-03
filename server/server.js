const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { generateRoomCode, checkAnswer } = require('./gameLogic');
const { getQuestions, getAllKategorie, getFinalPytania } = require('./questions');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, '../client')));

const rooms = {};

function send(ws, data) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
}

function broadcast(roomCode, data, excludeId) {
  const room = rooms[roomCode];
  if (!room) return;
  room.players.forEach(p => {
    if (p.id !== excludeId && p.ws && p.ws.readyState === WebSocket.OPEN)
      p.ws.send(JSON.stringify(data));
  });
}

function broadcastAll(roomCode, data) {
  broadcast(roomCode, data, null);
}

function getPublicPlayers(room) {
  return room.players.map(p => ({ id: p.id, name: p.name, score: p.score, isHost: p.isHost }));
}

function getBoard(room, revealVbForPlayerId) {
  const runda = room.questions[room.currentRound];
  return runda.kategorie.map(kat => ({
    nazwa: kat.nazwa,
    pytania: kat.pytania.map((p, i) => ({
      idx: i,
      wartosc: p.wartosc,
      uzyte: room.usedQuestions[kat.nazwa + '_' + i] || false,
      vabanque: false // nigdy nie ujawniaj na tablicy
    }))
  }));
}

function nextSelector(room) {
  const alivePlayers = room.players;
  const idx = alivePlayers.findIndex(p => p.id === room.currentSelector);
  return alivePlayers[(idx + 1) % alivePlayers.length].id;
}

function startRound(roomCode, roundIdx) {
  const room = rooms[roomCode];
  room.currentRound = roundIdx;
  room.usedQuestions = {};
  room.phase = 'selecting';
  room.currentQuestion = null;
  room.buzzer = null;
  room.buzzTimer = null;
  room.answerTimer = null;

  if (roundIdx === 0) {
    // Losuj kto zaczyna
    const idx = Math.floor(Math.random() * room.players.length);
    room.currentSelector = room.players[idx].id;
  }

  broadcastAll(roomCode, {
    type: 'ROUND_START',
    round: roundIdx + 1,
    board: getBoard(room),
    currentSelector: room.currentSelector,
    selectorName: room.players.find(p => p.id === room.currentSelector)?.name,
    players: getPublicPlayers(room)
  });
}

function sendQuestion(roomCode, kategoriaIdx, pytanieIdx, vabanqueStawka) {
  const room = rooms[roomCode];
  const runda = room.questions[room.currentRound];
  const kat = runda.kategorie[kategoriaIdx];
  const pyt = kat.pytania[pytanieIdx];
  const key = kat.nazwa + '_' + pytanieIdx;

  room.usedQuestions[key] = true;
  room.phase = 'buzzing';
  room.currentQuestion = {
    kategoriaIdx, pytanieIdx,
    haslo: pyt.haslo,
    odpowiedz: pyt.odpowiedz,
    wartosc: vabanqueStawka || pyt.wartosc,
    oryginalna: pyt.wartosc,
    vabanque: pyt.vabanque || false,
    vabanqueStawka: vabanqueStawka || null
  };
  room.buzzer = null;

  // Va Banque - pytanie tylko do gracza ktory je wybral, reszta nie widzi hasla
  if (pyt.vabanque && vabanqueStawka !== null) {
    const selector = room.players.find(p => p.id === room.currentSelector);
    if (selector && selector.ws) {
      send(selector.ws, {
        type: 'QUESTION',
        haslo: pyt.haslo,
        wartosc: room.currentQuestion.wartosc,
        vabanque: true,
        onlyMe: true,
        board: getBoard(room),
        players: getPublicPlayers(room)
      });
    }
    // Pozostali widza ze trwa Va Banque ale nie widza pytania
    broadcast(roomCode, {
      type: 'VABANQUE_IN_PROGRESS',
      playerName: selector?.name,
      wartosc: room.currentQuestion.wartosc,
      board: getBoard(room),
      players: getPublicPlayers(room)
    }, room.currentSelector);
  } else {
    broadcastAll(roomCode, {
      type: 'QUESTION',
      haslo: pyt.haslo,
      wartosc: room.currentQuestion.wartosc,
      vabanque: false,
      board: getBoard(room),
      players: getPublicPlayers(room)
    });
  }

  // 10 sekund na buzzer
  room.buzzTimer = setTimeout(() => {
    if (room.phase !== 'buzzing') return;
    // Nikt sie nie zglosil - pokaz pytanie i odpowiedz przez 5 sekund
    room.phase = 'reveal_no_buzz';
    const correctAnswer = room.currentQuestion.odpowiedz;
    const haslo = room.currentQuestion.haslo;

    broadcastAll(roomCode, {
      type: 'NO_BUZZ_REVEAL',
      haslo: haslo,
      correctAnswer: correctAnswer,
      message: 'Nikt sie nie zglosil! Prawidlowa odpowiedz:',
      players: getPublicPlayers(room)
    });

    // Po 5 sekundach przejdz dalej
    setTimeout(() => {
      room.phase = 'selecting';
      const allUsed = checkAllUsed(room);
      if (allUsed) {
        handleRoundEnd(roomCode);
        return;
      }
      broadcastAll(roomCode, {
        type: 'NO_BUZZ',
        message: 'Pytanie przepada.',
        board: getBoard(room),
        currentSelector: room.currentSelector,
        selectorName: room.players.find(p => p.id === room.currentSelector)?.name,
        players: getPublicPlayers(room)
      });
    }, 5000);
  }, 10000);
}

function checkAllUsed(room) {
  const runda = room.questions[room.currentRound];
  for (const kat of runda.kategorie) {
    for (let i = 0; i < kat.pytania.length; i++) {
      if (!room.usedQuestions[kat.nazwa + '_' + i]) return false;
    }
  }
  return true;
}

function handleRoundEnd(roomCode) {
  const room = rooms[roomCode];
  if (room.currentRound === 0) {
    // Koniec rundy 1, zaczynamy runde 2
    setTimeout(() => startRound(roomCode, 1), 3000);
    broadcastAll(roomCode, {
      type: 'ROUND_END',
      round: 1,
      message: 'Koniec rundy 1! Zaraz zaczyna sie runda 2...',
      players: getPublicPlayers(room)
    });
  } else {
    // Koniec rundy 2, zaczynamy final
    setTimeout(() => startFinal(roomCode), 3000);
    broadcastAll(roomCode, {
      type: 'ROUND_END',
      round: 2,
      message: 'Koniec rundy 2! Zaraz zaczyna sie FINAL!',
      players: getPublicPlayers(room)
    });
  }
}

function startFinal(roomCode) {
  const room = rooms[roomCode];
  room.phase = 'final_betting';

  // Uzyj pytania od organizatora jesli istnieje, inaczej losuj
  let finalKat, finalPyt;
  if (room.customFinalQuestion) {
    finalKat = room.customFinalQuestion.kategoria || 'Finał';
    finalPyt = {
      haslo: room.customFinalQuestion.haslo,
      odpowiedz: room.customFinalQuestion.odpowiedz
    };
  } else {
    const finalPytania = [
      // ════ HISTORIA ════
      { haslo: "Rok pierwszego lądowania człowieka na dnie rowu mariańskiego.", odpowiedz: "1960", kategoria: "Historia" },
      { haslo: "Autor Boskiej Komedii.", odpowiedz: "Dante", kategoria: "Historia" },
      { haslo: "Przywódca rewolucji bolszewickiej w Rosji.", odpowiedz: "Lenin", kategoria: "Historia" },
      // ════ NAUKA ════
      { haslo: "W którym europejskim państwie znajduje się najkrótsza rzeka świata.", odpowiedz: "Włoszech", kategoria: "Nauka" },
      { haslo: "Pierwiastek o symbolu W.", odpowiedz: "Wolfram", kategoria: "Nauka" },
      { haslo: "Prędkość światła w próżni w km/s.", odpowiedz: "300000", kategoria: "Nauka" },
      { haslo: "Uczony który opisał grawitację po obserwacji jabłka.", odpowiedz: "Newton", kategoria: "Nauka" },
      { haslo: "Liczba chromosomów w ludzkim genomie.", odpowiedz: "46", kategoria: "Nauka" },
      // ════ KULTURA ════
      { haslo: "Autor Hamleta.", odpowiedz: "Szekspir", kategoria: "Kultura" },
      { haslo: "Najdłużej emitowany serial animowany na świecie.", odpowiedz: "Simpsonowie", kategoria: "Kultura" },
      { haslo: "Kraj z którego pochodzi ABBA.", odpowiedz: "Szwecja", kategoria: "Kultura" },
      { haslo: "Reżyser Titanica.", odpowiedz: "James Cameron", kategoria: "Kultura" },
      // ════ SPORT ════
      { haslo: "Kraj który wygrał MŚ w piłce nożnej w 2022 roku.", odpowiedz: "Argentyna", kategoria: "Sport" },
      { haslo: "Pierwszy Polak który wygrał Tour de France.", odpowiedz: "Nikt", kategoria: "Sport" },
      { haslo: "Rok pierwszych nowożytnych igrzysk olimpijskich.", odpowiedz: "1896", kategoria: "Sport" },
      // ════ POLSKA ════
      { haslo: "Polska nagroda Nobla z literatury w 2018 roku.", odpowiedz: "Olga Tokarczuk", kategoria: "Polska" },
      { haslo: "Miasto będące najkrócej stolicą polski.", odpowiedz: "Poznań", kategoria: "Polska" },
      { haslo: "Twórca gry Wiedźmin.", odpowiedz: "CD Projekt Red", kategoria: "Polska" }
    ];
    const finalPytRandom = finalPytania[Math.floor(Math.random() * finalPytania.length)];
    finalKat = finalPytRandom.kategoria || 'Finał';
    finalPyt = finalPytRandom;
  }
  room.finalQuestion = finalPyt;
  room.finalBets = {};

  broadcastAll(roomCode, {
    type: 'FINAL_START',
    kategoria: finalKat,
    message: 'FINAL! Kategoria: ' + finalKat + '. Macie 10 sekund na obstawienie stawki!',
    players: getPublicPlayers(room)
  });

  // 10 sekund na obstawienie
  room.finalTimer = setTimeout(() => {
    // Uzupelnij brakujace obstawienia zerem
    room.players.forEach(p => {
      if (room.finalBets[p.id] === undefined) room.finalBets[p.id] = 0;
    });
    room.phase = 'final_question';
    broadcastAll(roomCode, {
      type: 'FINAL_QUESTION',
      haslo: finalPyt.haslo,
      players: getPublicPlayers(room)
    });
    // 12 sekund na odpowiedz
    room.finalAnswers = {};
    room.finalAnswerTimer = setTimeout(() => {
      resolveFinal(roomCode);
    }, 12000);
  }, 10000);
}

function resolveFinal(roomCode) {
  const room = rooms[roomCode];
  if (room.phase !== 'final_question') return;
  room.phase = 'finished';

  const results = room.players.map(p => {
    const answer = room.finalAnswers[p.id] || '';
    const bet = room.finalBets[p.id] || 0;
    const correct = checkAnswer(answer, room.finalQuestion.odpowiedz);
    const change = correct ? bet : -bet;
    p.score += change;
    return { id: p.id, name: p.name, answer, correct, bet, change, score: p.score };
  });

  broadcastAll(roomCode, {
    type: 'FINAL_RESULT',
    correctAnswer: room.finalQuestion.odpowiedz,
    results,
    players: getPublicPlayers(room)
  });
}

wss.on('connection', (ws) => {
  let playerId = null;
  let playerRoom = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {

      case 'CREATE_ROOM': {
        const code = generateRoomCode();
        playerId = 'p_' + Math.random().toString(36).substr(2, 8);
        playerRoom = code;
        const initialQuestions = getQuestions();
        rooms[code] = {
          players: [{ id: playerId, name: msg.name, ws, isHost: true, score: 0 }],
          hostId: playerId,
          phase: 'lobby',
          currentRound: 0,
          currentSelector: null,
          usedQuestions: {},
          currentQuestion: null,
          buzzer: null,
          buzzTimer: null,
          answerTimer: null,
          finalQuestion: null,
          finalBets: {},
          finalAnswers: {},
          questions: initialQuestions,
          hostRole: 'player',
          customFinalQuestion: null
        };
        send(ws, { type: 'ROOM_CREATED', roomCode: code, playerId, isHost: true });
        // Wyslij plansze od razu do hosta
        send(ws, {
          type: 'ORGANIZER_BOARD',
          round0: initialQuestions[0].kategorie.map(k => ({
            nazwa: k.nazwa,
            pytania: k.pytania.map((p, i) => ({
              idx: i, wartosc: p.wartosc, haslo: p.haslo, odpowiedz: p.odpowiedz, vabanque: p.vabanque || false
            }))
          })),
          round1: initialQuestions[1].kategorie.map(k => ({
            nazwa: k.nazwa,
            pytania: k.pytania.map((p, i) => ({
              idx: i, wartosc: p.wartosc, haslo: p.haslo, odpowiedz: p.odpowiedz, vabanque: p.vabanque || false
            }))
          }))
        });
        break;
      }

      case 'JOIN_ROOM': {
        const room = rooms[msg.roomCode];
        if (!room) { send(ws, { type: 'ERROR', msg: 'Pokoj nie istnieje' }); break; }
        if (room.phase !== 'lobby') { send(ws, { type: 'ERROR', msg: 'Gra juz trwa' }); break; }
        if (room.players.find(p => p.name === msg.name)) { send(ws, { type: 'ERROR', msg: 'Nazwa zajeta' }); break; }

        playerId = 'p_' + Math.random().toString(36).substr(2, 8);
        playerRoom = msg.roomCode;
        room.players.push({ id: playerId, name: msg.name, ws, isHost: false, score: 0 });

        send(ws, { type: 'ROOM_JOINED', roomCode: msg.roomCode, playerId, isHost: false });
        broadcastAll(msg.roomCode, {
          type: 'LOBBY_UPDATE',
          players: getPublicPlayers(room)
        });
        break;
      }

      case 'SET_ROLE': {
        // Tworca pokoju ustawia swoja role: 'player' lub 'organizer'
        const room = rooms[playerRoom];
        if (!room || room.hostId !== playerId) break;
        room.hostRole = msg.role; // 'player' lub 'organizer'
        broadcastAll(playerRoom, {
          type: 'HOST_ROLE_UPDATE',
          role: msg.role,
          players: getPublicPlayers(room)
        });
        break;
      }

      case 'ORGANIZER_SET_VABANQUE': {
        // Organizator wskazuje ktore pytanie bedzie Va Banque
        const room = rooms[playerRoom];
        if (!room || room.hostId !== playerId) break;
        const { round, kategoriaIdx, pytanieIdx } = msg;
        if (!room.questions) break;
        // Usun stare vabanque z tej rundy
        room.questions[round].kategorie.forEach(k => k.pytania.forEach(p => { delete p.vabanque; }));
        // Ustaw nowe
        if (room.questions[round].kategorie[kategoriaIdx] &&
            room.questions[round].kategorie[kategoriaIdx].pytania[pytanieIdx]) {
          room.questions[round].kategorie[kategoriaIdx].pytania[pytanieIdx].vabanque = true;
        }
        send(ws, { type: 'ORGANIZER_ACK', msg: 'Va Banque ustawione!' });
        break;
      }

      case 'ORGANIZER_SET_FINAL': {
        // Organizator ustawia pytanie finałowe
        const room = rooms[playerRoom];
        if (!room || room.hostId !== playerId) break;
        room.customFinalQuestion = {
          haslo: msg.haslo,
          odpowiedz: msg.odpowiedz,
          kategoria: msg.kategoria
        };
        send(ws, { type: 'ORGANIZER_ACK', msg: 'Pytanie finałowe ustawione!' });
        break;
      }

      case 'ORGANIZER_BOARD_REQUEST': {
        const room = rooms[playerRoom];
        if (!room || room.hostId !== playerId) break;
        if (!room.questions) {
          room.questions = getQuestions();
        }
        const qData = {
          type: 'ORGANIZER_BOARD',
          round0: room.questions[0].kategorie.map(k => ({
            nazwa: k.nazwa,
            pytania: k.pytania.map((p, i) => ({
              idx: i, wartosc: p.wartosc, haslo: p.haslo, odpowiedz: p.odpowiedz, vabanque: p.vabanque || false
            }))
          })),
          round1: room.questions[1].kategorie.map(k => ({
            nazwa: k.nazwa,
            pytania: k.pytania.map((p, i) => ({
              idx: i, wartosc: p.wartosc, haslo: p.haslo, odpowiedz: p.odpowiedz, vabanque: p.vabanque || false
            }))
          }))
        };
        send(ws, qData);
        break;
      }









      case 'GET_ALL_QUESTIONS': {
        // Wyslij wszystkie dostepne kategorie i pytania finalne do hosta
        send(ws, {
          type: 'ALL_QUESTIONS_DATA',
          r1Kategorie: getAllKategorie(1),
          r2Kategorie: getAllKategorie(2),
          finalPytania: getFinalPytania()
        });
        break;
      }

      case 'ORGANIZER_SET_KATEGORIE': {
        const room = rooms[playerRoom];
        if (!room || room.hostId !== playerId) break;
        const { round, kategorie } = msg;
        if (!room.orgSettings) room.orgSettings = { r1Kategorie: null, r2Kategorie: null };
        if (round === 0) room.orgSettings.r1Kategorie = kategorie;
        if (round === 1) room.orgSettings.r2Kategorie = kategorie;
        break;
      }

      case 'ORGANIZER_SET_VB_BY_NAME': {
        const room = rooms[playerRoom];
        if (!room || room.hostId !== playerId) break;
        if (!room.orgSettings) room.orgSettings = {};
        if (msg.round === 0) {
          room.orgSettings.vb1 = { katNazwa: msg.katNazwa, pytanieIdx: msg.pytanieIdx };
        } else {
          if (!room.orgSettings.vb2) room.orgSettings.vb2 = [null, null];
          room.orgSettings.vb2[msg.slot || 0] = { katNazwa: msg.katNazwa, pytanieIdx: msg.pytanieIdx };
        }
        break;
      }

      case 'REJOIN': {
        const room = rooms[msg.roomCode];
        if (!room) { send(ws, { type:'ERROR', msg:'Pokoj nie istnieje' }); break; }
        const existing = room.players.find(p => p.id === msg.playerId);
        if (!existing) { send(ws, { type:'ERROR', msg:'Gracz nie znaleziony' }); break; }
        existing.ws = ws;
        playerId = existing.id;
        playerRoom = msg.roomCode;
        console.log('[REJOIN]', existing.name, 'faza:', room.phase);

        if (room.phase === 'selecting' || room.phase === 'vabanque_bet') {
          const isMyTurn = room.currentSelector === playerId;
          send(ws, {
            type: 'ROUND_START',
            round: room.currentRound + 1,
            board: getBoard(room),
            currentSelector: room.currentSelector,
            selectorName: room.players.find(p => p.id === room.currentSelector)?.name,
            players: getPublicPlayers(room)
          });
        } else if (room.phase === 'buzzing' || room.phase === 'answering') {
          send(ws, {
            type: 'QUESTION',
            haslo: room.currentQuestion.haslo,
            wartosc: room.currentQuestion.wartosc,
            vabanque: room.currentQuestion.vabanque,
            board: getBoard(room),
            players: getPublicPlayers(room)
          });
        } else if (room.phase === 'final_betting' || room.phase === 'final_question') {
          send(ws, {
            type: 'FINAL_START',
            kategoria: '?',
            message: 'Trwa finał!',
            players: getPublicPlayers(room)
          });
        }
        break;
      }

      case 'START_GAME': {
        const room = rooms[playerRoom];
        if (!room || room.hostId !== playerId) break;
        if (room.players.length < 2) { send(ws, { type: 'ERROR', msg: 'Potrzeba min. 2 graczy' }); break; }

        if (room.hostRole === 'organizer' && room.orgSettings) {
          // Uzyj kategorii wybranych przez organizatora
          room.questions = getQuestions(room.orgSettings);
          // Ustaw Va Banque wedlug wyboru organizatora
          if (room.orgSettings.vb1) {
            const { katNazwa, pytanieIdx } = room.orgSettings.vb1;
            room.questions[0].kategorie.forEach(k => k.pytania.forEach(p => { delete p.vabanque; }));
            const kat = room.questions[0].kategorie.find(k => k.nazwa === katNazwa);
            if (kat && kat.pytania[pytanieIdx]) kat.pytania[pytanieIdx].vabanque = true;
          }
          if (room.orgSettings.vb2) {
            room.questions[1].kategorie.forEach(k => k.pytania.forEach(p => { delete p.vabanque; }));
            room.orgSettings.vb2.forEach(vb => {
              if (!vb) return;
              const kat = room.questions[1].kategorie.find(k => k.nazwa === vb.katNazwa);
              if (kat && kat.pytania[vb.pytanieIdx]) kat.pytania[vb.pytanieIdx].vabanque = true;
            });
          }
        } else {
          room.questions = getQuestions(); // losuj automatycznie
        }

        startRound(playerRoom, 0);
        break;
      }

      case 'SELECT_QUESTION': {
        const room = rooms[playerRoom];
        if (!room || room.phase !== 'selecting') break;
        if (room.currentSelector !== playerId) {
          send(ws, { type: 'ERROR', msg: 'Nie twoja kolej na wybor' }); break;
        }

        const { kategoriaIdx, pytanieIdx } = msg;
        const runda = room.questions[room.currentRound];
        const kat = runda.kategorie[kategoriaIdx];
        if (!kat) break;
        const pyt = kat.pytania[pytanieIdx];
        if (!pyt) break;
        const key = kat.nazwa + '_' + pytanieIdx;
        if (room.usedQuestions[key]) { send(ws, { type: 'ERROR', msg: 'Pytanie juz uzyte' }); break; }

        // Va Banque - gracz podaje stawke (bez limitu gornego)
        if (pyt.vabanque) {
          room.phase = 'vabanque_bet';
          room.pendingQuestion = { kategoriaIdx, pytanieIdx };
          const playerScore = room.players.find(p=>p.id===playerId)?.score || 0;
          // Wyslij info tylko do gracza ktory trafil Va Banque
          send(ws, { type: 'VABANQUE_BET_REQUEST', wartosc: pyt.wartosc, score: playerScore, unlimited: true });
          // Pozostalym tylko komunikat ze ktos trafil
          broadcast(playerRoom, {
            type: 'VABANQUE_ANNOUNCE',
            playerName: room.players.find(p=>p.id===playerId)?.name,
            players: getPublicPlayers(room)
          }, playerId);
        } else {
          sendQuestion(playerRoom, kategoriaIdx, pytanieIdx, null);
        }
        break;
      }

      case 'VABANQUE_STAKE': {
        const room = rooms[playerRoom];
        if (!room || room.phase !== 'vabanque_bet') break;
        if (room.currentSelector !== playerId) break;
        let stawka = parseInt(msg.stawka) || 0;
        stawka = Math.max(0, stawka);
        const { kategoriaIdx, pytanieIdx } = room.pendingQuestion;
        // Dopiero po obstawieniu gracz widzi pytanie
        sendQuestion(playerRoom, kategoriaIdx, pytanieIdx, stawka);
        break;
      }

      case 'BUZZ': {
        const room = rooms[playerRoom];
        if (!room || room.phase !== 'buzzing') break;
        if (room.buzzer) break; // Juz ktos sie zglosil

        clearTimeout(room.buzzTimer);
        room.buzzer = playerId;
        room.phase = 'answering';

        broadcastAll(playerRoom, {
          type: 'BUZZED',
          playerId,
          playerName: room.players.find(p=>p.id===playerId)?.name,
          players: getPublicPlayers(room)
        });

        // 12 sekund na odpowiedz
        room.answerTimer = setTimeout(() => {
          if (room.phase !== 'answering') return;
          // Czas minal
          const p = room.players.find(pl => pl.id === room.buzzer);
          if (p) p.score -= room.currentQuestion.wartosc;
          room.phase = 'selecting';
          const allUsed = checkAllUsed(room);
          broadcastAll(playerRoom, {
            type: 'ANSWER_RESULT',
            correct: false,
            timeout: true,
            playerName: p?.name,
            correctAnswer: room.currentQuestion.odpowiedz,
            scoreChange: -room.currentQuestion.wartosc,
            players: getPublicPlayers(room),
            board: getBoard(room),
            currentSelector: room.currentSelector,
            selectorName: room.players.find(pl => pl.id === room.currentSelector)?.name
          });
          if (allUsed) handleRoundEnd(playerRoom);
        }, 20000);
        break;
      }

      case 'ANSWER': {
        const room = rooms[playerRoom];
        if (!room || room.phase !== 'answering') break;
        if (room.buzzer !== playerId) break;

        clearTimeout(room.answerTimer);

        const correct = checkAnswer(msg.answer, room.currentQuestion.odpowiedz);
        const p = room.players.find(pl => pl.id === playerId);
        const scoreChange = correct ? room.currentQuestion.wartosc : -room.currentQuestion.wartosc;
        if (p) p.score += scoreChange;

        if (correct) {
          room.currentSelector = playerId; // Kto odpowiedzial poprawnie, ten nastepnie wybiera
        }

        room.phase = 'selecting';
        const allUsed = checkAllUsed(room);

        broadcastAll(playerRoom, {
          type: 'ANSWER_RESULT',
          correct,
          timeout: false,
          playerName: p?.name,
          answer: msg.answer,
          correctAnswer: room.currentQuestion.odpowiedz,
          scoreChange,
          players: getPublicPlayers(room),
          board: getBoard(room),
          currentSelector: room.currentSelector,
          selectorName: room.players.find(pl => pl.id === room.currentSelector)?.name
        });

        if (allUsed) handleRoundEnd(playerRoom);
        break;
      }

      case 'FINAL_BET': {
        const room = rooms[playerRoom];
        if (!room || room.phase !== 'final_betting') break;
        const p = room.players.find(pl => pl.id === playerId);
        if (!p) break;
        let bet = parseInt(msg.bet) || 0;
        bet = Math.max(0, Math.min(bet, Math.max(0, p.score)));
        room.finalBets[playerId] = bet;
        send(ws, { type: 'BET_ACCEPTED', bet });
        break;
      }

      case 'FINAL_ANSWER': {
        const room = rooms[playerRoom];
        if (!room || room.phase !== 'final_question') break;
        if (room.finalAnswers[playerId]) break;
        room.finalAnswers[playerId] = msg.answer;
        send(ws, { type: 'FINAL_ANSWER_ACK' });
        // Jesli wszyscy odpowiedzieli
        if (Object.keys(room.finalAnswers).length >= room.players.length) {
          clearTimeout(room.finalAnswerTimer);
          resolveFinal(playerRoom);
        }
        break;
      }
    }
  });

  ws.on('close', () => {
    if (!playerRoom || !playerId) return;
    const room = rooms[playerRoom];
    if (!room) return;
    const p = room.players.find(pl => pl.id === playerId);
    if (p) p.ws = null;
  });
});

const PORT = process.env.PORT || 3000;
const os = require('os');

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

server.listen(PORT, () => {
  const ip = getLocalIP();
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║           🎰  VA BANQUE  🎰                  ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  Na tym komputerze:                          ║');
  console.log('║  http://localhost:' + PORT + '                       ║');
  console.log('║                                              ║');
  console.log('║  Dla innych w tej samej sieci Wi-Fi:         ║');
  console.log('║  http://' + ip + ':' + PORT + '                  ║');
  console.log('║                                              ║');
  console.log('║  Wpisz ten adres na telefonie lub tablecie!  ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
});
