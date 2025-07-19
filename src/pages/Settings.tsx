import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  createContext,
  ReactNode,
  ChangeEvent,
  FormEvent,
} from "react";
import { Toaster } from "@/components/ui/toaster"; // Adjust if using a different toast lib
import { Dialog } from "@headlessui/react"; // For modals
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// --- Types (move to types/settings.ts if desired) ---
export interface ProfileSettings {
  avatar: string | null;
  fullName: string;
  email: string;
  username: string;
}

export interface PreferencesSettings {
  theme: "light" | "dark";
  language: "en" | "es" | "fr";
  timezone: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  autoSave: boolean;
}

export interface PrivacySettings {
  analytics: boolean;
  marketingEmails: boolean;
  connectedAccounts: string[];
}

export interface NotificationSettings {
  email: {
    product: boolean;
    security: boolean;
    marketing: boolean;
  };
  push: boolean;
  frequency: "immediate" | "daily" | "weekly";
  quietHours: { start: string; end: string };
}

export interface SettingsState {
  profile: ProfileSettings;
  preferences: PreferencesSettings;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
}

// --- Context ---
const defaultSettings: SettingsState = {
  profile: {
    avatar: null,
    fullName: "",
    email: "",
    username: "",
  },
  preferences: {
    theme: "light",
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: "MM/DD/YYYY",
    autoSave: false,
  },
  privacy: {
    analytics: false,
    marketingEmails: false,
    connectedAccounts: [],
  },
  notifications: {
    email: {
      product: true,
      security: true,
      marketing: false,
    },
    push: false,
    frequency: "immediate",
    quietHours: { start: "22:00", end: "07:00" },
  },
};

interface SettingsContextProps {
  settings: SettingsState;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
  saveSettings: () => Promise<void>;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextProps | undefined>(
  undefined
);

// --- Utility: localStorage ---
function loadSettingsFromStorage(): SettingsState {
  try {
    const raw = localStorage.getItem("settings");
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultSettings;
}
function saveSettingsToStorage(settings: SettingsState) {
  try {
    localStorage.setItem("settings", JSON.stringify(settings));
  } catch {}
}

// --- Custom Hooks ---
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
export function useTheme() {
  const { settings, setSettings } = useSettings();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.preferences.theme === "dark");
  }, [settings.preferences.theme]);
  const toggleTheme = () =>
    setSettings((s) => ({
      ...s,
      preferences: {
        ...s.preferences,
        theme: s.preferences.theme === "dark" ? "light" : "dark",
      },
    }));
  return [settings.preferences.theme, toggleTheme] as const;
}

// --- Provider ---
function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(loadSettingsFromStorage);
  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);
  const saveSettings = async () => {
    // TODO: Connect to Supabase/user preferences table
    saveSettingsToStorage(settings);
    // Toaster({ title: "Settings saved!", duration: 2000 });
    return Promise.resolve();
  };
  const resetSettings = () => setSettings(loadSettingsFromStorage());
  return (
    <SettingsContext.Provider value={{ settings, setSettings, saveSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

// --- Tab Components ---
function AccountTab() {
  const { settings, setSettings, saveSettings } = useSettings();
  const [form, setForm] = useState(settings.profile);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);

  useEffect(() => {
    setForm(settings.profile);
    setPasswords({ current: "", new: "", confirm: "" });
    setUnsaved(false);
  }, [settings.profile]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setUnsaved(true);
  }
  function handlePasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setUnsaved(true);
  }
  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    // TODO: Implement avatar upload
    setUnsaved(true);
  }
  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO: Connect to Supabase auth for profile updates
    // TODO: Implement password change API call
    setSettings((s) => ({ ...s, profile: form }));
    await saveSettings();
    setSaving(false);
    setUnsaved(false);
  }
  function handleCancel() {
    setForm(settings.profile);
    setPasswords({ current: "", new: "", confirm: "" });
    setUnsaved(false);
  }
  function handleDeleteAccount() {
    setShowDeleteModal(false);
    // TODO: Implement account deletion API call
    // toast({ title: "Account deletion requested", description: "This is a mock action.", duration: 3000 });
  }

  return (
    <form className="space-y-8 text-gray-900 dark:text-gray-100" onSubmit={handleSave}>
      {/* Profile Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Profile</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <img
              src={form.avatar || "/avatar-placeholder.png"}
              alt="Avatar"
              className="h-16 w-16 rounded-full object-cover border"
            />
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Upload avatar"
              onChange={handleAvatarChange}
              disabled
            />
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Avatar upload coming soon</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm">Full Name</span>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-primary/30"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-primary/30"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm">Username</span>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-primary/30"
              required
            />
          </label>
        </div>
      </div>
      {/* Password Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm">Current Password</span>
            <input
              type="password"
              name="current"
              value={passwords.current}
              onChange={handlePasswordChange}
              className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-primary/30"
              autoComplete="current-password"
              disabled
            />
          </label>
          <label className="block">
            <span className="text-sm">New Password</span>
            <input
              type="password"
              name="new"
              value={passwords.new}
              onChange={handlePasswordChange}
              className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-primary/30"
              autoComplete="new-password"
              disabled
            />
          </label>
          <label className="block">
            <span className="text-sm">Confirm Password</span>
            <input
              type="password"
              name="confirm"
              value={passwords.confirm}
              onChange={handlePasswordChange}
              className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-primary/30"
              autoComplete="new-password"
              disabled
            />
          </label>
        </div>
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            className="mr-2"
            checked={false}
            disabled
            aria-label="Enable two-factor authentication"
          />
          <span className="text-sm text-gray-500">Two-factor authentication (coming soon)</span>
        </div>
      </div>
      {/* Account Deletion */}
      <div className="border-t pt-6 mt-6">
        <h2 className="text-xl font-semibold mb-2 text-red-600">Delete Account</h2>
        <p className="text-sm text-red-500 mb-2">
          Warning: This action is irreversible. Your account and all data will be permanently deleted.
        </p>
        <button
          type="button"
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </button>
      </div>
      {/* Save/Cancel */}
      <div className="flex gap-2 mt-6">
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition disabled:opacity-50"
          disabled={saving || !unsaved}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          onClick={handleCancel}
          disabled={saving || !unsaved}
        >
          Cancel
        </button>
      </div>
      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm mx-auto shadow-lg z-10">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-center mb-2">Confirm Account Deletion</h3>
          <p className="text-center text-gray-600 mb-4">
            Are you sure you want to delete your account? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              onClick={handleDeleteAccount}
            >
              Yes, Delete
            </button>
            <button
              className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog>
    </form>
  );
}

