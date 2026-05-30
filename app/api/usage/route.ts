import { getUsageStatus } from "@/lib/usageGate";

// 残り回数の表示用。フリーミアム判定の権威はサーバー（このエンドポイント＋各占いAPI）。
export async function GET() {
  const status = await getUsageStatus();
  return Response.json(
    { isLoggedIn: status.isLoggedIn, remaining: status.remaining },
    { headers: { "Cache-Control": "no-store" } }
  );
}
