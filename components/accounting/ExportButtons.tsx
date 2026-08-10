"use client";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Row = { label: string; income: number; expenses: number; profit: number };

export function ExportButtons({ rows }: { rows: Row[] }) {
  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "P&L");
    XLSX.writeFile(wb, "mehran-dental-pnl.xlsx");
  }

  function exportPdf() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Mehran Dental Care — Profit & Loss", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Month", "Income (Rs.)", "Expenses (Rs.)", "Profit (Rs.)"]],
      body: rows.map((r) => [r.label, r.income.toLocaleString(), r.expenses.toLocaleString(), r.profit.toLocaleString()]),
    });
    doc.save("mehran-dental-pnl.pdf");
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportExcel}
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-background"
      >
        Export Excel
      </button>
      <button
        onClick={exportPdf}
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-background"
      >
        Export PDF
      </button>
    </div>
  );
}
