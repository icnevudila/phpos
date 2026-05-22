import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Key, 
  Smartphone, 
  SmartphoneIcon,
  Monitor, 
  Trash2, 
  Plus, 
  Copy, 
  Check, 
  Info,
  Clock,
  Globe,
  Loader2
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  createdAt: string;
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export function SecuritySettingsPanel(): JSX.Element {
  const { t } = useTranslation();
  
  // 1. Two-Factor Authentication (2FA) State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAVerification, setShow2FAVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [totpSecret] = useState("JBSWY3DPEHPK3PXP"); // Mock Secret
  const [verifying2FA, setVerifying2FA] = useState(false);

  // 2. Active Sessions State
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: "sess-1",
      device: "Chrome / Windows 11",
      location: "Manila, Philippines",
      ip: "121.54.32.99",
      lastActive: "Active Now",
      isCurrent: true,
    },
    {
      id: "sess-2",
      device: "Safari / macOS Sonoma",
      location: "Quezon City, Philippines",
      ip: "112.204.15.22",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
    {
      id: "sess-3",
      device: "DentEase App / iOS 17",
      location: "Pasig, Philippines",
      ip: "49.145.88.104",
      lastActive: "1 day ago",
      isCurrent: false,
    },
  ]);

  // 3. API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "key-1",
      name: "HMO Auto-Claims Sync",
      keyPrefix: "de_live_a4f9...",
      scopes: ["claims.read", "claims.write"],
      createdAt: "May 10, 2026",
    },
    {
      id: "key-2",
      name: "Queue Display Board API",
      keyPrefix: "de_live_9b0e...",
      scopes: ["queue.read"],
      createdAt: "May 14, 2026",
    },
  ]);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyScopes, setKeyScopes] = useState<string[]>([]);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // 2FA Actions
  function handle2FAToggle(): void {
    if (is2FAEnabled) {
      // Disabling 2FA
      setIs2FAEnabled(false);
      toast.success("Two-Factor Authentication has been disabled.");
    } else {
      // Initiating Enablement
      setShow2FAVerification(true);
    }
  }

  function verifyAndActivate2FA(): void {
    if (verificationCode.length !== 6 || isNaN(Number(verificationCode))) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    setVerifying2FA(true);
    setTimeout(() => {
      setVerifying2FA(false);
      setIs2FAEnabled(true);
      setShow2FAVerification(false);
      setVerificationCode("");
      toast.success("Two-Factor Authentication is now active!");
    }, 1200);
  }

  // Session Actions
  function revokeSession(id: string): void {
    setSessions((prev) => prev.filter((sess) => sess.id !== id));
    toast.success("Session successfully terminated.");
  }

  function revokeAllOtherSessions(): void {
    setSessions((prev) => prev.filter((sess) => sess.isCurrent));
    toast.success("All other active sessions have been signed out.");
  }

  // API Key Actions
  const toggleScope = (scope: string) => {
    if (keyScopes.includes(scope)) {
      setKeyScopes(keyScopes.filter((s) => s !== scope));
    } else {
      setKeyScopes([...keyScopes, scope]);
    }
  };

  function generateApiKey(): void {
    if (!keyName.trim()) {
      toast.error("Please enter a label for this API key.");
      return;
    }
    if (keyScopes.length === 0) {
      toast.error("Select at least one permission scope.");
      return;
    }

    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const generated = `de_live_${randomHex}`;
    
    setNewlyGeneratedKey(generated);
    setApiKeys((prev) => [
      ...prev,
      {
        id: `key-${Date.now()}`,
        name: keyName,
        keyPrefix: `${generated.slice(0, 11)}...`,
        scopes: keyScopes,
        createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
    ]);
    toast.success("API key successfully generated.");
  }

  function copyToClipboard(text: string): void {
    void navigator.clipboard.writeText(text);
    setCopiedKey(true);
    toast.success("Copied to clipboard.");
    setTimeout(() => setCopiedKey(false), 2000);
  }

  function closeKeyModal(): void {
    setShowKeyModal(false);
    setKeyName("");
    setKeyScopes([]);
    setNewlyGeneratedKey(null);
  }

  function revokeApiKey(id: string): void {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    toast.success("API Key successfully revoked.");
  }

  return (
    <div className="space-y-12">
      {/* 2FA Panel */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[3rem] bg-white p-8 lg:p-10 shadow-xl ring-1 ring-slate-100"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-50 pb-8 mb-8">
          <div className="flex gap-4 items-center">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Smartphone size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Two-Factor Authentication (2FA)</h2>
              <p className="text-sm text-slate-500 mt-0.5">Secure your administrator account with a time-based verification code.</p>
            </div>
          </div>
          <button
            onClick={handle2FAToggle}
            className={`h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${ is2FAEnabled ? "bg-rose-50 text-rose-700 hover:bg-rose-100 " : "bg-teal-600 text-white hover:bg-teal-500 shadow-lg shadow-teal-500/10" }`}
          >
            {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {show2FAVerification ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 overflow-hidden bg-slate-50 p-6 rounded-2xl border border-slate-100"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* QR Code Container */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col items-center shrink-0">
                  {/* High Quality Custom SVG QR Representation */}
                  <svg className="w-36 h-36" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                    <rect x="9" y="9" width="17" height="17" fill="white" />
                    <rect x="13" y="13" width="9" height="9" fill="#0f172a" />

                    <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                    <rect x="74" y="9" width="17" height="17" fill="white" />
                    <rect x="78" y="13" width="9" height="9" fill="#0f172a" />

                    <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                    <rect x="9" y="74" width="17" height="17" fill="white" />
                    <rect x="13" y="78" width="9" height="9" fill="#0f172a" />

                    <rect x="40" y="10" width="10" height="5" />
                    <rect x="50" y="20" width="5" height="15" />
                    <rect x="45" y="45" width="20" height="10" />
                    <rect x="80" y="45" width="15" height="15" />
                    <rect x="40" y="75" width="25" height="5" />
                    <rect x="75" y="75" width="20" height="20" />
                    <rect x="10" y="40" width="10" height="10" />
                  </svg>
                  <span className="text-[10px] font-mono text-slate-400 mt-2 font-bold">{totpSecret}</span>
                </div>

                <div className="flex-1 space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Set up Authenticator App</h3>
                  <p className="text-xs text-slate-450 leading-relaxed">
                    1. Open Google Authenticator, Duo, or Microsoft Authenticator on your mobile device.<br />
                    2. Scan the QR code or manually enter the key secret code above.<br />
                    3. Input the 6-digit confirmation token code generated by your app below.
                  </p>
                  
                  <div className="flex gap-4 items-center pt-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000 000"
                      className="h-14 w-40 rounded-xl border border-slate-200 bg-white px-4 text-center text-lg font-black tracking-[0.25em] outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={verifyAndActivate2FA}
                      disabled={verificationCode.length !== 6 || verifying2FA}
                      className="h-14 px-8 rounded-xl bg-white text-white text-xs font-black uppercase tracking-widest hover:scale-102 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {verifying2FA ? <Loader2 className="animate-spin" size={16} /> : "Verify & Activate"}
                    </button>
                    <button
                      onClick={() => setShow2FAVerification(false)}
                      className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 px-4"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex gap-4 items-start bg-slate-50/50 p-6 rounded-2xl">
              <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div className="text-xs font-medium text-slate-550 leading-relaxed">
                {is2FAEnabled ? (
                  <span className="text-teal-500 font-bold">Two-Factor Authentication is currently ACTIVE.</span>
                ) : (
                  "2FA is currently inactive. Enabling 2FA adds an extra layer of defense to keep unauthorized accounts from logging in to your clinic system dashboard."
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Active Sessions Panel */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[3rem] bg-white p-8 lg:p-10 shadow-xl ring-1 ring-slate-100"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-50 pb-8 mb-8">
          <div className="flex gap-4 items-center">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Monitor size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Login Sessions</h2>
              <p className="text-sm text-slate-500 mt-0.5">View and manage all active browser and application instances logged in to your account.</p>
            </div>
          </div>
          {sessions.length > 1 && (
            <button
              onClick={revokeAllOtherSessions}
              className="h-12 px-6 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-black uppercase tracking-widest transition-all"
            >
              Sign out of all other sessions
            </button>
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {sessions.map((sess) => (
              <motion.div
                key={sess.id}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, x: -100 }}
                className={`flex justify-between items-center p-6 rounded-2xl border transition-all ${ sess.isCurrent ? "bg-slate-50/50 border-slate-150 " : "bg-white border-slate-100 hover:border-slate-200 " }`}
              >
                <div className="flex gap-4 items-center">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${ sess.device.includes("iOS") || sess.device.includes("Android") ? "bg-sky-50 text-sky-500" : "bg-slate-100 text-slate-500" }`}>
                    {sess.device.includes("iOS") || sess.device.includes("Android") ? <SmartphoneIcon size={20} /> : <Monitor size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{sess.device}</span>
                      {sess.isCurrent && (
                        <span className="px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-teal-500 text-white rounded-full">
                          This Device
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-semibold">
                      <span className="flex items-center gap-1"><Globe size={12} /> {sess.ip}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      <span>{sess.location}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      <span className="flex items-center gap-1"><Clock size={12} /> {sess.lastActive}</span>
                    </div>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    onClick={() => revokeSession(sess.id)}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Terminate Session"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* API Keys Panel */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[3rem] bg-white p-8 lg:p-10 shadow-xl ring-1 ring-slate-100"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-50 pb-8 mb-8">
          <div className="flex gap-4 items-center">
            <div className="h-14 w-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Key size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">API Access Tokens & Integration Keys</h2>
              <p className="text-sm text-slate-500 mt-0.5">Create external credentials to connect custom patient queues, HMO sync scripts, or external reporting tools.</p>
            </div>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="h-12 px-6 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
          >
            <Plus size={16} /> Generate API Key
          </button>
        </div>

        {apiKeys.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Key className="mx-auto h-12 w-12 text-slate-350 opacity-40 mb-3" />
            <p className="text-sm font-semibold">No active API keys generated yet.</p>
            <p className="text-xs text-slate-450 mt-1">Create one to start integrating other custom patient modules.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Label</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">API Token ID</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Scopes</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Created At</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((k) => (
                  <tr key={k.id} className="border-b border-slate-50 last:border-none group">
                    <td className="py-5 px-4">
                      <span className="text-sm font-bold text-slate-900">{k.name}</span>
                    </td>
                    <td className="py-5 px-4">
                      <code className="text-xs font-mono bg-slate-50 px-2.5 py-1 rounded-md text-teal-600 border border-slate-100">
                        {k.keyPrefix}
                      </code>
                    </td>
                    <td className="py-5 px-4 flex flex-wrap gap-1.5">
                      {k.scopes.map((scope) => (
                        <span key={scope} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-600">
                          {scope}
                        </span>
                      ))}
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-xs font-semibold text-slate-400">{k.createdAt}</span>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <button
                        onClick={() => revokeApiKey(k.id)}
                        className="h-9 px-4 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-400 text-[10px] font-black uppercase tracking-widest transition-colors"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.section>

      {/* API Key Generation Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#f5f7f9]/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[3rem] max-w-xl w-full p-8 shadow-2xl relative overflow-hidden border border-slate-100"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-teal-500/5 blur-3xl" />
              
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">
                {newlyGeneratedKey ? "API Key Generated Successfully" : "Generate Integration API Key"}
              </h3>

              {!newlyGeneratedKey ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-4">API Token Description</label>
                    <input
                      type="text"
                      placeholder="e.g. HealthMetrics HMO Claims System"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      className="h-14 w-full rounded-2xl bg-slate-50 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-4">Select Permission Scopes</label>
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-6 rounded-2xl">
                      {[
                        { scope: "patients.read", label: "Read Patient Records" },
                        { scope: "patients.write", label: "Create/Modify Patients" },
                        { scope: "claims.read", label: "Read HMO Claims" },
                        { scope: "claims.write", label: "Submit HMO Claims" },
                        { scope: "queue.read", label: "Read Queue Display State" },
                        { scope: "queue.write", label: "Modify Queue Entries" },
                      ].map((item) => (
                        <label key={item.scope} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={keyScopes.includes(item.scope)}
                            onChange={() => toggleScope(item.scope)}
                            className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                          />
                          <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end pt-4 border-t border-slate-50">
                    <button
                      onClick={closeKeyModal}
                      className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 px-4"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={generateApiKey}
                      className="h-14 px-8 rounded-2xl bg-white text-white text-xs font-black uppercase tracking-widest hover:scale-102 transition-all shadow-lg"
                    >
                      Generate Key
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex gap-3 bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-850 text-xs leading-relaxed font-semibold">
                    <Info size={18} className="shrink-0 text-amber-500" />
                    <span>Make sure to copy your API key token now. For security purposes, you will not be able to view this token again.</span>
                  </div>

                  <div className="relative">
                    <input
                      readOnly
                      value={newlyGeneratedKey}
                      className="h-16 w-full rounded-2xl bg-slate-50 font-mono text-xs text-teal-600 border border-slate-100 pl-6 pr-24 outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(newlyGeneratedKey)}
                      className="absolute right-2 top-2 h-12 px-5 rounded-xl bg-white text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-50">
                    <button
                      onClick={closeKeyModal}
                      className="h-14 px-8 rounded-2xl bg-white text-white text-xs font-black uppercase tracking-widest hover:scale-102 transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
