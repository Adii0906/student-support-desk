import { Link } from 'react-router-dom';
import { Stamp } from '../components/Stamp';
import { COLLEGE } from '../config';
import { longDate } from '../lib/format';

const RESPONSE_TIMES = [
  { priority: 'High', within: '4 hours', usual: 'Fee payments, receipts and refunds' },
  { priority: 'Medium', within: '24 hours', usual: 'Attendance records, documents and certificates' },
  { priority: 'Low', within: '72 hours', usual: 'ID cards and general requests' },
];

const ROUTING = [
  { section: 'Accounts Section', handles: 'Fees and general requests' },
  { section: 'Academic Section', handles: 'Attendance' },
  { section: 'Records Office', handles: 'ID cards, documents and certificates' },
];

export default function Landing() {
  return (
    <>
      {/* Noticeboard hero: the one bold moment in the design */}
      <section
        className="bg-ink"
        style={{
          backgroundImage: 'radial-gradient(rgba(247,245,240,0.07) 1px, transparent 1.2px)',
          backgroundSize: '15px 15px',
        }}
      >
        <div className="mx-auto max-w-page px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <article className="relative mx-auto max-w-[46rem] -rotate-[0.6deg] bg-paper-sheet px-6 pb-10 pt-10 shadow-sheet sm:px-12 sm:pt-12">
            <span aria-hidden className="absolute left-1/2 top-3 h-4 w-4 -translate-x-1/2 rounded-full bg-stamp shadow-pin" />

            <div className="flex flex-wrap justify-between gap-2 border-b border-rule pb-3 text-meta text-ink-muted">
              <span>Ref. {COLLEGE.short}/SSO/2026/C-14</span>
              <span>Date: {longDate(new Date())}</span>
            </div>

            <h1 className="mt-7 text-[2.1rem] font-semibold leading-[1.1] sm:text-display">
              Raising a request with the {COLLEGE.office}
            </h1>

            <div className="mt-6 max-w-measure space-y-4 font-serif text-[1.0625rem] leading-[1.7]">
              <p>
                Students of {COLLEGE.name} can raise requests here about fee payments and receipts, attendance
                records, ID cards, documents held by the college, and certificates. You do not need to visit the
                counter to start a request.
              </p>
              <p>
                Every request is entered in the office register, sent to the section that handles it, and given a
                response deadline. Quote your ticket reference if you follow up in person.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/raise" className="btn-primary px-5">Raise a ticket</Link>
              <Link to="/dashboard" className="btn-secondary px-5">Open staff dashboard</Link>
            </div>

            <div className="mt-10 flex items-end justify-between gap-6">
              <p className="font-serif italic leading-snug text-ink-soft">
                Superintendent
                <br />
                {COLLEGE.office}
              </p>
              <div className="rotate-[-14deg]">
                <Stamp className="h-24 w-24 shrink-0 text-stamp opacity-80 mix-blend-multiply sm:h-28 sm:w-28" />
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto grid max-w-page gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-title font-semibold">Response times</h2>
          <p className="mt-2 max-w-measure text-ink-muted">
            Each ticket gets a priority from its category. Staff may raise or lower it after reading your request.
          </p>
          <table className="mt-5 w-full border-t-2 border-ink text-left">
            <thead>
              <tr className="border-b border-rule-strong text-meta text-ink-muted">
                <th scope="col" className="py-2 pr-4 font-medium">Priority</th>
                <th scope="col" className="py-2 pr-4 font-medium">Respond within</th>
                <th scope="col" className="py-2 font-medium">Usually for</th>
              </tr>
            </thead>
            <tbody>
              {RESPONSE_TIMES.map((r) => (
                <tr key={r.priority} className="border-b border-rule align-top">
                  <td className="py-3 pr-4 font-medium">{r.priority}</td>
                  <td className="py-3 pr-4 tabular-nums">{r.within}</td>
                  <td className="py-3 text-ink-soft">{r.usual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-title font-semibold">Where your request goes</h2>
          <p className="mt-2 max-w-measure text-ink-muted">
            Tickets are assigned automatically by category, so the right section sees them first.
          </p>
          <table className="mt-5 w-full border-t-2 border-ink text-left">
            <thead>
              <tr className="border-b border-rule-strong text-meta text-ink-muted">
                <th scope="col" className="py-2 pr-4 font-medium">Section</th>
                <th scope="col" className="py-2 font-medium">Handles</th>
              </tr>
            </thead>
            <tbody>
              {ROUTING.map((r) => (
                <tr key={r.section} className="border-b border-rule align-top">
                  <td className="py-3 pr-4 font-medium">{r.section}</td>
                  <td className="py-3 text-ink-soft">{r.handles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
