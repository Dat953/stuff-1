// ==================== BACKEND API ROUTE: POST /api/attack ====================
// File: src/app/api/attack/route.ts
// API Route nhận đợt tấn công từ người chơi, random sát thương 5-20, trừ máu boss và lưu nhật ký.

import { NextResponse } from "next/server";
import { gameState, addLog } from "@/lib/gameStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name?.trim() || "Vô danh";

    // Nếu boss đã hết máu thì không cho tấn công nữa
    if (gameState.bossHp <= 0) {
      return NextResponse.json({
        success: false,
        message: "Boss đã bị hạ gục rồi!",
        bossHp: 0,
      });
    }

    // Random sát thương ngẫu nhiên từ 5 đến 20
    const damage = Math.floor(Math.random() * 16) + 5; // 5..20

    // Trừ máu Boss (tối thiểu là 0)
    gameState.bossHp = Math.max(0, gameState.bossHp - damage);

    // Ghi nhật ký trận đấu
    const logText = `${name} đánh ${damage} máu!`;
    addLog(logText);

    // Thông báo nếu đây là đòn kết liễu
    if (gameState.bossHp === 0) {
      gameState.winner = name; // Lưu tên người chiến thắng
      addLog(`🏆 ${name} đã tung đòn kết liễu! Cả lớp chiến thắng Boss! 🎉`);
    }

    return NextResponse.json({
      success: true,
      damage,
      bossHp: gameState.bossHp,
      bossMaxHp: gameState.bossMaxHp,
      players: gameState.players,
      logs: gameState.logs,
      winner: gameState.winner,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra khi tấn công Boss" },
      { status: 500 }
    );
  }
}
