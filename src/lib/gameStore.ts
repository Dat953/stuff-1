// ==================== BACKEND: SERVER IN-MEMORY GAME STORE ====================
// File: src/lib/gameStore.ts
// Đây là file xử lý lưu trữ trạng thái Game trong bộ nhớ tạm (In-Memory) của máy chủ Backend.

export interface GameState {
  bossHp: number;
  bossMaxHp: number;
  players: string[]; // Danh sách tên người chơi đang tham gia
  logs: string[];    // Danh sách 8 hành động gần nhất
  winner: string | null; // Người đánh đòn kết liễu Boss
}

// Khởi tạo trạng thái mặc định ban đầu của trận đấu
const initialGameState: GameState = {
  bossHp: 1000,
  bossMaxHp: 1000,
  players: [],
  logs: ["Trận đấu bắt đầu! Hãy nhập tên và bấm 'Tấn công' để tiêu diệt Boss!"],
  winner: null,
};

// Sử dụng globalThis để giữ lại trạng thái khi Next.js hot-reload ở môi trường phát triển local
const globalForGame = globalThis as unknown as {
  gameStateStore: GameState | undefined;
};

export const gameState: GameState = globalForGame.gameStateStore ?? initialGameState;

if (process.env.NODE_ENV !== "production") {
  globalForGame.gameStateStore = gameState;
}

// Hàm thêm hành động vào log, chỉ giữ lại tối đa 8 log gần nhất
export function addLog(logMessage: string) {
  gameState.logs.unshift(logMessage); // Thêm log mới lên đầu
  if (gameState.logs.length > 8) {
    gameState.logs = gameState.logs.slice(0, 8); // Giữ tối đa 8 log
  }
}

// Hàm reset trò chơi khi cần chơi lại
export function resetGame() {
  gameState.bossHp = gameState.bossMaxHp;
  gameState.players = [];
  gameState.logs = ["Trận đấu mới đã được khởi tạo! Cả lớp sẵn sàng chiến đấu!"];
  gameState.winner = null;
}
