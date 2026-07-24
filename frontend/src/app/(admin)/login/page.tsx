"use client";

import { FormEvent, useState, Suspense, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const { isDark, toggle } = useThemeStore();
  const { lang, setLang, dir } = useLanguageStore();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("loginError"));
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
        style={{ backgroundImage: "url('/images/login-background.png')" }}
      />
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark ? "bg-black/60" : "bg-black/30"
        }`}
      />

      <div
        className="relative z-10 w-full max-w-md px-3 sm:px-4"
        dir={dir}
      >
        <div
          className={`rounded-2xl sm:rounded-3xl border p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 ${
            isDark
              ? "border-white/10 bg-black/40"
              : "border-gray-200/50 bg-white/80"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <div
              ref={langMenuRef}
              className="relative"
            >
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition-all duration-300 ${
                  isDark
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-gray-200/80 text-gray-700 hover:bg-gray-300/80"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
                {lang === "ar" ? "العربية" : "English"}
                <svg
                  className={`h-3 w-3 transition-transform duration-200 ${langMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              {langMenuOpen && (
                <div
                  className={`absolute top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl border shadow-2xl ${
                    isDark
                      ? "border-white/10 bg-[#1a1a2e]"
                      : "border-gray-200 bg-white"
                  }`}
                  style={{
                    [lang === "ar" ? "right" : "left"]: "0",
                  }}
                >
                  <button
                    onClick={() => {
                      setLang("ar");
                      setLangMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      lang === "ar"
                        ? "bg-mad-accent/15 text-mad-accent"
                        : isDark
                          ? "text-gray-300 hover:bg-white/5"
                          : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">🇸🇦</span>
                    العربية
                    {lang === "ar" && (
                      <svg
                        className="ms-auto h-4 w-4 text-mad-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </button>
                  <div
                    className={`h-px ${isDark ? "bg-white/10" : "bg-gray-100"}`}
                  />
                  <button
                    onClick={() => {
                      setLang("en");
                      setLangMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      lang === "en"
                        ? "bg-mad-accent/15 text-mad-accent"
                        : isDark
                          ? "text-gray-300 hover:bg-white/5"
                          : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">🇺🇸</span>
                    English
                    {lang === "en" && (
                      <svg
                        className="ms-auto h-4 w-4 text-mad-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={toggle}
              className={`flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-sm transition-all duration-300 ${
                isDark
                  ? "bg-white/10 text-yellow-400 hover:bg-white/20"
                  : "bg-gray-200/80 text-indigo-600 hover:bg-gray-300/80"
              }`}
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="mb-6 sm:mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-2 sm:gap-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-mad-accent">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0V6.75a3 3 0 013-3h12a3 3 0 013 3v2.596"
                  />
                </svg>
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-bold transition-colors duration-500 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                MAD_TECH
              </h1>
            </div>
            <h2
              className={`text-lg sm:text-xl font-semibold transition-colors duration-500 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {t("loginTitle")}
            </h2>
            <p
              className={`mt-2 text-sm transition-colors duration-500 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t("loginSubtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="relative">
              <div
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 transition-colors duration-500 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
                style={{
                  [lang === "ar" ? "right" : "left"]: "1rem",
                }}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("username")}
                autoComplete="username"
                required
                className={`w-full rounded-xl border py-4 outline-none transition-all duration-500 ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-mad-accent focus:bg-white/10"
                    : "border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-400 focus:border-mad-accent focus:bg-white"
                }`}
                style={{
                  [lang === "ar" ? "paddingRight" : "paddingLeft"]: "3rem",
                  [lang === "ar" ? "paddingLeft" : "paddingRight"]: "1rem",
                }}
              />
            </div>

            <div className="relative">
              <div
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 transition-colors duration-500 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
                style={{
                  [lang === "ar" ? "right" : "left"]: "1rem",
                }}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password")}
                autoComplete="current-password"
                required
                className={`w-full rounded-xl border py-4 outline-none transition-all duration-500 ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-mad-accent focus:bg-white/10"
                    : "border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-400 focus:border-mad-accent focus:bg-white"
                }`}
                style={{
                  [lang === "ar" ? "paddingRight" : "paddingLeft"]: "3rem",
                  [lang === "ar" ? "paddingLeft" : "paddingRight"]: "3rem",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 transition-colors duration-500 ${
                  isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                style={{
                  [lang === "ar" ? "left" : "right"]: "1rem",
                }}
                title={showPassword ? t("hidePassword") : t("showPassword")}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-mad-accent py-4 text-lg font-semibold text-white transition-all hover:bg-mad-accent-light hover:shadow-lg hover:shadow-mad-accent/25 disabled:opacity-50"
            >
              {loading ? (
                <svg
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                t("login")
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-mad-bg text-mad-text-secondary">
          جاري التحميل...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
