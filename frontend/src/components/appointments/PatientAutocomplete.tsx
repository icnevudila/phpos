import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";



import { useDebouncedValue } from "../../hooks/useDebouncedValue";

import { searchPatients } from "../../services/appointments";

import type { PatientSearchRow } from "../../types/appointment";



interface Props {

  value: PatientSearchRow | null;

  onChange: (p: PatientSearchRow | null) => void;

  placeholder?: string;

  disabled?: boolean;

  /** Focus search field on mount (e.g. new appointment modal). */

  autoFocus?: boolean;

}



export function PatientAutocomplete({

  value,

  onChange,

  placeholder,

  disabled = false,

  autoFocus = false,

}: Props): JSX.Element {

  const { t } = useTranslation();
  const placeholderText = placeholder ?? t("pages.appointments.patientAutocomplete.placeholderDefault", { defaultValue: "Placeholder Default" });

  const [query, setQuery] = useState(value?.firstName ? `${value.firstName} ${value.lastName}` : "");

  const [open, setOpen] = useState(false);

  const [results, setResults] = useState<PatientSearchRow[]>([]);

  const [loading, setLoading] = useState(false);

  const [activeIndex, setActiveIndex] = useState(-1);

  const debounced = useDebouncedValue(query.trim(), 250);

  const wrapRef = useRef<HTMLDivElement>(null);

  const listboxId = useId();

  const inputId = useId();



  useEffect(() => {

    if (!debounced || value) {

      setResults([]);

      return;

    }

    let cancelled = false;

    setLoading(true);

    searchPatients(debounced)

      .then((rows) => {

        if (!cancelled) setResults(rows);

      })

      .catch(() => {

        if (!cancelled) setResults([]);

      })

      .finally(() => {

        if (!cancelled) setLoading(false);

      });

    return () => {

      cancelled = true;

    };

  }, [debounced, value]);



  useEffect(() => {

    setActiveIndex(-1);

  }, [debounced]);



  useEffect(() => {

    function onDocClick(e: MouseEvent): void {

      if (!wrapRef.current?.contains(e.target as Node)) {

        setOpen(false);

        setActiveIndex(-1);

      }

    }

    document.addEventListener("mousedown", onDocClick);

    return () => document.removeEventListener("mousedown", onDocClick);

  }, []);



  function selectPatient(r: PatientSearchRow): void {

    onChange(r);

    setOpen(false);

    setActiveIndex(-1);

    setQuery(`${r.firstName} ${r.lastName}`);

  }



  const listVisible = open && Boolean(debounced);



  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>): void {

    if (e.key === "Escape") {

      if (open) {

        e.preventDefault();

        e.stopPropagation();

        setOpen(false);

        setActiveIndex(-1);

      }

      return;

    }



    if (e.key === "ArrowDown") {

      if (!debounced || loading) return;

      e.preventDefault();

      setOpen(true);

      if (results.length === 0) return;

      setActiveIndex((i) => {

        if (i < 0) return 0;

        if (i < results.length - 1) return i + 1;

        return i;

      });

      return;

    }



    if (e.key === "ArrowUp") {

      if (!debounced || loading) return;

      e.preventDefault();

      setOpen(true);

      setActiveIndex((i) => {

        if (i <= 0) return -1;

        return i - 1;

      });

      return;

    }



    if (e.key === "Enter") {
      /** Form içinde tek input varken Enter varsayılan olarak submit eder — her zaman yakala (§24.1). */
      e.preventDefault();
      if (loading) return;
      if (!listVisible) return;
      if (results.length === 1) {
        selectPatient(results[0]);
        return;
      }
      if (activeIndex >= 0 && activeIndex < results.length) {
        selectPatient(results[activeIndex]);
      }
    }

  }



  if (value) {

    return (

      <div className="flex items-center justify-between h-10 rounded-[var(--radius-md)] border border-brand-border bg-brand-surface px-3 py-2">

        <div>

          <p className="text-sm font-semibold text-slate-900">

            {value.firstName} {value.lastName}

          </p>

          <p className="text-xs text-slate-500">{value.phone}</p>

        </div>

        {!disabled ? (

          <button

            type="button"

            onClick={() => {

              onChange(null);

              setQuery("");

            }}

            className="text-xs font-semibold text-slate-500 hover:text-slate-900"

          >

            Change

          </button>

        ) : null}

      </div>

    );

  }



  const activeDescendant =

    activeIndex >= 0 && results[activeIndex] ? `${listboxId}-option-${results[activeIndex].id}` : undefined;



  return (

    <div ref={wrapRef} className="relative">

      <input

        id={inputId}

        type="text"

        role="combobox"

        aria-haspopup="listbox"

        aria-autocomplete="list"

        aria-expanded={listVisible}

        aria-controls={listVisible ? listboxId : undefined}

        aria-activedescendant={listVisible ? activeDescendant : undefined}

        aria-busy={loading}

        value={query}

        onChange={(e) => {

          setQuery(e.target.value);

          setOpen(true);

        }}

        onFocus={() => setOpen(true)}

        onKeyDown={onInputKeyDown}

        placeholder={placeholderText}

        disabled={disabled}

        autoFocus={autoFocus}

        autoComplete="off"

        className="w-full h-10 rounded-[var(--radius-md)] border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow"

      />

      {listVisible ? (

        <div

          id={listboxId}

          role="listbox"

          aria-label={t("pages.appointments.patientAutocomplete.listAria", { defaultValue: "List Aria" })}

          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg"

        >

          {loading ? (

            <div className="px-3 py-2 text-xs text-slate-500" role="status">

              {t("pages.appointments.patientAutocomplete.searching", { defaultValue: "Searching" })}

            </div>

          ) : results.length === 0 ? (

            <div className="px-3 py-3 text-xs text-slate-500" role="status">

              <p>{t("pages.appointments.patientAutocomplete.noResults", { defaultValue: "No Results" })}</p>

              <Link

                to="/patients"

                className="mt-2 inline-flex min-h-10 items-center font-semibold text-teal-700 hover:underline"

              >

                {t("pages.appointments.patientAutocomplete.openPatientsCta", { defaultValue: "Open Patients Cta" })}

              </Link>

            </div>

          ) : (

            results.map((r, i) => (

              <button

                key={r.id}

                id={`${listboxId}-option-${r.id}`}

                type="button"

                role="option"

                aria-selected={activeIndex === i}

                tabIndex={-1}

                onMouseEnter={() => setActiveIndex(i)}

                onClick={() => {

                  selectPatient(r);

                }}

                className={`flex w-full items-center justify-between px-3 py-2 text-left ${ activeIndex === i ? "bg-teal-100" : "hover:bg-teal-50" }`}

              >

                <span className="text-sm text-slate-800">

                  {r.firstName} {r.lastName}

                </span>

                <span className="text-xs text-slate-500">{r.phone}</span>

              </button>

            ))

          )}

        </div>

      ) : null}

    </div>

  );

}


