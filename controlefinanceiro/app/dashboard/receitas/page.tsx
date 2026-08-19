"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { MESES } from "@/lib/meses";
import { formatDateBR, parseLocalDate } from "@/lib/dates";

type Transacao = {
  id: string;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  recorrencia: string;
  is_paid: boolean;
  data_vencimento: string;
  data_pagamento: string | null;
};

const RECORRENCIAS = ["unica", "mensal", "semanal", "anual"];
const RECORRENCIA_LABELS: Record<string, string> = {
  unica: "Única",
  mensal: "Mensal",
  semanal: "Semanal",
  anual: "Anual",
};

const emptyForm = {
  descricao: "",
  valor: "",
  recorrencia: "unica",
  data_vencimento: new Date().toISOString().slice(0, 10),
  is_paid: false,
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const [mes, setMes] = useState(now.getMonth());
  const [ano, setAno] = useState(now.getFullYear());

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/transacoes");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const todas: Transacao[] = data.transacoes ?? [];
      setReceitas(todas.filter((t) => t.tipo === "receita"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar receitas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const anosDisponiveis = useMemo(() => {
    const anos = new Set(receitas.map((r) => new Date(r.data_vencimento).getFullYear()));
    anos.add(new Date().getFullYear());
    return Array.from(anos).sort((a, b) => b - a);
  }, [receitas]);

  const receitasDoMes = useMemo(
    () =>
      receitas.filter((r) => {
        const d = parseLocalDate(r.data_vencimento);
        return d.getMonth() === mes && d.getFullYear() === ano;
      }),
    [receitas, mes, ano]
  );

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(t: Transacao) {
    setEditingId(t.id);
    setForm({
      descricao: t.descricao,
      valor: String(t.valor),
      recorrencia: t.recorrencia,
      data_vencimento: t.data_vencimento.slice(0, 10),
      is_paid: t.is_paid,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        descricao: form.descricao,
        valor: Number(form.valor),
        tipo: "receita",
        recorrencia: form.recorrencia,
        is_paid: form.is_paid,
        data_vencimento: form.data_vencimento,
        data_pagamento: form.is_paid ? new Date().toISOString().slice(0, 10) : null,
      };
      const res = await apiFetch(
        editingId ? `/api/transacoes/${editingId}` : "/api/transacoes",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar receita");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta receita?")) return;
    setError("");
    try {
      const res = await apiFetch(`/api/transacoes/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir receita");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Receitas</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Seus lançamentos de entrada
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {MESES.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {anosDisponiveis.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nova receita
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {editingId ? "Editar receita" : "Nova receita"}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Descrição
              </label>
              <input
                required
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Ex: Salário, Freelance"
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Valor
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Recorrência
              </label>
              <select
                value={form.recorrencia}
                onChange={(e) => setForm({ ...form, recorrencia: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                {RECORRENCIAS.map((r) => (
                  <option key={r} value={r}>{RECORRENCIA_LABELS[r]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Data de vencimento
              </label>
              <input
                required
                type="date"
                value={form.data_vencimento}
                onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="is_paid"
                type="checkbox"
                checked={form.is_paid}
                onChange={(e) => setForm({ ...form, is_paid: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600"
              />
              <label htmlFor="is_paid" className="text-sm text-zinc-700 dark:text-zinc-300">
                Já recebido
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Carregando…</p>
      ) : receitasDoMes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma receita em {MESES[mes]}/{ano}.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3 font-medium">Descrição</th>
                <th className="px-5 py-3 font-medium">Vencimento</th>
                <th className="px-5 py-3 font-medium">Recorrência</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Valor</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-900 dark:bg-zinc-950">
              {receitasDoMes.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {r.descricao}
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    {formatDateBR(r.data_vencimento)}
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                    {RECORRENCIA_LABELS[r.recorrencia] || r.recorrencia}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.is_paid
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      }`}
                    >
                      {r.is_paid ? "Recebido" : "Em aberto"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(Number(r.valor))}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => openEdit(r)}
                      className="mr-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
