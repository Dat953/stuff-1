// ==================== BACKEND API ROUTE: POST /api/join ====================
// File: src/app/api/join/route.ts
// API Route nhận thông tin người chơi mới đăng ký tham gia trận đấu

import { NextResponse } from "next/server";
import { gameState, addLog } from "@/lib/gameStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Tên người chơi không được để trống!" },
        { status: 400 }
      );
    }

    // Nếu tên người chơi chưa có trong danh sách thì thêm vào
    if (!gameState.players.includes(name)) {
      gameState.players.push(name);
      addLog(`✨ Học sinh [${name}] đã gia nhập trận chiến!`);
    }

    return NextResponse.json({
      success: true,
      message: `Chào mừng ${name} đến với trận đấu!`,
      players: gameState.players,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra khi tham gia trận đấu" },
      { status: 500 }
    );
  }
}