function PreferencesTab() {
  const { settings, setSettings, saveSettings } = useSettings();
  const [form, setForm] = useState(settings.preferences);
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);

  useEffect(() => {
    setForm(settings.preferences);
    setUnsaved(false);
  }, [settings.preferences]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    const checked = type === "checkbox" && "checked" in target ? (target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setUnsaved(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSettings((s) => ({ ...s, preferences: form }));
    await saveSettings();
    setSaving(false);
    setUnsaved(false);
  }
  function handleCancel() {
    setForm(settings.preferences);
    setUnsaved(false);
  }

  // Theme toggle
  const [theme, toggleTheme] = useTheme();

  return (
    <form className="space-y-8 text-gray-900 dark:text-gray-100" onSubmit={handleSave}>
      <div>
        <h2 className="text-xl font-semibold mb-2">Theme</h2>
        <button
          type="button"
          className="px-4 py-2 rounded border bg-gray-100 dark:bg-gray-800"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Language</h2>
        <select
          name="language"
          value={form.language}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-primary/30"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Timezone</h2>
        <select
          name="timezone"
          value={form.timezone}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-primary/30"
        >
          {/* Replace with a static list of common timezones */}
          {[
            "UTC",
            "Europe/London",
            "Europe/Paris",
            "Europe/Madrid",
            "America/New_York",
            "America/Los_Angeles",
            "Asia/Tokyo",
            "Asia/Hong_Kong",
            "Australia/Sydney",
            form.timezone, // Ensure current value is always present
          ]
            .filter((tz, idx, arr) => arr.indexOf(tz) === idx) // Remove duplicates
            .map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
        </select>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Date Format</h2>
        <div className="flex gap-4">
          {["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map((fmt) => (
            <label key={fmt} className="flex items-center gap-1">
              <input
                type="radio"
                name="dateFormat"
                value={fmt}
                checked={form.dateFormat === fmt}
                onChange={handleChange}
                className="accent-primary"
              />
              <span>{fmt}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Auto-save</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="autoSave"
            checked={form.autoSave}
            onChange={handleChange}
            className="accent-primary"
          />
          <span>Enable auto-save for application data</span>
        </label>
      </div>
      <div className="flex gap-2 mt-6">
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition disabled:opacity-50"
          disabled={saving || !unsaved}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          onClick={handleCancel}
          disabled={saving || !unsaved}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function PrivacyTab() {
  // UI only, non-functional
  return (
    <div className="space-y-8 text-gray-900 dark:text-gray-100">
      <div>
        <h2 className="text-xl font-semibold mb-2">Login Activity</h2>
        <table className="w-full text-sm border rounded overflow-hidden">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 text-left">Device</th>
              <th className="p-2 text-left">Location</th>
              <th className="p-2 text-left">Last Active</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">Chrome on Windows</td>
              <td className="p-2">London, UK</td>
              <td className="p-2">2024-07-18 22:10</td>
              <td className="p-2">Active</td>
            </tr>
            <tr>
              <td className="p-2">Safari on iPhone</td>
              <td className="p-2">Madrid, ES</td>
              <td className="p-2">2024-07-17 09:30</td>
              <td className="p-2">Signed out</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Data Export</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition" disabled>
            Download Data
          </button>
          <button className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition" disabled>
            Request Account Data
          </button>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Privacy Settings</h2>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-primary" disabled />
          <span>Allow analytics tracking</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-primary" disabled />
          <span>Receive marketing emails</span>
        </label>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Connected Accounts</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded" disabled>
            Connect Google
          </button>
          <button className="px-4 py-2 border rounded" disabled>
            Connect Facebook
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const { settings, setSettings, saveSettings } = useSettings();
  const [form, setForm] = useState(settings.notifications);
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);

  useEffect(() => {
    setForm(settings.notifications);
    setUnsaved(false);
  }, [settings.notifications]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    const checked = type === "checkbox" && "checked" in target ? (target as HTMLInputElement).checked : undefined;
    if (name.startsWith("email.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        email: { ...prev.email, [key]: type === "checkbox" ? checked : value },
      }));
    } else if (name.startsWith("quietHours.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        quietHours: { ...prev.quietHours, [key]: value },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
    setUnsaved(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSettings((s) => ({ ...s, notifications: form }));
    await saveSettings();
    setSaving(false);
    setUnsaved(false);
  }
  function handleCancel() {
    setForm(settings.notifications);
    setUnsaved(false);
  }

  return (
    <form className="space-y-8 text-gray-900 dark:text-gray-100" onSubmit={handleSave}>
      <div>
        <h2 className="text-xl font-semibold mb-2">Email Notifications</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="email.product"
            checked={form.email.product}
            onChange={handleChange}
            className="accent-primary"
          />
          <span>Product updates</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="email.security"
            checked={form.email.security}
            onChange={handleChange}
            className="accent-primary"
          />
          <span>Security alerts</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="email.marketing"
            checked={form.email.marketing}
            onChange={handleChange}
            className="accent-primary"
          />
          <span>Marketing emails</span>
        </label>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Push Notifications</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="push"
            checked={form.push}
            onChange={handleChange}
            className="accent-primary"
          />
          <span>Enable push notifications</span>
        </label>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Notification Frequency</h2>
        <select
          name="frequency"
          value={form.frequency}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-primary/30"
        >
          <option value="immediate">Immediate</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Quiet Hours</h2>
        <div className="flex gap-2">
          <label className="flex items-center gap-1">
            <span>Start</span>
            <input
              type="time"
              name="quietHours.start"
              value={form.quietHours.start}
              onChange={handleChange}
              className="rounded border px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-1">
            <span>End</span>
            <input
              type="time"
              name="quietHours.end"
              value={form.quietHours.end}
              onChange={handleChange}
              className="rounded border px-2 py-1"
            />
          </label>
        </div>
      </div>
      <div className="flex gap-2 mt-6">
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition disabled:opacity-50"
          disabled={saving || !unsaved}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          onClick={handleCancel}
          disabled={saving || !unsaved}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// --- Main Settings Page ---
const TABS = [
  { key: "account", label: "Account" },
  { key: "preferences", label: "Preferences" },
  { key: "privacy", label: "Privacy & Security" },
  { key: "notifications", label: "Notifications" },
] as const;

type TabKey = typeof TABS[number]["key"];

function Settings() {
  const [tab, setTab] = useState<TabKey>("account");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keyboard navigation for tabs
  function handleTabKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === "ArrowRight") {
      tabRefs.current[(idx + 1) % TABS.length]?.focus();
    } else if (e.key === "ArrowLeft") {
      tabRefs.current[(idx - 1 + TABS.length) % TABS.length]?.focus();
    }
  }

  return (
    <SettingsProvider>
      {/* Add pt-24 to create space below Navigation */}
      <div className="flex flex-col md:flex-row max-w-5xl mx-auto bg-white/80 dark:bg-gray-900/60 rounded-lg shadow mt-10 mb-10 overflow-hidden min-h-[70vh] text-gray-900 dark:text-gray-100 pt-24">
        {/* Sidebar */}
        <nav className="md:w-56 border-b md:border-b-0 md:border-r bg-gray-50 dark:bg-gray-800 flex md:flex-col flex-row text-gray-900 dark:text-gray-100">
          {TABS.map((t, i) => (
            <button
              key={t.key}
              ref={(el) => (tabRefs.current[i] = el)}
              className={`w-full px-4 py-3 text-left focus:outline-none focus:bg-primary/10 focus:text-primary transition
                ${tab === t.key ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5"}
              `}
              aria-selected={tab === t.key}
              aria-controls={`settings-panel-${t.key}`}
              tabIndex={tab === t.key ? 0 : -1}
              onClick={() => setTab(t.key)}
              onKeyDown={(e) => handleTabKeyDown(e, i)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        {/* Tab Panels */}
        <main className="flex-1 p-6">
          <div
            id={`settings-panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`settings-tab-${tab}`}
            className="animate-fade-in"
          >
            {tab === "account" && <AccountTab />}
            {tab === "preferences" && <PreferencesTab />}
            {tab === "privacy" && <PrivacyTab />}
            {tab === "notifications" && <NotificationsTab />}
          </div>
        </main>
      </div>
    </SettingsProvider>
  );
}

export default Settings;