import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Spinner } from '../components/Spinner';
import { Stamp } from '../components/Stamp';
import { COLLEGE } from '../config';
import { dateTime, ticketRef } from '../lib/format';
import {
  CATEGORIES, CATEGORY_PRIORITY, SLA_HOURS, type Category, type NewTicket, type Staff, type Ticket,
} from '../types';

type Errors = Partial<Record<keyof NewTicket, string>>;

const EMPTY: NewTicket = { student_name: '', roll_number: '', category: 'Fees', subject: '', description: '' };

const CATEGORY_HINT: Record<Category, string> = {
  Fees: 'Payments, receipts, refunds, scholarships',
  Attendance: 'Missing or wrong attendance, leave',
  'ID Card': 'New, lost or incorrect ID cards',
  Documents: 'Originals held by the college, copies',
  Certificates: 'Bonafide, migration, provisional',
  Other: 'Anything not listed here',
};

const DESCRIPTION_MAX = 4000;

function validate(f: NewTicket): Errors {
  const e: Errors = {};
  if (f.student_name.trim().length < 2) e.student_name = 'Enter your full name.';
  if (f.roll_number.trim().length < 3) e.roll_number = 'Enter your roll number.';
  if (f.subject.trim().length < 4) e.subject = 'Write a short subject, at least 4 characters.';
  if (f.subject.trim().length > 120) e.subject = 'Keep the subject under 120 characters.';
  if (f.description.trim().length < 10) e.description = 'Describe the request in at least 10 characters.';
  return e;
}

function responseText(hours: number) {
  return hours < 24 ? `${hours} hours` : `${hours / 24} ${hours === 24 ? 'day' : 'days'}`;
}

