"use client";

import { useState, useTransition } from "react";
import { updateWithdrawalStatus } from "@/app/actions/admin/withdrawals";
import { WITHDRAWAL_STATUSES, type WithdrawalStatus } from "@/db/schema";
import { WITHDRAWAL_STATUS_LABEL } from "@/lib/legal";

export function WithdrawalStatusSelect({ id, status }: { id: number; status: WithdrawalStatus }) {
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function change(next: WithdrawalStatus) {
    if (next === current) return;
    const previous = current;
    setCurrent(next);
    setError("");
    start(async () => {
      const res = await updateWithdrawalStatus(id, next);
      if (res.error) {
        setCurrent(previous);
        setError(res.error);
      }
    });
  }

  return (
    <div>
      <select value={current} disabled={pending} onChange={(e) => change(e.target.value as WithdrawalStatus)} className="field py-2" aria-label="Estado de la solicitud">
        {WITHDRAWAL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {WITHDRAWAL_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
