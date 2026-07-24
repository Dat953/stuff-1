// ==================== BACKEND API ROUTE: POST /api/reset ====================
// File: src/app/api/reset/route.ts
// API Route cho phép làm mới lại trận đấu, khôi phục máu Boss để chơi lại lượt mới

import { NextResponse } from "next/server";
import { resetGame, gameState } from "@/lib/gameStore";

export async function POST() {
  try {
    resetGame();
    return NextResponse.json({
      success: true,
      message: "Đã làm mới trận đấu thành công!",
      state: {
        bossHp: gameState.bossHp,
        bossMaxHp: gameState.bossMaxHp,
        players: gameState.players,
        logs: gameState.logs,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Không thể làm mới trận đấu" },
      { status: 500 }
    );
  }
}
