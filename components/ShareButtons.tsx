"use client";

import { useCallback, useState } from "react";
import { analytics } from "@/lib/analytics";

interface ShareButtonsProps {
  shareCardId: string;         // シェア用 div の id
  tweetText: string;           // X シェア用テキスト
  filename?: string;           // ダウンロード時のファイル名
  source?: string;             // シェア元の占い種別（"tarot" | "numerology"）
}

export default function ShareButtons({
  shareCardId,
  tweetText,
  filename = "fortune-result.png",
  source = "unknown",
}: ShareButtonsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = document.getElementById(shareCardId);
      if (!el) {
        alert("シェア用カードが見つからなかったよ〜");
        return;
      }
      const canvas = await html2canvas(el, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      link.click();
      analytics.shareClick(source, "image");
    } catch (err) {
      console.error("画像生成エラー:", err);
      alert("画像の生成に失敗しちゃったよ〜💦 もう一度試してね！");
    } finally {
      setIsGenerating(false);
    }
  }, [shareCardId, filename]);

  const handleTweet = useCallback(() => {
    const encoded = encodeURIComponent(tweetText);
    const url = `https://twitter.com/intent/tweet?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
    analytics.shareClick(source, "x");
  }, [tweetText, source]);

  return (
    <div className="flex flex-col gap-3 mt-4">
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="w-full py-3 px-6 rounded-full text-white text-sm font-bold text-center shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #ff6b9d, #c64dd1)",
        }}
      >
        {isGenerating ? "画像生成中..." : "シェア用画像を保存"}
      </button>

      <button
        onClick={handleTweet}
        className="w-full py-3 px-6 rounded-full text-white text-sm font-bold text-center shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #1a8cd8, #1a6fa8)",
        }}
      >
        Xでシェアする
      </button>
    </div>
  );
}
