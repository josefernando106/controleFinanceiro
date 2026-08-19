"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { MESES } from "@/lib/meses";
import { addMonthsClamped, formatDateBR, parseLocalDate } from "@/lib/dates";

type Categoria = {
  id: string;
  nome: string;
  cor: string | null;
};

type Transacao = {
  id: string;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  recorrencia: string;
  is_paid: boolean;
  data_vencimento: string;
  data_pagamento: string | null;
  categoria_id: string | null;
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
  categoria_id: "",
  parcelado: false,
  parcelas: "2",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ContasPage() {
  const [contas, setContas] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
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
      const [transacoesRes, categoriasRes] = await Promise.all([
        apiFetch("/api/transacoes"),
        apiFetch("/api/categorias"),
      ]);
      const transacoesData = await transacoesRes.json();
      const categoriasData = await categoriasRes.json();
      if (!transacoesRes.ok) throw new Error(transacoesData.error);
      if (!categoriasRes.ok) throw new Error(categoriasData.error);
      const todas: Transacao[] = transacoesData.transacoes ?? [];
      setContas(todas.filter((t) => t.tipo === "despesa"));
      setCategorias(categoriasData.categorias ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar contas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const anosDisponiveis = useMemo(() => {
    const anos = new Set(contas.map((c) => parseLocalDate(c.data_vencimento).getFullYear()));
    anos.add(new Date().getFullYear());
    return Array.from(anos).sort((a, b) => b - a);
  }, [contas]);

  const contasDoMes = useMemo(
    () =>
      contas.filter((c) => {
        const d = parseLocalDate(c.data_vencimento);
        return d.getMonth() === mes && d.getFullYear() === ano;
      }),
    [contas, mes, ano]
  );

  function categoriaOf(id: string | null) {
    return categorias.find((c) => c.id === id) || null;
  }

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
      categoria_id: t.categoria_id || "",
      parcelado: false,
      parcelas: "2",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const basePayload = {
        descricao: form.descricao,
        valor: Number(form.valor),
        tipo: "despesa",
        categoria_id: form.categoria_id || null,
      };

      if (editingId) {
        const res = await apiFetch(`/api/transacoes/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({
            ...basePayload,
            recorrencia: form.recorrencia,
            is_paid: form.is_paid,
            data_vencimento: form.data_vencimento,
            data_pagamento: form.is_paid ? new Date().toISOString().slice(0, 10) : null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else if (form.parcelado) {
        const totalParcelas = Math.max(2, Number(form.parcelas) || 2);
        for (let i = 0; i < totalParcelas; i++) {
          const res = await apiFetch("/api/transacoes", {
            method: "POST",
            body: JSON.stringify({
              ...basePayload,
              descricao: `${form.descricao} (${i + 1}/${totalParcelas})`,
              recorrencia: "unica",
              is_paid: false,
              data_vencimento: addMonthsClamped(form.data_vencimento, i),
              data_pagamento: null,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
        }
      } else {
        const res = await apiFetch("/api/transacoes", {
          method: "POST",
          body: JSON.stringify({
            ...basePayload,
            recorrencia: form.recorrencia,
            is_paid: form.is_paid,
            data_vencimento: form.data_vencimento,
            data_pagamento: form.is_paid ? new Date().toISOString().slice(0, 10) : null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar conta");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta conta?")) return;
    setError("");
    try {
      const res = await apiFetch(`/api/transacoes/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir conta");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Contas</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Suas contas a pagar (despesas)
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
            Nova conta
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
            {editingId ? "Editar conta" : "Nova conta"}
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
                placeholder="Ex: Aluguel, Energia, Cartão"
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {form.parcelado ? "Valor da parcela" : "Valor"}
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
                Categoria
              </label>
              <select
                value={form.categoria_id}
                onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">Sem categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            {!editingId && (
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  id="parcelado"
                  type="checkbox"
                  checked={form.parcelado}
                  onChange={(e) => setForm({ ...form, parcelado: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600"
                />
                <label htmlFor="parcelado" className="text-sm text-zinc-700 dark:text-zinc-300">
                  Compra parcelada
                </label>
              </div>
            )}

            {form.parcelado && !editingId ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Número de parcelas
                  </label>
                  <input
                    required
                    type="number"
                    min="2"
                    step="1"
                    value={form.parcelas}
                    onChange={(e) => setForm({ ...form, parcelas: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Vencimento da 1ª parcela
                  </label>
                  <input
                    required
                    type="date"
                    value={form.data_vencimento}
                    onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                  <p className="mt-1 text-xs text-zinc-400">
                    As demais parcelas repetem no mesmo dia dos meses seguintes.
                  </p>
                </div>
              </>
            ) : (
              <>
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
                    Já paga
                  </label>
                </div>
              </>
            )}
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
      ) : contasDoMes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma conta em {MESES[mes]}/{ano}.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3 font-medium">Descrição</th>
                <th className="px-5 py-3 font-medium">Categoria</th>
                <th className="px-5 py-3 font-medium">Vencimento</th>
                <th className="px-5 py-3 font-medium">Recorrência</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Valor</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-900 dark:bg-zinc-950">
              {contasDoMes.map((conta) => {
                const categoria = categoriaOf(conta.categoria_id);
                return (
                  <tr key={conta.id}>
                    <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {conta.descricao}
                    </td>
                    <td className="px-5 py-3">
                      {categoria ? (
                        <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: categoria.cor || "#71717a" }}
                          />
                          {categoria.nome}
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                      {formatDateBR(conta.data_vencimento)}
                    </td>
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                      {RECORRENCIA_LABELS[conta.recorrencia] || conta.recorrencia}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          conta.is_paid
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        }`}
                      >
                        {conta.is_paid ? "Paga" : "Em aberto"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(Number(conta.valor))}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openEdit(conta)}
                        className="mr-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(conta.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
