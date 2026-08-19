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
  is_paid: boolean;
  data_vencimento: string;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Dashboard() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const now = new Date();
  const [mes, setMes] = useState(now.getMonth());
  const [ano, setAno] = useState(now.getFullYear());

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch("/api/transacoes");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTransacoes(data.transacoes ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const anosDisponiveis = useMemo(() => {
    const anos = new Set(transacoes.map((t) => parseLocalDate(t.data_vencimento).getFullYear()));
    anos.add(new Date().getFullYear());
    return Array.from(anos).sort((a, b) => b - a);
  }, [transacoes]);

  const transacoesDoMes = useMemo(
    () =>
      transacoes.filter((t) => {
        const d = parseLocalDate(t.data_vencimento);
        return d.getMonth() === mes && d.getFullYear() === ano;
      }),
    [transacoes, mes, ano]
  );

  const totalReceitas = transacoesDoMes
    .filter((t) => t.tipo === "receita")
    .reduce((sum, t) => sum + Number(t.valor), 0);
  const totalDespesas = transacoesDoMes
    .filter((t) => t.tipo === "despesa")
    .reduce((sum, t) => sum + Number(t.valor), 0);
  const saldoDoMes = totalReceitas - totalDespesas;

  const maiorValor = Math.max(totalReceitas, totalDespesas, 1);

  const recentes = [...transacoes]
    .sort(
      (a, b) =>
        parseLocalDate(b.data_vencimento).getTime() - parseLocalDate(a.data_vencimento).getTime()
    )
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Visão geral das suas finanças
          </p>
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Carregando…</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Saldo do mês</p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  saldoDoMes >= 0
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(saldoDoMes)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Receitas do mês</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalReceitas)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Despesas do mês</p>
              <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalDespesas)}
              </p>
            </div>
          </div>

          {/* Simple bar comparison */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Receitas x Despesas — {MESES[mes]}/{ano}
            </p>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Receitas</span>
                  <span>{formatCurrency(totalReceitas)}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${(totalReceitas / maiorValor) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Despesas</span>
                  <span>{formatCurrency(totalDespesas)}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all"
                    style={{ width: `${(totalDespesas / maiorValor) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Lançamentos recentes
              </p>
            </div>
            {recentes.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-zinc-400">
                Nenhum lançamento ainda.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {recentes.map((t) => (
                  <li key={t.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {t.descricao}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDateBR(t.data_vencimento)} ·{" "}
                        {t.is_paid ? "Pago" : "Em aberto"}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        t.tipo === "receita"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {t.tipo === "receita" ? "+" : "-"}
                      {formatCurrency(Number(t.valor))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
