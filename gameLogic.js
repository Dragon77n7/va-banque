function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function normalizeAnswer(str) {
  return str.toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ");
}

function checkAnswer(userAnswer, correctAnswer) {
  const u = normalizeAnswer(userAnswer);
  const c = normalizeAnswer(correctAnswer);
  if (u === c) return true;
  // Czesciowe dopasowanie - jesli odpowiedz zawiera poprawna odpowiedz
  if (u.includes(c) || c.includes(u)) return true;
  return false;
}

module.exports = { generateRoomCode, checkAnswer, normalizeAnswer };
