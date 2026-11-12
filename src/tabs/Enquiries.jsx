/* Job Enquiries / Guidance Enquiries sent from the website's forms, newest first — one tab per kind */
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '../lib/api.js';
import { Empty } from '../lib/ui.jsx';

const COLUMNS = {
  job: [['name', 'Full Name'], ['qualification', 'Qualification'], ['experience', 'Years of Experience'], ['phone', 'Contact Number'],
    ['whatsapp', 'WhatsApp Number'], ['specialization', 'Gulf Licensing Exam Qualified Field / Specialization']],
  guidance: [['name', 'Full Name'], ['qualification', 'Qualification'], ['phone', 'Contact Number'], ['whatsapp', 'WhatsApp Number'],
    ['requirement', 'Guidance Requirement']],
};
const NAME = { job: 'job enquiries', guidance: 'guidance enquiries' };
const when = d => new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export default function Enquiries({ kind }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    setError(null);
    const r = await api(`/api/admin/enquiries/${kind}`);
    if (!r.ok) return setError(r.data.error || `Could not load ${NAME[kind]}.`);
    setRows(r.data);
  }
  useEffect(() => { load(); }, []);

  if (error) return <div className="a-panel"><Empty title={`Could not load ${NAME[kind]}`} text={error} /><div className="text-center"><button className="a-btn a-btn--ghost" onClick={load}>Try again</button></div></div>;
  if (!rows) return <div className="a-panel text-[13px] text-charcoal/50">Loading…</div>;

  return <>
    <div className="mb-4 flex items-center gap-2">
      <p className="mr-auto text-[13px] text-charcoal/55">{rows.length} enquir{rows.length === 1 ? 'y' : 'ies'}</p>
      <button type="button" className="a-btn a-btn--ghost" onClick={load}><RefreshCw className="h-4 w-4" />Refresh</button>
    </div>
    <div className="a-panel overflow-hidden !p-0">
      {!rows.length ? <Empty title={`No ${NAME[kind]} yet`} text="Forms sent from the website will appear here." /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-[13px]">
            <thead className="border-b border-black/5 bg-mint/60 text-[11px] uppercase tracking-wider text-charcoal/50">
              <tr>{[...COLUMNS[kind].map(c => c[1]), 'Submission Date'].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {rows.map(r => (
                <tr key={r.id} className="align-top hover:bg-mint/40">
                  {COLUMNS[kind].map(([k]) => (
                    <td key={k} className={`px-5 py-3.5 ${k === 'requirement' ? 'min-w-[280px] whitespace-pre-line break-words' : ''}`}>
                      {k === 'phone' || k === 'whatsapp' ? <a href={k === 'phone' ? `tel:${r[k]}` : `https://wa.me/${String(r[k]).replace(/\D/g, '')}`} target={k === 'whatsapp' ? '_blank' : undefined} rel="noopener" className="whitespace-nowrap hover:underline">{r[k]}</a> : r[k]}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-5 py-3.5">{when(r.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </>;
}
