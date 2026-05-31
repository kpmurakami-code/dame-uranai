"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { analytics } from "@/lib/analytics";
import { SITE_URL } from "@/lib/site";

interface ShareButtonsProps {
  shareCardId: string;         // シェア用 div の id
  tweetText: string;           // シェア用テキスト（URLは含めない。各導線で付与する）
  shareUrl?: string;           // 流入先URL（各機能ページ）。未指定はサイトトップ
  filename?: string;           // ダウンロード時のファイル名
  source?: string;             // シェア元の占い種別（"tarot" | "numerology" | "aishou"）
}

export default function ShareButtons({
  shareCardId,
  tweetText,
  shareUrl = SITE_URL,
  filename = "fortune-result.png",
  source = "unknown",
}: ShareButtonsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  // Web Share API（画像付き）対応かどうか。SSRと初期描画はfalse→マウント後に判定（hydration不一致回避）。
  const [canNativeShare, setCanNativeShare] = useState(false);
  // 生成済みのシェア画像をキャッシュ（クリック時はawaitなしでshareを呼ぶ＝ユーザー操作権を保持）
  const fileRef = useRef<File | null>(null);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare
    );
  }, []);

  // URL付きのシェア文（ネイティブ共有／コピー用）
  const textWithUrl = `${tweetText}\n${shareUrl}`;

  // シェアカードを PNG の File に変換
  const generateImageFile = useCallback(async (): Promise<File | null> => {
    const html2canvas = (await import("html2canvas")).default;
    const el = document.getElementById(shareCardId);
    if (!el) return null;
    const canvas = await html2canvas(el, {
      useCORS: true,
      backgroundColor: null,
      scale: 2,
    });
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) return null;
    return new File([blob], filename, { type: "image/png" });
  }, [shareCardId, filename]);

  // 結果表示時にシェア画像を先に生成してキャッシュしておく。
  // → クリック時に重い html2canvas を待たずに済むので navigator.share の
  //   「ユーザー操作直後」判定（user activation）が切れず、確実に共有シートが開く（特にiOS）。
  // tweetText（結果内容）が変わったら作り直す。
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const f = await generateImageFile();
        if (active) fileRef.current = f;
      } catch {
        if (active) fileRef.current = null;
      }
    })();
    return () => {
      active = false;
    };
  }, [generateImageFile, tweetText]);

  // 画像ファイルをダウンロード
  const triggerDownload = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    },
    [filename]
  );

  // 画像保存（キャッシュ優先・なければその場で生成）
  const downloadImage = useCallback(async () => {
    setIsGenerating(true);
    try {
      const file = fileRef.current ?? (await generateImageFile());
      if (!file) {
        alert("シェア用カードが見つからなかったよ〜");
        return false;
      }
      triggerDownload(file);
      analytics.shareClick(source, "image");
      return true;
    } catch (err) {
      console.error("画像生成エラー:", err);
      alert("画像の生成に失敗しちゃったよ〜💦 もう一度試してね！");
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [generateImageFile, triggerDownload, source]);

  // ① ワンタップ共有（Web Share API・画像付き）→ LINE / Instagram / X など共有シートへ。
  //    失敗・非対応時は必ず画像保存にフォールバック（無反応を防ぐ）。
  const handleNativeShare = useCallback(async () => {
    const file = fileRef.current;
    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        // キャッシュ済みファイルを使うので await を挟まず即共有＝操作権を保持
        await navigator.share({ files: [file], text: textWithUrl });
        analytics.shareClick(source, "native");
        return;
      }
      if (navigator.share) {
        // 画像共有が使えない環境はテキスト＋URLのみ共有
        await navigator.share({ text: textWithUrl });
        analytics.shareClick(source, "native");
        return;
      }
    } catch (err) {
      // ユーザーが共有シートを閉じた（AbortError）＝正常。何もしない。
      if ((err as Error)?.name === "AbortError") return;
      // それ以外の失敗（操作権切れ・OS側エラー等）は画像保存にフォールバック
    }
    // 共有が使えない／失敗した → 画像保存にフォールバックして必ず反応を返す
    await downloadImage();
  }, [textWithUrl, source, downloadImage]);

  // ③ X（テキスト＋URL＝リンクプレビューが出る）
  const handleTweet = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    analytics.shareClick(source, "x");
  }, [tweetText, shareUrl, source]);

  // ④ LINE（テキスト＋URL。OGPプレビュー付きで共有される）
  const handleLine = useCallback(() => {
    const url = `https://line.me/R/share?text=${encodeURIComponent(textWithUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    analytics.shareClick(source, "line");
  }, [textWithUrl, source]);

  return (
    <div className="flex flex-col gap-3 mt-4">
      {/* シェア誘導の一言（拡散の後押し） */}
      <p className="text-center text-xs font-bold" style={{ color: "#c2185b" }}>
        📣 結果をシェアして友だちにも教えてあげて〜！<span style={{ color: "#7c3aed" }}>#ダメ占い</span>
      </p>

      {/* ① ワンタップ共有（対応環境のみ＝主にスマホ） */}
      {canNativeShare && (
        <button
          onClick={handleNativeShare}
          disabled={isGenerating}
          className="w-full py-3 px-6 rounded-full text-white text-sm font-bold text-center shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #ff6b9d, #c64dd1)" }}
        >
          {isGenerating ? "準備中..." : "📲 シェアする"}
        </button>
      )}

      {/* ②③④ 個別の共有先 */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={downloadImage}
          disabled={isGenerating}
          className="py-3 px-2 rounded-full text-white text-xs font-bold text-center shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #ff9ec4, #c64dd1)" }}
        >
          {isGenerating ? "生成中…" : "画像を保存"}
        </button>
        <button
          onClick={handleTweet}
          className="py-3 px-2 rounded-full text-white text-xs font-bold text-center shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #1a8cd8, #1a6fa8)" }}
        >
          Xでシェア
        </button>
        <button
          onClick={handleLine}
          className="py-3 px-2 rounded-full text-white text-xs font-bold text-center shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #06C755, #03a344)" }}
        >
          LINEでシェア
        </button>
      </div>
    </div>
  );
}
