import { useEffect, useState } from "react";
import { db } from "@/lib/storage";

export default function DebugDBPage() {
  const [profile, setProfile] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      setProfile(await db.profile.toArray());
      setClients(await db.clients.toArray());
      setBudgets(await db.budgets.toArray());
      setCatalog(await db.catalog.toArray());
    }
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>DEBUG DB</h1>

      <h2>Profile</h2>
      <pre>{JSON.stringify(profile, null, 2)}</pre>

      <h2>Clients</h2>
      <pre>{JSON.stringify(clients, null, 2)}</pre>

      <h2>Budgets</h2>
      <pre>{JSON.stringify(budgets, null, 2)}</pre>

      <h2>Catalog</h2>
      <pre>{JSON.stringify(catalog, null, 2)}</pre>
    </div>
  );
}