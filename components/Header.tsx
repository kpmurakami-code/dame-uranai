"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header
      className="w-full py-3 px-4 flex items-center justify-between"
      style={{ borderBottom: "1px solid #fce4ec" }}
    >
      <Link
        href="/"
        className="text-xs tracking-widest font-bold"
        style={{ color: "#ffb7c5" }}
      >
        ✦ ダメ占い ✦
      </Link>

      <div className="flex items-center gap-2">
        {loading ? (
          <span className="text-xs" style={{ color: "#b08090" }}>
            ...
          </span>
        ) : user ? (
          <div className="flex items-center gap-2">
            <span
              className="text-xs hidden sm:block"
              style={{ color: "#7a6060" }}
            >
              {user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0]}
            </span>
            <Link
              href="/history"
              className="text-xs px-3 py-1 rounded-full border transition-colors hover:bg-pink-50"
              style={{ color: "#c2185b", borderColor: "#fce4ec" }}
            >
              履歴
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs px-3 py-1 rounded-full border transition-colors hover:bg-pink-50"
              style={{ color: "#c2185b", borderColor: "#fce4ec" }}
            >
              ログアウト
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="text-xs px-3 py-1.5 rounded-full font-bold transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #ff6b9d, #c64dd1)",
              color: "#fff",
            }}
          >
            ログイン
          </Link>
        )}
      </div>
    </header>
  );
}