export default function Raise() {
  const [form, setForm] = useState<NewTicket>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [created, setCreated] = useState<Ticket | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.listStaff().then(setStaff).catch(() => setStaff([]));
  }, []);

  const handler = staff.find((s) => s.categories.includes(form.category));
  const priority = CATEGORY_PRIORITY[form.category];

  function set<K extends keyof NewTicket>(key: K, value: NewTicket[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(first)?.focus();
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      const t = await api.createTicket({
        ...form,
        student_name: form.student_name.trim(),
        roll_number: form.roll_number.trim().toUpperCase(),
        subject: form.subject.trim(),
        description: form.description.trim(),
      });
      setCreated(t);
      setCopied(false);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function copyRef(ref: string) {
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (created) {
    const s = staff.find((x) => x.name === created.assigned_to);
    const ref = ticketRef(created.id);
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="relative animate-rise-in border border-rule bg-paper-sheet shadow-sheet" role="status">
          <div className="pointer-events-none absolute -top-4 right-4 rotate-[-12deg] sm:right-8">
            <Stamp className="h-24 w-24 animate-stamp-in text-state-resolved mix-blend-multiply sm:h-28 sm:w-28" />
          </div>
          <div className="border-b-2 border-state-resolved px-6 py-6 pr-32 sm:px-8 sm:pr-40">
            <p className="text-meta text-ink-muted">Ticket received</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-title font-semibold tabular-nums">{ref}</h1>
              <button type="button" onClick={() => copyRef(ref)} className="btn-quiet">
                {copied ? 'Copied' : 'Copy reference'}
              </button>
            </div>
            <p className="mt-2 text-ink-soft">
              Keep this reference. Quote it at the Student Services counter if you follow up in person.
            </p>
          </div>
          <dl className="divide-y divide-rule px-6 sm:px-8">
            {[
              ['Subject', created.subject],
              ['Student', `${created.student_name}, ${created.roll_number}`],
              ['Category', created.category],
              ['Assigned to', s ? `${created.assigned_to}, ${s.section}` : created.assigned_to],
              ['Priority', created.priority],
              ['Response due by', dateTime(created.sla_deadline)],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 py-3 sm:grid-cols-[9rem_1fr]">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-3 border-t border-rule px-6 py-5 sm:px-8">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setCreated(null);
                setForm(EMPTY);
                setErrors({});
              }}
            >
              Raise another ticket
            </button>
            <Link to="/dashboard" className="btn-secondary">View in staff dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-page px-4 py-10 sm:px-6 sm:py-12">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,48rem)_16rem] lg:gap-14">
        <div>
          <h1 className="text-title font-semibold">Raise a ticket</h1>
          <p className="mt-2 max-w-measure text-ink-muted">
            Fill in the form below. Your ticket goes straight to the section that handles it, and you get a
            reference number to track it.
          </p>

          <form onSubmit={submit} noValidate className="mt-8 border border-rule bg-paper-sheet px-5 py-6 sm:px-8 sm:py-8">
            <fieldset>
              <legend className="font-serif text-heading font-semibold">Your details</legend>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="student_name" className="field-label">Full name</label>
                  <input
                    id="student_name"
                    className="field-input"
                    autoComplete="name"
                    value={form.student_name}
                    onChange={(e) => set('student_name', e.target.value)}
                    aria-invalid={!!errors.student_name}
                    aria-describedby={errors.student_name ? 'student_name-err' : undefined}
                  />
                  {errors.student_name && <p id="student_name-err" className="field-error">{errors.student_name}</p>}
                </div>
                <div>
                  <label htmlFor="roll_number" className="field-label">Roll number</label>
                  <input
                    id="roll_number"
                    className="field-input uppercase tabular-nums placeholder:normal-case"
                    placeholder={`For example ${COLLEGE.rollExample}`}
                    value={form.roll_number}
                    onChange={(e) => set('roll_number', e.target.value)}
                    aria-invalid={!!errors.roll_number}
                    aria-describedby={errors.roll_number ? 'roll_number-err' : undefined}
                  />
                  {errors.roll_number && <p id="roll_number-err" className="field-error">{errors.roll_number}</p>}
                </div>
              </div>
            </fieldset>

            <div className="mt-8 border-t border-rule pt-6">
              <h2 className="text-heading font-semibold">Your request</h2>

              <fieldset className="mt-4">
                <legend className="field-label">What is it about?</legend>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                  {CATEGORIES.map((c) => (
                    <label
                      key={c}
                      className="flex cursor-pointer flex-col rounded-form border border-rule-strong bg-paper-sheet px-3 py-2.5 transition-colors hover:border-ink-muted has-[:checked]:border-ink has-[:checked]:bg-paper-sunk has-[:checked]:shadow-[inset_3px_0_0_#1C2B39] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={c}
                        checked={form.category === c}
                        onChange={() => set('category', c)}
                        className="sr-only"
                      />
                      <span className="font-medium">{c}</span>
                      <span className="text-meta text-ink-muted">{CATEGORY_HINT[c]}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-meta text-ink-soft" aria-live="polite">
                  {handler ? (
                    <>
                      Goes to <span className="font-medium text-ink">{handler.section}</span> ({handler.name}).{' '}
                    </>
                  ) : null}
                  {priority} priority, response within {responseText(SLA_HOURS[priority])}.
                </p>
              </fieldset>

              <div className="mt-6 grid gap-5">
                <div>
                  <label htmlFor="subject" className="field-label">Subject</label>
                  <input
                    id="subject"
                    className="field-input"
                    placeholder="For example: Exam fee paid twice"
                    maxLength={120}
                    value={form.subject}
                    onChange={(e) => set('subject', e.target.value)}
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? 'subject-err' : undefined}
                  />
                  {errors.subject && <p id="subject-err" className="field-error">{errors.subject}</p>}
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="description" className="field-label">Description</label>
                    <span className="text-meta tabular-nums text-ink-faint">
                      {form.description.length} / {DESCRIPTION_MAX}
                    </span>
                  </div>
                  <textarea
                    id="description"
                    rows={6}
                    maxLength={DESCRIPTION_MAX}
                    className="field-input resize-y"
                    placeholder="What happened, when, and what you need from the office. Include transaction or receipt numbers if you have them."
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    aria-invalid={!!errors.description}
                    aria-describedby={errors.description ? 'description-err' : undefined}
                  />
                  {errors.description && <p id="description-err" className="field-error">{errors.description}</p>}
                </div>
              </div>
            </div>

            {serverError && (
              <p
                className="mt-6 animate-rise-in border-l-[3px] border-state-breached bg-state-breached/[0.06] px-3 py-2 text-state-breached"
                role="alert"
              >
                {serverError}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-rule pt-6">
              <button type="submit" className="btn-primary px-6" disabled={submitting}>
                {submitting && <Spinner />}
                {submitting ? 'Submitting' : 'Submit ticket'}
              </button>
              <span className="text-meta text-ink-muted">All fields are required.</span>
            </div>
          </form>
        </div>

        <aside className="h-fit border-t-2 border-ink pt-4 text-meta text-ink-soft lg:mt-[4.5rem]">
          <h2 className="text-heading font-semibold text-ink">Before you submit</h2>
          <p className="mt-2">Raise one ticket per issue. Separate tickets reach the right section faster.</p>
          <p className="mt-3">For urgent certificate requests with a deadline, mention the date in the description.</p>
          <p className="mt-3">Original documents are only returned in person at the counter, against your ID card.</p>
        </aside>
      </div>
    </div>
  );
}
