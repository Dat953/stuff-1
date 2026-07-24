// ==================== BACKEND API ROUTE: GET /api/state ====================
// File: src/app/api/state/route.ts
// API Route này nhận yêu cầu GET từ Frontend để trả về toàn bộ trạng thái trận đấu hiện tại

import { NextResponse } from "next/server";
import { gameState } from "@/lib/gameStore";

export async function GET() {
  try {
    // Trả về bossHp, bossMaxHp, danh sách người chơi và nhật ký 8 hành động
    return NextResponse.json({
      bossHp: gameState.bossHp,
      bossMaxHp: gameState.bossMaxHp,
      players: gameState.players,
      logs: gameState.logs,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Không thể lấy trạng thái trận đấu" },
      { status: 500 }
    );
  }
}
