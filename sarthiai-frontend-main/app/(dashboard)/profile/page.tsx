"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import { ApiError, deleteAccount, fetchIntegrations, updateProfile } from "@/lib/api";
import { Button, Card, Input, Textarea } from "@/components/ui";

export default function ProfilePage(): React.ReactElement {
  const { user, refreshUser, logout } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [integration, setIntegration] = useState<unknown>(null);

  useEffect(() => {
    if (user?.profile) {
      setDisplayName(user.profile.displayName);
      setBio(user.profile.bio);
    }
  }, [user]);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetchIntegrations();
        setIntegration(r.integration);
      } catch {
        /* optional */
      }
    })();
  }, []);

  async function onSaveProfile(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    try {
      await updateProfile({ displayName, bio });
      await refreshUser();
      setMsg("Profile updated");
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed");
    }
  }

  async function onDeleteAccount(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!confirm("Permanently delete your account?")) return;
    try {
      await deleteAccount(password);
      await logout();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed to delete");
    }
  }

  const integ = integration as { nutrition?: { provider: string; apiConfigured: boolean } } | null;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Profile</h1>
        <p className="text-sm text-muted">{user?.email}</p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-ink">Integration status</h2>
        <p className="mt-2 text-sm text-muted">
          Provider: <span className="text-ink">{integ?.nutrition?.provider ?? "—"}</span>
        </p>
        <p className="text-sm text-muted">
          API configured: {integ?.nutrition?.apiConfigured ? "Yes" : "No"}
        </p>
      </Card>

      <Card>
        <form onSubmit={(e) => void onSaveProfile(e)} className="space-y-4">
          <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Textarea label="Bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
          {msg && <p className="text-sm text-accent">{msg}</p>}
          {err && <p className="text-sm text-red-700">{err}</p>}
          <Button type="submit">Save profile</Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-red-800">Danger zone</h2>
        <form onSubmit={(e) => void onDeleteAccount(e)} className="mt-4 space-y-3">
          <Input
            label="Confirm password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="danger">
            Delete account
          </Button>
        </form>
      </Card>
    </div>
  );
}
