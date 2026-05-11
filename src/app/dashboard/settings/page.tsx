"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Palette,
  Bell,
  Shield,
  Monitor,
  Save,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";

type SettingsTab = "profile" | "appearance" | "generation" | "notifications" | "account";

interface UserStats {
  totalComics: number;
  totalPages: number;
  totalCharacters: number;
  totalExports: number;
  plan: {
    name: string;
    limits: { comics: number; pages: number };
    usage: { comics: number; pages: number };
  };
}

interface UserSettings {
  generation: {
    defaultStyle: string;
    quality: string;
    panelLayout: string;
    autoApprove: boolean;
    memoryRetention: string;
    showProgress: boolean;
    smartSuggestions: boolean;
  };
  notifications: {
    pageReady: boolean;
    exportComplete: boolean;
    memoryWarning: boolean;
    updates: boolean;
    tips: boolean;
    method: string;
  };
  appearance: {
    theme: string;
    accentColor: string;
    compactSidebar: boolean;
    showThumbnails: boolean;
    reduceAnimations: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    plan: "free",
  });

  // Stats state
  const [stats, setStats] = useState<UserStats | null>(null);

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    generation: {
      defaultStyle: "noir-cyberpunk",
      quality: "high",
      panelLayout: "auto",
      autoApprove: false,
      memoryRetention: "full",
      showProgress: true,
      smartSuggestions: true,
    },
    notifications: {
      pageReady: true,
      exportComplete: true,
      memoryWarning: true,
      updates: false,
      tips: false,
      method: "in-app",
    },
    appearance: {
      theme: "dark",
      accentColor: "#E8B931",
      compactSidebar: false,
      showThumbnails: true,
      reduceAnimations: false,
    },
  });

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, statsRes, settingsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/user/stats"),
          fetch("/api/user/settings"),
        ]);

        const userData = await userRes.json();
        const statsData = await statsRes.json();
        const settingsData = await settingsRes.json();

        if (userData.success && userData.user) {
          setProfile({
            name: userData.user.name || "",
            email: userData.user.email || "",
            bio: userData.user.bio || "",
            plan: userData.user.plan || "free",
          });
        } else {
          router.push("/login");
          return;
        }

        if (statsData.success) {
          setStats(statsData.data);
        }

        if (settingsData.success) {
          setSettings(settingsData.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  // Save profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          bio: profile.bio,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(data.error || "Failed to save changes");
      }
    } catch (err) {
      setError("An error occurred while saving");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Settings saved successfully!");
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError(data.error || "Failed to save settings");
      }
    } catch (err) {
      setError("An error occurred while saving");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordSuccess(true);
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        setPasswordError(data.error || "Failed to change password");
      }
    } catch (err) {
      setPasswordError("An error occurred");
      console.error("Password change error:", err);
    } finally {
      setChangingPassword(false);
    }
  };

  const tabs = [
    { key: "profile" as SettingsTab, label: "Profile", icon: User },
    { key: "appearance" as SettingsTab, label: "Appearance", icon: Palette },
    { key: "generation" as SettingsTab, label: "Generation", icon: Monitor },
    { key: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
    { key: "account" as SettingsTab, label: "Account", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#E8B931] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[#F5F5F0] tracking-tight">
            <span className="text-stroke">SETTINGS</span>
          </h2>
          <p className="text-sm text-[#666]">
            Manage your account and preferences.
          </p>
        </div>
        {activeTab === "profile" && (
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-6 py-3 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.15em] uppercase text-xs flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                {saved ? "Saved!" : "Save Changes"}
              </>
            )}
          </button>
        )}
        {(activeTab === "appearance" || activeTab === "generation" || activeTab === "notifications") && (
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-3 bg-[#E8B931] text-[#0A0A0A] font-bold tracking-[0.15em] uppercase text-xs flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                {success ? "Saved!" : "Save Settings"}
              </>
            )}
          </button>
        )}
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings tabs - left */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs tracking-wide whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "text-[#E8B931] bg-[#E8B931]/10 border-l-2 border-[#E8B931]"
                    : "text-[#999]"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="uppercase">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings content - right */}
        <div className="flex-1 max-w-2xl space-y-6">
          {activeTab === "profile" && (
            <>
              {/* Avatar (display only - no photo upload) */}
              <div className="bg-[#111] border border-[#222] p-6">
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-4">
                  Avatar
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#E8B931] flex items-center justify-center text-lg font-bold text-[#0A0A0A]">
                    {getInitials(profile.name)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#F5F5F0]">{profile.name}</div>
                    <div className="text-xs text-[#666]">{profile.email}</div>
                  </div>
                </div>
              </div>

              {/* Profile info */}
              <div className="bg-[#111] border border-[#222] p-6 space-y-5">
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-1">
                  Personal Info
                </h3>

                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none resize-none placeholder:text-[#444]"
                  />
                </div>

                {/* Stats from DB */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#222]">
                  <div>
                    <div className="text-lg font-black text-[#E8B931]">
                      {stats?.totalComics || 0}
                    </div>
                    <div className="text-[10px] text-[#555] tracking-widest uppercase">Comics</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-[#E8B931]">
                      {stats?.totalPages || 0}
                    </div>
                    <div className="text-[10px] text-[#555] tracking-widest uppercase">Pages</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-[#E8B931]">
                      {stats?.plan?.name || "Free"}
                    </div>
                    <div className="text-[10px] text-[#555] tracking-widest uppercase">Plan</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "appearance" && (
            <>
              <div className="bg-[#111] border border-[#222] p-6 space-y-5">
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-1">
                  Theme
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, theme: "dark" }
                    })}
                    className={`p-4 text-center ${
                      settings.appearance.theme === "dark"
                        ? "border-2 border-[#E8B931]"
                        : "border border-[#222] opacity-60"
                    }`}
                  >
                    <div className="w-full h-12 bg-[#0A0A0A] border border-[#222] mb-2 flex items-center justify-center">
                      <div className="w-4 h-4 bg-[#E8B931]" />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      settings.appearance.theme === "dark" ? "text-[#E8B931]" : "text-[#999]"
                    }`}>Dark</span>
                  </button>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, theme: "light" }
                    })}
                    className={`p-4 text-center border ${
                      settings.appearance.theme === "light"
                        ? "border-2 border-[#E8B931]"
                        : "border-[#222] opacity-40"
                    }`}
                  >
                    <div className="w-full h-12 bg-[#F5F5F0] border border-[#222] mb-2 flex items-center justify-center">
                      <div className="w-4 h-4 bg-[#333]" />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      settings.appearance.theme === "light" ? "text-[#E8B931]" : "text-[#999]"
                    }`}>Light</span>
                    <div className="text-[9px] text-[#555] mt-1">Coming Soon</div>
                  </button>
                </div>
              </div>

              <div className="bg-[#111] border border-[#222] p-6 space-y-5">
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-1">
                  Accent Color
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { color: "#E8B931", label: "Gold" },
                    { color: "#F5F5F0", label: "White" },
                    { color: "#C73E1D", label: "Red" },
                    { color: "#7B68EE", label: "Purple" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, accentColor: item.color }
                      })}
                      className={`p-3 border text-center ${
                        settings.appearance.accentColor === item.color
                          ? "border-[#E8B931]"
                          : "border-[#222]"
                      }`}
                    >
                      <div
                        className="w-6 h-6 mx-auto mb-2 border border-[#333]"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[10px] text-[#999] tracking-wider uppercase">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#111] border border-[#222] p-6 space-y-5">
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-1">
                  Interface
                </h3>
                <label className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#222]">
                  <span className="text-xs text-[#999]">Compact sidebar</span>
                  <input
                    type="checkbox"
                    checked={settings.appearance.compactSidebar}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, compactSidebar: e.target.checked }
                    })}
                    className="accent-[#E8B931]"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#222]">
                  <span className="text-xs text-[#999]">Show page thumbnails in list</span>
                  <input
                    type="checkbox"
                    checked={settings.appearance.showThumbnails}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, showThumbnails: e.target.checked }
                    })}
                    className="accent-[#E8B931]"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#222]">
                  <span className="text-xs text-[#999]">Reduce animations</span>
                  <input
                    type="checkbox"
                    checked={settings.appearance.reduceAnimations}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, reduceAnimations: e.target.checked }
                    })}
                    className="accent-[#E8B931]"
                  />
                </label>
              </div>
            </>
          )}

          {activeTab === "generation" && (
            <>
              <div className="bg-[#111] border border-[#222] p-6 space-y-5">
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-1">
                  Default Generation Settings
                </h3>

                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                    Default Art Style
                  </label>
                  <select
                    value={settings.generation.defaultStyle}
                    onChange={(e) => setSettings({
                      ...settings,
                      generation: { ...settings.generation, defaultStyle: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
                  >
                    <option value="noir-cyberpunk">Noir-Cyberpunk</option>
                    <option value="dark-fantasy">Dark Fantasy</option>
                    <option value="synthwave-pop">Synthwave Pop</option>
                    <option value="military-realism">Military Realism</option>
                    <option value="manga">Manga</option>
                    <option value="watercolor">Watercolor</option>
                    <option value="comic-book">Classic Comic Book</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                    Image Quality
                  </label>
                  <select
                    value={settings.generation.quality}
                    onChange={(e) => setSettings({
                      ...settings,
                      generation: { ...settings.generation, quality: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
                  >
                    <option value="high">High (300 DPI)</option>
                    <option value="medium">Medium (150 DPI)</option>
                    <option value="low">Low (72 DPI) — Faster</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                    Default Panel Layout
                  </label>
                  <select
                    value={settings.generation.panelLayout}
                    onChange={(e) => setSettings({
                      ...settings,
                      generation: { ...settings.generation, panelLayout: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
                  >
                    <option value="auto">Auto (AI Decides)</option>
                    <option value="3-panel">Standard 3-Panel</option>
                    <option value="6-panel">Grid 6-Panel</option>
                    <option value="splash">Splash Page</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                    Memory Retention
                  </label>
                  <select
                    value={settings.generation.memoryRetention}
                    onChange={(e) => setSettings({
                      ...settings,
                      generation: { ...settings.generation, memoryRetention: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] focus:border-[#E8B931] focus:outline-none appearance-none"
                  >
                    <option value="full">Full Memory (Slower, Most Consistent)</option>
                    <option value="balanced">Balanced (Recommended)</option>
                    <option value="compressed">Compressed (Faster, Less Context)</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#111] border border-[#222] p-6 space-y-5">
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-1">
                  Workflow
                </h3>
                <label className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#222]">
                  <div>
                    <span className="text-xs text-[#F5F5F0] block">Auto-approve pages</span>
                    <span className="text-[10px] text-[#555]">Skip review step and generate continuously</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.generation.autoApprove}
                    onChange={(e) => setSettings({
                      ...settings,
                      generation: { ...settings.generation, autoApprove: e.target.checked }
                    })}
                    className="accent-[#E8B931]"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#222]">
                  <div>
                    <span className="text-xs text-[#F5F5F0] block">Show generation progress</span>
                    <span className="text-[10px] text-[#555]">Display real-time progress bar during generation</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.generation.showProgress}
                    onChange={(e) => setSettings({
                      ...settings,
                      generation: { ...settings.generation, showProgress: e.target.checked }
                    })}
                    className="accent-[#E8B931]"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#222]">
                  <div>
                    <span className="text-xs text-[#F5F5F0] block">Smart panel suggestions</span>
                    <span className="text-[10px] text-[#555]">Get layout suggestions based on scene content</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.generation.smartSuggestions}
                    onChange={(e) => setSettings({
                      ...settings,
                      generation: { ...settings.generation, smartSuggestions: e.target.checked }
                    })}
                    className="accent-[#E8B931]"
                  />
                </label>
              </div>
            </>
          )}

          {activeTab === "notifications" && (
            <div className="bg-[#111] border border-[#222] p-6 space-y-5">
              <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-1">
                Notification Preferences
              </h3>

              {[
                {
                  key: "pageReady" as const,
                  label: "Page Ready",
                  desc: "Get notified when a new page is generated and ready for review",
                },
                {
                  key: "exportComplete" as const,
                  label: "Export Complete",
                  desc: "Notification when your comic export is ready to download",
                },
                {
                  key: "memoryWarning" as const,
                  label: "Memory Warnings",
                  desc: "Alert when memory compression runs or consistency drops below 90%",
                },
                {
                  key: "updates" as const,
                  label: "Product Updates",
                  desc: "New features, improvements, and announcements from Comicore",
                },
                {
                  key: "tips" as const,
                  label: "Tips & Tutorials",
                  desc: "Helpful tips for getting the most out of Comicore",
                },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#222]">
                  <div>
                    <span className="text-xs text-[#F5F5F0] block">{item.label}</span>
                    <span className="text-[10px] text-[#555]">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications[item.key]}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, [item.key]: e.target.checked }
                    })}
                    className="accent-[#E8B931]"
                  />
                </label>
              ))}

              <div className="border-t border-[#222] pt-4">
                <h4 className="text-xs text-[#E8B931] tracking-[0.15em] uppercase mb-3">Notification Method</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, method: "in-app" }
                    })}
                    className={`p-3 text-center ${
                      settings.notifications.method === "in-app"
                        ? "border-2 border-[#E8B931]"
                        : "border border-[#222]"
                    }`}
                  >
                    <Bell className={`w-4 h-4 mx-auto mb-1 ${
                      settings.notifications.method === "in-app" ? "text-[#E8B931]" : "text-[#555]"
                    }`} />
                    <span className={`text-[10px] tracking-wider uppercase ${
                      settings.notifications.method === "in-app" ? "text-[#E8B931]" : "text-[#555]"
                    }`}>In-App</span>
                  </button>
                  <button className="p-3 border border-[#222] text-center opacity-40">
                    <Bell className="w-4 h-4 text-[#555] mx-auto mb-1" />
                    <span className="text-[10px] text-[#555] tracking-wider uppercase">Email</span>
                    <div className="text-[9px] text-[#444] mt-1">Coming Soon</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <>
              <div className="bg-[#111] border border-[#222] p-6 space-y-5">
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-1">
                  Change Password
                </h3>

                {passwordError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
                    <Check className="w-3 h-3" />
                    Password changed successfully!
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] placeholder:text-[#444] focus:border-[#E8B931] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] placeholder:text-[#444] focus:border-[#E8B931] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#E8B931] tracking-[0.15em] uppercase block">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#222] text-sm text-[#F5F5F0] placeholder:text-[#444] focus:border-[#E8B931] focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !passwords.currentPassword || !passwords.newPassword}
                  className="px-5 py-3 border border-[#333] text-xs text-[#F5F5F0] tracking-wide uppercase disabled:opacity-50 flex items-center gap-2"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>

              <div className="bg-[#111] border border-[#222] p-6 space-y-5">
                <h3 className="text-xs font-bold text-[#E8B931] tracking-[0.2em] uppercase mb-1">
                  Plan & Usage
                </h3>
                <div className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-[#222]">
                  <div>
                    <div className="text-sm font-bold text-[#F5F5F0]">{stats?.plan?.name || "Free"} Plan</div>
                    <div className="text-xs text-[#666] mt-0.5">
                      {stats?.plan?.limits.comics === -1 ? "Unlimited" : stats?.plan?.limits.comics || 3} comics, {" "}
                      {stats?.plan?.limits.pages === -1 ? "unlimited" : stats?.plan?.limits.pages || 50} pages total
                    </div>
                  </div>
                  <button className="px-5 py-2.5 bg-[#E8B931] text-[#0A0A0A] font-bold text-xs tracking-wide uppercase">
                    Upgrade
                  </button>
                </div>
                {/* Usage */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#666]">Comics</span>
                      <span className="text-[#F5F5F0]">
                        {stats?.plan?.usage.comics || 0} / {stats?.plan?.limits.comics === -1 ? "∞" : stats?.plan?.limits.comics || 3}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#222]">
                      <div
                        className="h-full bg-[#E8B931]"
                        style={{
                          width: stats?.plan?.limits.comics === -1
                            ? "10%"
                            : `${Math.min(100, ((stats?.plan?.usage.comics || 0) / (stats?.plan?.limits.comics || 3)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#666]">Pages</span>
                      <span className="text-[#F5F5F0]">
                        {stats?.plan?.usage.pages || 0} / {stats?.plan?.limits.pages === -1 ? "∞" : stats?.plan?.limits.pages || 50}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#222]">
                      <div
                        className="h-full bg-[#E8B931]"
                        style={{
                          width: stats?.plan?.limits.pages === -1
                            ? "10%"
                            : `${Math.min(100, ((stats?.plan?.usage.pages || 0) / (stats?.plan?.limits.pages || 50)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#111] border border-[#222] p-6 space-y-4">
                <h3 className="text-xs font-bold text-[#C73E1D] tracking-[0.2em] uppercase mb-1">
                  Danger Zone
                </h3>
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#C73E1D]/30">
                  <div>
                    <span className="text-xs text-[#F5F5F0]">Delete all comics</span>
                    <span className="text-[10px] text-[#555] block">This action cannot be undone</span>
                  </div>
                  <button className="px-4 py-2 border border-[#C73E1D] text-[#C73E1D] text-xs tracking-wide uppercase flex items-center gap-1">
                    <Trash2 className="w-3 h-3" />
                    Delete All
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#C73E1D]/30">
                  <div>
                    <span className="text-xs text-[#F5F5F0]">Delete account</span>
                    <span className="text-[10px] text-[#555] block">Permanently remove your account and all data</span>
                  </div>
                  <button className="px-4 py-2 border border-[#C73E1D] text-[#C73E1D] text-xs tracking-wide uppercase flex items-center gap-1">
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
