"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface DailyData {
  character: "angel" | "devil";
  message: string;
  date: string;
  luckyColor?: { name: string; hex: string };
}

function getTodayJST(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

export default function DailyMessage() {
  const [data, setData] = useState<DailyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const today = getTodayJST();
    fetch(`/api/daily?date=${today}`)
      .then((res) => res.json())
      .then((json: DailyData) => {
        setData(json);
      })
      .catch(() => {
        // フォールバック
        setData({
          character: "angel",
          message:
            "えっと〜、今日も一日、なんかいいことあるといいね〜！（ふわっと）✨",
          date: today,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const isAngel = data?.character === "angel";

  return (
    <div
      className="w-full max-w-md mx-auto rounded-3xl p-5 shadow-md"
      style={{
        background: isAngel
          ? "linear-gradient(145deg, #fff9f0, #fce4ec)"
          : "linear-gradient(145deg, #f5f0ff, #e8d5ff)",
      }}
    >
      <p
        className="text-xs font-bold text-center mb-3"
        style={{ color: "#b08090" }}
      >
        ✦ 今日のひとこと ✦
      </p>

      {isLoading ? (
        <div className="flex justify-center items-center py-4">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: "#ff6b9d",
                  animation: `pulse 1s infinite ${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      ) : data ? (
        <div className="flex items-start gap-3">
          <div className="relative w-14 h-14 flex-shrink-0">
            <Image
              src={
                isAngel
                  ? "/images/characters/24_ANGEL.png"
                  : "/images/characters/25_DEVIL.png"
              }
              alt={isAngel ? "ダメ天使" : "ダメ悪魔"}
              fill
              sizes="200px"
              className="object-contain float-animation"
            />
          </div>
          <div className="flex-1">
            <p
              className="text-xs font-bold mb-1"
              style={{ color: isAngel ? "#c2185b" : "#6a1b9a" }}
            >
              {isAngel ? "ダメ天使" : "ダメ悪魔"}
            </p>
            <div
              className="rounded-2xl rounded-tl-sm p-3 text-sm leading-relaxed"
              style={{
                background: isAngel ? "#fce4ec" : "#e8d5ff",
                color: "#3d2c2c",
              }}
            >
              {data.message}
            </div>
            {data.luckyColor && (
              <div className="flex items-center gap-2 mt-2 px-1">
                <span className="text-xs" style={{ color: "#b08090" }}>
                  🍀 ラッキーカラー
                </span>
                <span
                  className="inline-block w-4 h-4 rounded-full border border-white shadow-sm flex-shrink-0"
                  style={{ background: data.luckyColor.hex }}
                />
                <span
                  className="text-xs font-bold"
                  style={{ color: "#3d2c2c" }}
                >
                  {data.luckyColor.name}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
