// ==================== FRONTEND: MAIN GAME PAGE ====================
// File: src/app/page.tsx
// Đây là file Giao diện chính của Trò chơi "Cả lớp đánh boss".
// Giao diện xử lý việc tương tác của người chơi, gọi các API Route Backend và Polling trạng thái mỗi 2s.

"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { 
  Swords, 
  ShieldAlert, 
  Users, 
  History, 
  Trophy, 
  Sparkles, 
  RotateCcw, 
  UserPlus,
  Flame,
  Zap
} from "lucide-react";

interface DamagePopup {
  id: number;
  damage: number;
  x: number;
  y: number;
}

export default function Home() {
  // ==================== FRONTEND STATE MANAGEMENT ====================
  const [playerName, setPlayerName] = useState<string>("");
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [inputName, setInputName] = useState<string>("");

  const [bossHp, setBossHp] = useState<number>(1000);
  const [bossMaxHp, setBossMaxHp] = useState<number>(1000);
  const [players, setPlayers] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const [isAttacking, setIsAttacking] = useState<boolean>(false);
  const [isBossShaking, setIsBossShaking] = useState<boolean>(false);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);

  const confettiFiredRef = useRef<boolean>(false);

  // Tự động kiểm tra Tên người chơi đã lưu trong localStorage từ trước
  useEffect(() => {
    const savedName = localStorage.getItem("boss_game_player_name");
    if (savedName) {
      setPlayerName(savedName);
      setInputName(savedName);
      setHasJoined(true);
      // Đăng ký lại với backend
      fetchJoinedPlayer(savedName);
    }
  }, []);

  // ==================== FRONTEND API CALL: FETCH STATE (POLLING) ====================
  // Gọi GET /api/state định kỳ mỗi 2 giây
  const fetchGameState = async () => {
    try {
      const res = await fetch("/api/state");
      if (res.ok) {
        const data = await res.json();
        setBossHp(data.bossHp);
        setBossMaxHp(data.bossMaxHp);
        setPlayers(data.players || []);
        setLogs(data.logs || []);
        setWinner(data.winner ?? null);

        // Nếu boss bị tiêu diệt và chưa bắn pháo hoa thì kích hoạt confetti
        if (data.bossHp === 0 && !confettiFiredRef.current) {
          confettiFiredRef.current = true;
          triggerVictoryConfetti();
        } else if (data.bossHp > 0) {
          confettiFiredRef.current = false;
        }
      }
    } catch (error) {
      console.error("Lỗi khi polling trạng thái server:", error);
    }
  };

  // Thiết lập Interval Polling 2 giây
  useEffect(() => {
    fetchGameState(); // Lần lấy đầu tiên ngay khi load
    const interval = setInterval(() => {
      fetchGameState();
    }, 2000); // Polling mỗi 2000ms (2 giây)

    return () => clearInterval(interval);
  }, []);

  // ==================== FRONTEND API CALL: POST /api/join ====================
  const fetchJoinedPlayer = async (nameToJoin: string) => {
    try {
      await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameToJoin }),
      });
      fetchGameState();
    } catch (err) {
      console.error("Lỗi đăng ký người chơi:", err);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = inputName.trim();
    if (!name) return;

    setPlayerName(name);
    localStorage.setItem("boss_game_player_name", name);
    setHasJoined(true);

    await fetchJoinedPlayer(name);
  };

  // ==================== FRONTEND API CALL: POST /api/attack ====================
  const handleAttack = async () => {
    if (isAttacking || bossHp <= 0) return;

    setIsAttacking(true);
    setIsBossShaking(true);

    // Tạo hiệu ứng Damage Floating Text trên màn hình
    const popupId = Date.now();
    const randomX = Math.floor(Math.random() * 80) - 40;
    const randomY = Math.floor(Math.random() * 40) - 20;
    
    try {
      const res = await fetch("/api/attack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBossHp(data.bossHp);
          setLogs(data.logs || []);
          if (data.winner) setWinner(data.winner);

          // Thêm popup sát thương
          setDamagePopups((prev) => [
            ...prev,
            { id: popupId, damage: data.damage, x: randomX, y: randomY },
          ]);

          setTimeout(() => {
            setDamagePopups((prev) => prev.filter((p) => p.id !== popupId));
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tấn công:", error);
    } finally {
      setTimeout(() => setIsBossShaking(false), 400);
      setTimeout(() => setIsAttacking(false), 300);
    }
  };

  // ==================== FRONTEND API CALL: POST /api/reset ====================
  const handleResetGame = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          confettiFiredRef.current = false;
          setWinner(null);
          fetchGameState();
        }
      }
    } catch (err) {
      console.error("Lỗi reset game:", err);
    } finally {
      setIsResetting(false);
    }
  };

  // Hiệu ứng pháo hoa ăn mừng chiến thắng
  const triggerVictoryConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  // Tính phần trăm máu Boss
  const hpPercent = Math.max(0, Math.min(100, Math.round((bossHp / bossMaxHp) * 100)));

  // Màu thanh máu tùy thuộc vào phần trăm
  const getHealthBarColor = () => {
    if (hpPercent > 60) return "from-green-500 via-emerald-400 to-teal-500";
    if (hpPercent > 25) return "from-yellow-500 via-amber-400 to-orange-500";
    return "from-red-600 via-rose-500 to-pink-600";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500 selection:text-white pb-12">
      {/* Background Graphic Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-[128px]"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-rose-600 rounded-full blur-[128px]"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600 rounded-full blur-[128px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-6">
        {/* Header Title Bar */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/30">
              <Swords className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-wide bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                CẢ LỚP ĐÁNH BOSS 🚀
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Đồng sức đồng lòng - Tiêu diệt Ma Vương Học Kỳ!
              </p>
            </div>
          </div>

          {hasJoined && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800/90 px-4 py-2 rounded-xl border border-purple-500/30 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-400">Anh hùng:</span>
                <span className="font-bold text-amber-300">{playerName}</span>
              </div>
              <button
                onClick={() => {
                  setHasJoined(false);
                  localStorage.removeItem("boss_game_player_name");
                }}
                className="text-xs text-slate-400 hover:text-rose-400 underline transition"
              >
                Đổi tên
              </button>
            </div>
          )}
        </header>

        {/* ==================== SCREEN 1: MÀN HÌNH NHẬP TÊN (JOIN MATCH) ==================== */}
        {!hasJoined ? (
          <div className="max-w-md mx-auto my-12 bg-slate-900/90 border border-purple-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/40 animate-bounce">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Báo Danh Vào Trận</h2>
            <p className="text-slate-400 text-sm mb-6">
              Nhập tên học sinh của bạn để cùng các bạn trong lớp tham gia trận đại chiến!
            </p>

            <form onSubmit={handleJoinGame} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Ví dụ: An, Bình, Cường..."
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  maxLength={20}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-bold text-amber-300 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={!inputName.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 disabled:opacity-50 font-bold text-lg rounded-xl shadow-lg shadow-purple-600/30 active:scale-95 transition transform duration-150 flex items-center justify-center gap-2"
              >
                <Swords className="w-5 h-5" />
                VÀO TRẬN
              </button>
            </form>
          </div>
        ) : (
          /* ==================== SCREEN 2: MÀN HÌNH ĐÁNH BOSS (BATTLE SCREEN) ==================== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1 & 2: BOSS CARD & ATTACK BUTTON */}
            <div className="lg:col-span-2 space-y-6">
              {/* BOSS DISPLAY CARD */}
              <div
                className={`relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl transition duration-200 overflow-hidden ${
                  isBossShaking ? "animate-shake border-rose-500/80 shadow-rose-500/30" : ""
                }`}
              >
                {/* Boss Badge & Status Header */}
                <div className="flex justify-between items-center mb-4">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold rounded-full">
                    <ShieldAlert className="w-4 h-4" /> SUPER BOSS
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Tự động cập nhật (2s)
                  </span>
                </div>

                {/* Boss Avatar & Floating Damage Popup Container */}
                <div className="relative flex flex-col items-center justify-center my-6">
                  {/* Floating Damage Text Popup */}
                  {damagePopups.map((popup) => (
                    <div
                      key={popup.id}
                      style={{
                        transform: `translate(${popup.x}px, ${popup.y}px)`,
                      }}
                      className="absolute z-30 font-black text-3xl sm:text-4xl text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] animate-damage-float pointer-events-none flex items-center gap-1"
                    >
                      <Zap className="w-6 h-6 text-rose-500 fill-rose-500" /> -{popup.damage} HP
                    </div>
                  ))}

                  {/* Boss Sprite Graphics */}
                  <div className={`relative transition transform duration-200 ${isBossShaking ? "scale-105" : "hover:scale-102"}`}>
                    <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-b from-rose-600 via-purple-700 to-indigo-900 p-2 shadow-2xl pulse-glow flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden border-4 border-rose-500/50">
                        {bossHp > 0 ? (
                          <div className="text-center">
                            <span className="text-6xl sm:text-7xl select-none filter drop-shadow-lg">
                              👹
                            </span>
                            <p className="text-xs font-bold text-rose-400 mt-2 tracking-wider">
                              MA VƯƠNG HỌC KỲ
                            </p>
                          </div>
                        ) : (
                          <div className="text-center animate-bounce">
                            <span className="text-6xl sm:text-7xl select-none">
                              😵‍💫
                            </span>
                            <p className="text-xs font-bold text-slate-400 mt-2">
                              BỊ HẠ GỤC
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white mt-4">
                    CHÚA TỂ BÀI TẬP VỀ NHÀ
                  </h3>
                </div>

                {/* BOSS HP BAR */}
                <div className="space-y-2 max-w-lg mx-auto">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Flame className="w-4 h-4 text-rose-500" /> Thanh Máu Boss
                    </span>
                    <span className="text-amber-400 font-mono text-base">
                      {bossHp} / {bossMaxHp} HP ({hpPercent}%)
                    </span>
                  </div>

                  {/* Progress Container */}
                  <div className="h-6 w-full bg-slate-950 rounded-full p-1 border border-slate-800 overflow-hidden relative shadow-inner">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getHealthBarColor()} transition-all duration-300 ease-out shadow-lg`}
                      style={{ width: `${hpPercent}%` }}
                    ></div>
                    {/* Gloss effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-full"></div>
                  </div>
                </div>

                {/* ATTACK BUTTON */}
                <div className="mt-8 flex flex-col items-center">
                  <button
                    onClick={handleAttack}
                    disabled={isAttacking || bossHp <= 0}
                    className={`w-full max-w-md py-5 rounded-2xl font-black text-xl tracking-wider uppercase shadow-2xl transition transform duration-150 flex items-center justify-center gap-3 ${
                      bossHp <= 0
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                        : isAttacking
                        ? "bg-rose-700 scale-95 opacity-80 cursor-wait"
                        : "bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-rose-600/40 active:scale-95 hover:shadow-rose-600/60 cursor-pointer"
                    }`}
                  >
                    <Swords className={`w-7 h-7 ${isAttacking ? "animate-spin" : ""}`} />
                    {bossHp <= 0 ? "BOSS ĐÃ CHẾT" : isAttacking ? "ĐANG TẤN CÔNG..." : "TẤN CÔNG (-5 ~ -20 HP)"}
                  </button>

                  {bossHp > 0 && (
                    <p className="text-xs text-slate-400 mt-2 font-medium">
                      Bấm liên tục để gây sát thương ngẫu nhiên cho Boss!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 3: PLAYERS ROSTER & ACTION LOGS */}
            <div className="space-y-6">
              
              {/* PLAYERS LIST (DANH SÁCH NGƯỜI CHƠI) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    Biệt Đội Lớp Học ({players.length})
                  </h3>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold">
                    Online
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                  {players.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">Chưa có ai tham gia...</p>
                  ) : (
                    players.map((p, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                          p === playerName
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                            : "bg-slate-800/80 border-slate-700 text-slate-300"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        {p}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* ACTION LOGS (LOG 8 HÀNH ĐỘNG GẦN NHẤT) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-400" />
                    Nhật Ký Chiến Trường (8)
                  </h3>
                </div>

                <div className="space-y-2 font-mono text-xs max-h-64 overflow-y-auto pr-1">
                  {logs.length === 0 ? (
                    <p className="text-slate-500 text-xs py-2">Chưa có hành động nào.</p>
                  ) : (
                    logs.map((log, index) => (
                      <div
                        key={index}
                        className={`p-2.5 rounded-xl border flex items-start gap-2 transition ${
                          index === 0
                            ? "bg-purple-950/60 border-purple-500/40 text-purple-200 font-bold"
                            : "bg-slate-950/40 border-slate-800/60 text-slate-400"
                        }`}
                      >
                        <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${index === 0 ? "text-amber-400" : "text-slate-600"}`} />
                        <span className="break-words leading-relaxed">{log}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* RESET GAME BUTTON */}
              <div className="text-center pt-2">
                <button
                  onClick={handleResetGame}
                  disabled={isResetting}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <RotateCcw className={`w-4 h-4 ${isResetting ? "animate-spin" : ""}`} />
                  Làm mới lại Boss & Trận đấu
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ==================== VICTORY MODAL (CẢ LỚP CHIẾN THẮNG) ==================== */}
        {bossHp === 0 && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-gradient-to-b from-slate-900 to-purple-950 border-2 border-amber-400/60 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
              {/* Top Trophy Graphic */}
              <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-400/30 animate-bounce">
                <Trophy className="w-12 h-12 text-slate-950" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-amber-300 mb-2 uppercase tracking-wide">
                CẢ LỚP CHIẾN THẮNG!
              </h2>

              <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                🎉 Tuyệt vời! Boss <span className="text-rose-400 font-bold">Chúa Tể Bài Tập</span> đã hoàn toàn bị tiêu diệt bởi sức mạnh đoàn kết của cả lớp!
              </p>

              {/* Winner Highlight Banner */}
              {winner && (
                <div className="mb-6 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border border-amber-400/50 rounded-2xl p-4">
                  <p className="text-xs text-amber-400/80 uppercase font-bold tracking-widest mb-1">⚔️ Đòn Kết Liễu Cuối Cùng</p>
                  <p className="text-2xl font-black text-amber-300">
                    🏆 {winner}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">đã gọi kết thúc trận chiến này!</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleResetGame}
                  className="w-full py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-lg rounded-2xl shadow-lg shadow-amber-400/30 transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  CHƠI LẠI TRẬN MỚI
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
