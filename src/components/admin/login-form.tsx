"use client";

import { useActionState } from "react";
import { loginAdmin, type AdminAuthState } from "@/actions/admin";
import { Button, Card, Input, Label } from "@/components/ui";

const initial: AdminAuthState | null = null;

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(loginAdmin, initial);

  return (
    <Card className="mx-auto max-w-sm">
      <h1 className="text-xl font-bold tracking-tight">Admin</h1>
      <p className="mt-1 text-sm text-muted">
        Local moderation. Password is <code className="text-foreground">ADMIN_SECRET</code> from
        your env.
      </p>
      <form action={formAction} className="mt-4 grid gap-3">
        <input type="hidden" name="next" value={nextPath} />
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
        {state && !state.ok && (
          <p className="text-sm text-red-400" data-testid="admin-login-error">
            {state.message}
          </p>
        )}
      </form>
    </Card>
  );
}
