/* Job Enquiries / Guidance Enquiries sent from the website's forms, newest first — one tab per kind */
import { useEffect, useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { Empty, useUi } from '../lib/ui.jsx';

const JOB_COLUMNS = [['name', 'Full Name'], ['qualification', 'Qualification'], ['experience', 'Years of Experience'], ['phone', 'Contact Number'],
  ['specialization', 'Gulf Licensing Examination Qualified Field / Medical Specialization']];
// guidance requests carry the same details plus an optional message (requests sent before that change lack some: shown as —)
const COLUMNS = { job: JOB_COLUMNS, guidance: [...JOB_COLUMNS, ['requirement', 'Guidance Requirement']] };
const blank = v => v === undefined || v === null || v === '';
const NAME = { job: 'job enquiries', guidance: 'guidance enquiries' };
const when = d => new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export default function Enquiries({ kind }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const { toast, ask } = useUi();

  async function load() {
    setError(null);
    const r = await api(`/api/admin/enquiries/${kind}`);
    if (!r.ok) return setError(r.data.error || `Could not load ${NAME[kind]}.`);
    setRows(r.data);
  }
  useEffect(() => { load(); }, []);

  async function remove(x) {
    if (!(await ask('Delete this enquiry?', `The enquiry from “${x.name}” is removed for good.`, 'Delete', true))) return;
    const r = await api(`/api/admin/enquiries/${kind}/${x.id}`, { method: 'DELETE' });
    if (!r.ok && r.status !== 404) return r.status !== 401 && toast(r.data.error || 'Could not delete this enquiry.', 'error');
    setRows(rs => rs.filter(e => e.id !== x.id));   // 404: already gone, drop it too
  }

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
              <tr>{[...COLUMNS[kind].map(c => c[1]), 'Submission Date', ''].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {rows.map(r => (
                <tr key={r.id} className="align-top hover:bg-mint/40">
                  {COLUMNS[kind].map(([k]) => (
                    <td key={k} className={`px-5 py-3.5 ${k === 'requirement' ? 'min-w-[280px] whitespace-pre-line break-words' : ''}`}>
                      {blank(r[k]) ? <span className="text-charcoal/35">—</span> : k === 'phone' ? <a href={`tel:${r[k]}`} className="whitespace-nowrap hover:underline">{r[k]}</a> : r[k]}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-5 py-3.5">{when(r.date)}</td>
                  <td className="px-3 py-2">
                    <button type="button" aria-label="Delete" title="Delete" className="rounded-full p-2 text-charcoal/35 transition hover:bg-red-50 hover:text-red-500" onClick={() => remove(r)}><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </>;
}
