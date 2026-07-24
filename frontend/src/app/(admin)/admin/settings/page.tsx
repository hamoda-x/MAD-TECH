"use client";

import { useEffect, useState, useRef } from "react";
import {
  getSettings,
  updateSettings,
  changePassword,
  backupDatabase,
  restoreDatabase,
} from "@/lib/api";
import { StoreSettings } from "@/types";
import Loader from "@/components/shared/Loader";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Tab = "general" | "maintenance" | "password" | "backup";

export default function AdminSettingsPage() {
  const { dir, lang } = useLanguageStore();
  const { t } = useTranslation();

  const currencyOptions = [
    { value: "USD", label: "دولار - $.كلي" },
    { value: "EUR", label: "يورو - €" },
    { value: "LYD", label: "دينار ليبي - د.ل" },
    { value: "SAR", label: "ريال سعودي - ر.س" },
    { value: "AED", label: "درهم إماراتي - د.إ" },
  ];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "general",
      label: t("generalSettings"),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: "maintenance",
      label: t("maintenanceMode"),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 3.18A1.5 1.5 0 014 17.025V5.975a1.5 1.5 0 012.036-1.395l5.384 3.18m0 0l5.384 3.18A1.5 1.5 0 0119 12.025v11.05a1.5 1.5 0 01-2.036 1.395l-5.384-3.18m0-12.45V15.17" />
        </svg>
      ),
    },
    {
      id: "password",
      label: t("changePassword"),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      id: "backup",
      label: t("backupRestore"),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      ),
    },
  ];

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSettings();
        setSettings(data);
        setStoreName(data.storeName);
        setStoreDescription(data.storeDescription || "");
        setWhatsappNumber(data.whatsappNumber);
        setCurrency(data.currency);
        setMaintenanceMode(data.maintenanceMode);
        setMaintenanceMessage(data.maintenanceMessage || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : t("error"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSaveGeneral = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateSettings({
        storeName,
        storeDescription: storeDescription || undefined,
        whatsappNumber,
        currency,
      });
      setSettings(updated);
      setSuccess(t("savedSuccessfully"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMaintenance = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateSettings({
        maintenanceMode,
        maintenanceMessage: maintenanceMessage || undefined,
      });
      setSettings(updated);
      setSuccess(t("maintenanceUpdated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword) {
      setError(t("fillRequired"));
      return;
    }

    if (newPassword.length < 6) {
      setError(t("passwordLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess(t("passwordChanged"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleBackup = async () => {
    setBackingUp(true);
    setError("");
    try {
      const blob = await backupDatabase();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mad-tech-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess(t("backupDownloaded"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestore = async (file: File) => {
    setRestoring(true);
    setError("");
    setRestoreConfirm(false);
    try {
      const text = await file.text();
      await restoreDatabase(text);
      setSuccess(t("restoredSuccessfully"));
      const data = await getSettings();
      setSettings(data);
      setStoreName(data.storeName);
      setStoreDescription(data.storeDescription || "");
      setWhatsappNumber(data.whatsappNumber);
      setCurrency(data.currency);
      setMaintenanceMode(data.maintenanceMode);
      setMaintenanceMessage(data.maintenanceMessage || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setRestoring(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleRestore(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4 sm:space-y-6" dir={dir}>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-mad-text">{t("settingsTitle")}</h1>
        <p className="mt-1 text-xs sm:text-sm text-mad-muted">{t("settingsSubtitle")}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-mad-border bg-mad-surface p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setError("");
              setSuccess("");
            }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-mad-accent text-white shadow-lg shadow-mad-accent/25"
                : "text-mad-muted hover:bg-mad-bg hover:text-mad-text"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-mad-border bg-mad-surface p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-mad-text">{t("storeInfo") || "معلومات المتجر"}</h2>
              <p className="mt-1 text-sm text-mad-muted">{t("storeInfoDesc") || "تحديث معلومات متجرك الأساسية"}</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="storeName" className="mb-1.5 block text-sm font-medium text-mad-text">{t("storeName")}</label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-xl border border-mad-border bg-mad-bg px-4 py-3 text-mad-text placeholder-mad-muted outline-none transition-colors focus:border-mad-accent"
                  placeholder="MAD_TECH"
                />
              </div>
              <div>
                <label htmlFor="storeDescription" className="mb-1.5 block text-sm font-medium text-mad-text">{t("storeDescription")} ({t("optional") || "اختياري"})</label>
                <textarea
                  id="storeDescription"
                  name="storeDescription"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-mad-border bg-mad-bg px-4 py-3 text-mad-text placeholder-mad-muted outline-none transition-colors focus:border-mad-accent"
                  placeholder="متجر إلكتروني متخصص في بيع قطع الحواسيب والاكسسوارات."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="whatsappNumber" className="mb-1.5 block text-sm font-medium text-mad-text">{t("whatsappNumber")}</label>
                <input
                  type="text"
                  id="whatsappNumber"
                  name="whatsappNumber"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full rounded-xl border border-mad-border bg-mad-bg px-4 py-3 text-mad-text placeholder-mad-muted outline-none transition-colors focus:border-mad-accent"
                  placeholder="218944623420"
                />
              </div>
              <div>
                <label htmlFor="currency" className="mb-1.5 block text-sm font-medium text-mad-text">{t("currency")}</label>
                <select
                  id="currency"
                  name="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-mad-border bg-mad-bg px-4 py-3 text-mad-text outline-none transition-colors focus:border-mad-accent"
                >
                  {currencyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={handleSaveGeneral}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-mad-accent px-6 py-3 text-sm font-medium text-white transition-all hover:bg-mad-accent-light hover:shadow-lg hover:shadow-mad-accent/25 disabled:opacity-50"
              >
                {saving ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                )}
                {t("saveChanges") || "حفظ التغييرات"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-mad-border bg-mad-surface p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-mad-text">{t("systemInfo") || "معلومات النظام"}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-mad-border bg-mad-bg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-mad-muted">{t("storage") || "التخزين"}</p>
                    <p className="text-sm font-medium text-mad-text">{t("used") || "مستخدم"}</p>
                  </div>
                  <div className="relative h-12 w-12">
                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-mad-border"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="80, 100"
                        className="text-mad-accent"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-mad-text">80%</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-mad-border bg-mad-bg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-mad-muted">{t("database") || "قاعدة البيانات"}</p>
                    <p className="text-sm font-medium text-green-500">{t("connected") || "متصلة"}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-mad-border bg-mad-bg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-mad-muted">{t("server") || "الخادم"}</p>
                    <p className="text-sm font-medium text-green-500">{t("running") || "يعمل"}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-mad-border bg-mad-bg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-mad-muted">{t("version") || "الإصدار"}</p>
                    <p className="text-sm font-medium text-mad-text">v1.0.0</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mad-accent/10">
                    <svg className="h-6 w-6 text-mad-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "maintenance" && (
        <div className="rounded-2xl border border-mad-border bg-mad-surface p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-mad-text">{t("maintenanceMode")}</h2>
            <p className="mt-1 text-sm text-mad-muted">تفعيل أو تعطيل وضع الصيانة للمتجر</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-mad-border p-5">
              <div>
                <p className="text-sm font-medium text-mad-text">{t("activateMaintenance")}</p>
                <p className="mt-1 text-xs text-mad-muted">{t("maintenanceWarning")}</p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative h-7 w-12 rounded-full transition-colors ${maintenanceMode ? "bg-mad-accent" : "bg-mad-border"}`}
              >
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${maintenanceMode ? "start-5" : "start-0.5"}`} />
              </button>
            </div>

            {maintenanceMode && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {t("maintenanceActive")}
                </div>
                <p className="mt-1 text-xs text-amber-500/80">{t("maintenanceActiveDesc")}</p>
              </div>
            )}

            <div>
              <label htmlFor="maintenanceMessage" className="mb-1.5 block text-sm font-medium text-mad-text">{t("maintenanceMessage")}</label>
              <textarea
                id="maintenanceMessage"
                name="maintenanceMessage"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-mad-border bg-mad-bg px-4 py-3 text-mad-text placeholder-mad-muted outline-none transition-colors focus:border-mad-accent"
                placeholder="سنعود قريباً بعد انتهاء الصيانة..."
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveMaintenance}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-mad-accent px-6 py-3 text-sm font-medium text-white transition-all hover:bg-mad-accent-light hover:shadow-lg hover:shadow-mad-accent/25 disabled:opacity-50"
            >
              {saving ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
              {t("save")}
            </button>
          </div>
        </div>
      )}

      {activeTab === "password" && (
        <div className="rounded-2xl border border-mad-border bg-mad-surface p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-mad-text">{t("changePassword")}</h2>
            <p className="mt-1 text-sm text-mad-muted">تغيير كلمة المرور الحساب الإداري</p>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-mad-text">{t("currentPassword")}</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-mad-border bg-mad-bg px-4 py-3 text-mad-text placeholder-mad-muted outline-none transition-colors focus:border-mad-accent"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-mad-text">{t("newPassword")}</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-mad-border bg-mad-bg px-4 py-3 text-mad-text placeholder-mad-muted outline-none transition-colors focus:border-mad-accent"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-mad-text">{t("confirmPassword")}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-mad-border bg-mad-bg px-4 py-3 text-mad-text placeholder-mad-muted outline-none transition-colors focus:border-mad-accent"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="flex items-center gap-2 rounded-xl bg-mad-accent px-6 py-3 text-sm font-medium text-white transition-all hover:bg-mad-accent-light hover:shadow-lg hover:shadow-mad-accent/25 disabled:opacity-50"
            >
              {changingPassword ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              )}
              {t("save")}
            </button>
          </div>
        </div>
      )}

      {activeTab === "backup" && (
        <div className="rounded-2xl border border-mad-border bg-mad-surface p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-mad-text">{t("backupRestore")}</h2>
            <p className="mt-1 text-sm text-mad-muted">إدارة النسخ الاحتياطي لبيانات المتجر</p>
          </div>
          <div className="space-y-6">
            <div className="rounded-xl border border-mad-border p-5">
              <h3 className="text-sm font-medium text-mad-text">{t("downloadBackup")}</h3>
              <p className="mt-1 text-xs text-mad-muted">{t("backupDesc")}</p>
              <button
                onClick={handleBackup}
                disabled={backingUp}
                className="mt-4 flex items-center gap-2 rounded-xl border border-mad-border px-5 py-2.5 text-sm text-mad-text transition-colors hover:border-mad-accent hover:text-mad-accent disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t("downloadBackup")}
              </button>
            </div>

            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
              <h3 className="text-sm font-medium text-red-500">{t("restoreBackup")}</h3>
              <p className="mt-1 text-xs text-red-500/80">{t("restoreDesc")}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={restoring}
                className="mt-4 flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {t("restoreBackup")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={restoreConfirm}
        title={t("confirm")}
        message={t("restoreDesc") + " " + t("confirm") + "?"}
        onConfirm={() => setRestoreConfirm(false)}
        onCancel={() => setRestoreConfirm(false)}
        loading={false}
      />
    </div>
  );
}
