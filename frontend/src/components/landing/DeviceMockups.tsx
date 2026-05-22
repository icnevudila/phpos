/* eslint-disable react/no-unescaped-entities */
import React from "react";

function LaptopFrame({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="relative">
      <div className="rounded-[18px] bg-white p-2.5 shadow-2xl ring-1 ring-slate-100">
        <div className="rounded-[10px] bg-[#f5f7f9] p-1">
          <div className="aspect-[16/10] overflow-hidden rounded-md bg-white">{children}</div>
        </div>
      </div>
      <div className="mx-auto h-2.5 w-[90%] rounded-b-2xl bg-slate-800 shadow-lg" />
      <div className="mx-auto -mt-0.5 h-1 w-[70%] rounded-b-xl bg-slate-700" />
    </div>
  );
}

function PhoneFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={`relative w-[180px] shrink-0 rounded-[32px] bg-white p-1.5 shadow-2xl ring-1 ring-slate-100 ${className}`}
    >
      <div className="relative overflow-hidden rounded-[26px] bg-white">
        <div className="absolute left-1/2 top-1.5 z-10 h-4 w-14 -translate-x-1/2 rounded-full bg-white" />
        <div className="aspect-[9/19] overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

export function LaptopDashboardMock(): JSX.Element {
  return (
    <div>
      <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
        Illustrative UI — not live patient data
      </p>
      <LaptopFrame>
      <div className="flex h-full text-[7px]">
        {/* Sidebar */}
        <aside className="flex w-[18%] flex-col gap-1 bg-gradient-to-b from-teal-50 to-sky-50 p-2">
          <div className="flex items-center gap-1 pb-1">
            <div className="h-3 w-3 rounded bg-gradient-to-br from-teal-500 to-sky-500" />
            <span className="text-[6px] font-bold text-slate-800">DentEase</span>
          </div>
          <div className="rounded bg-white px-1.5 py-1 font-semibold text-teal-700 shadow-sm">
            Dashboard
          </div>
          {["Appointments", "Patients", "Billing", "HMO Claims", "Inventory", "Staff"].map((x) => (
            <div key={x} className="px-1.5 py-0.5 text-slate-600">
              {x}
            </div>
          ))}
        </aside>
        {/* Main */}
        <div className="flex-1 p-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold text-slate-900">Staff Dashboard</span>
            <div className="flex -space-x-1">
              <div className="h-3 w-3 rounded-full bg-teal-400 ring-1 ring-white" />
              <div className="h-3 w-3 rounded-full bg-sky-400 ring-1 ring-white" />
            </div>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {[
              { l: "Today's appts", v: "24", cls: "bg-teal-50 text-teal-700 [&>p.v]:text-teal-900" },
              { l: "New patients", v: "11", cls: "bg-sky-50 text-sky-700 [&>p.v]:text-sky-900" },
              { l: "HMO claims", v: "6", cls: "bg-amber-50 text-amber-700 [&>p.v]:text-amber-900" },
              { l: "Alerts", v: "3", cls: "bg-rose-50 text-rose-700 [&>p.v]:text-rose-900" },
            ].map((s) => (
              <div key={s.l} className={`rounded p-1 ${s.cls}`}>
                <p className="text-[5px]">{s.l}</p>
                <p className="v text-[9px] font-bold">{s.v}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <div className="rounded border border-slate-200 p-1.5">
              <p className="text-[6px] font-semibold text-slate-700">Today's clinic queue</p>
              {[
                { n: "Juan dela Cruz", t: "9:00 AM", dot: "bg-teal-300" },
                { n: "Maria Santos", t: "10:00 AM", dot: "bg-amber-300" },
                { n: "Jose Rizal", t: "11:00 AM", dot: "bg-sky-300" },
                { n: "Ana Cruz", t: "12:00 PM", dot: "bg-amber-300" },
              ].map((r, i) => (
                <div
                  key={i}
                  className="mt-0.5 flex items-center justify-between rounded bg-slate-50 px-1 py-0.5"
                >
                  <div className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${r.dot}`} />
                    <span className="text-[5px] text-slate-700">{r.n}</span>
                  </div>
                  <span className="text-[5px] text-slate-500">{r.t}</span>
                </div>
              ))}
            </div>
            <div className="rounded border border-slate-200 p-1.5">
              <p className="text-[6px] font-semibold text-slate-700">Active treatment · Odontogram</p>
              <div className="mt-0.5 grid grid-cols-8 gap-0.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-sm ${ [2, 5, 9].includes(i) ? "bg-rose-400" : [1, 7].includes(i) ? "bg-sky-400" : [11].includes(i) ? "bg-amber-400" : "bg-slate-200" }`}
                  />
                ))}
              </div>
              <div className="mt-0.5 grid grid-cols-8 gap-0.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-sm ${ [4, 10].includes(i) ? "bg-teal-400" : [6].includes(i) ? "bg-sky-400" : "bg-slate-200" }`}
                  />
                ))}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[5px]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />
                <span className="text-slate-600">Decay</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span className="text-slate-600">Filled</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-400" />
                <span className="text-slate-600">RCT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LaptopFrame>
    </div>
  );
}

export function LaptopInventoryMock(): JSX.Element {
  return (
    <LaptopFrame>
      <div className="flex h-full bg-slate-50 text-[7px]">
        <aside className="w-[18%] bg-white border-r border-slate-200 p-2">
          <div className="h-3 w-8 rounded bg-slate-200 mb-2" />
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`h-2 rounded ${i === 2 ? 'bg-teal-100' : 'bg-slate-100'}`} />
            ))}
          </div>
        </aside>
        <div className="flex-1 p-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[8px] font-bold">Inventory Management</span>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-700 text-[6px] font-bold">2 Alerts</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
             {["Anesthetics", "Restorative", "PPE"].map(c => (
               <div key={c} className="bg-white rounded p-1.5 shadow-sm border border-slate-100">
                 <p className="text-slate-400 text-[5px] uppercase font-bold">{c}</p>
                 <p className="text-[7px] font-bold mt-1">12 items</p>
               </div>
             ))}
          </div>
          <div className="bg-white rounded shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100 text-slate-500">
                <tr>
                  <th className="p-1 text-left">Item Name</th>
                  <th className="p-1">Stock</th>
                  <th className="p-1">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {[
                  { n: "Lidocaine 2%", s: "4", st: "Critical", cls: "text-rose-600" },
                  { n: "Composite A2", s: "18", st: "OK", cls: "text-teal-600" },
                  { n: "Sterile Gloves", s: "2", st: "Low", cls: "text-amber-600" },
                ].map(r => (
                  <tr key={r.n} className="border-t border-slate-50">
                    <td className="p-1">{r.n}</td>
                    <td className="p-1 text-center">{r.s}</td>
                    <td className={`p-1 text-center font-bold ${r.cls}`}>{r.st}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LaptopFrame>
  );
}

function PhoneBooking(): JSX.Element {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-gradient-to-b from-teal-50 to-white p-2 text-[7px]">
        <div className="mt-2 flex items-center gap-1 pt-1">
          <div className="h-2.5 w-2.5 rounded bg-gradient-to-br from-teal-500 to-sky-500" />
          <span className="text-[7px] font-bold text-slate-800">DentEase</span>
        </div>
        <p className="mt-2 text-[9px] font-bold text-slate-900">Book your appointment</p>
        <div className="mt-1.5 rounded-lg bg-white p-1.5 shadow-sm">
          <p className="text-[6px] font-semibold text-slate-700">Doctor</p>
          <div className="mt-0.5 flex items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-gradient-to-br from-amber-300 to-rose-400" />
            <div>
              <p className="text-[6px] font-semibold">Dr. Juan dela Cruz</p>
              <p className="text-[5px] text-amber-600">★ ★ ★ ★ ★ 4.9</p>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[6px] font-semibold text-slate-700">Calendar</p>
        <div className="mt-0.5 grid grid-cols-7 gap-0.5 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-[5px] text-slate-500">
              {d}
            </div>
          ))}
          {Array.from({ length: 21 }).map((_, i) => {
            const d = i + 1;
            const active = [11, 14, 15, 16, 17].includes(d);
            return (
              <div
                key={i}
                className={`flex h-3.5 items-center justify-center rounded text-[5px] ${ active ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-700" }`}
              >
                {d}
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 grid grid-cols-4 gap-0.5">
          {["9:00", "10:00", "2:00", "3:00"].map((t) => (
            <div
              key={t}
              className="rounded bg-white px-0.5 py-1 text-center text-[6px] font-semibold text-slate-700 shadow-sm"
            >
              {t}
            </div>
          ))}
        </div>
        <div className="mt-auto rounded-lg bg-gradient-to-br from-teal-500 to-sky-500 py-1.5 text-center text-[7px] font-bold text-white">
          Review & Confirm
        </div>
      </div>
    </PhoneFrame>
  );
}

function PhoneChart(): JSX.Element {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-white p-2 text-[7px]">
        <div className="mt-2 flex items-center gap-1 pt-1">
          <div className="h-2.5 w-2.5 rounded bg-gradient-to-br from-teal-500 to-sky-500" />
          <span className="text-[7px] font-bold text-slate-800">Treatment View</span>
        </div>
        <p className="mt-1.5 text-[8px] font-bold text-slate-900">Tooth #3</p>
        <div className="mt-1 grid grid-cols-8 gap-0.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className={`h-3 rounded-sm ${ [2].includes(i) ? "bg-rose-400" : i === 5 ? "bg-teal-400" : "bg-slate-200" }`}
            />
          ))}
        </div>
        <div className="mt-0.5 grid grid-cols-8 gap-0.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className={`h-3 rounded-sm ${ [6].includes(i) ? "bg-sky-400" : [10].includes(i) ? "bg-amber-400" : "bg-slate-200" }`}
            />
          ))}
        </div>
        <div className="mt-2 rounded-lg bg-slate-50 p-1.5">
          <p className="text-[6px] font-semibold text-slate-700">Treatment notes</p>
          <p className="mt-0.5 text-[5px] text-slate-500">
            Root canal therapy started. Next visit in 7 days for crown fitting.
          </p>
        </div>
        <div className="mt-1.5 flex items-center justify-between rounded-lg bg-teal-50 p-1.5">
          <span className="text-[6px] font-semibold text-teal-800">RCT · Crown</span>
          <span className="text-[6px] font-bold text-teal-800">₱3,000</span>
        </div>
        <div className="mt-auto rounded-lg bg-white py-1.5 text-center text-[7px] font-bold text-white">
          Save treatment
        </div>
      </div>
    </PhoneFrame>
  );
}

function PhoneBilling(): JSX.Element {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-white p-2 text-[7px]">
        <div className="mt-2 flex items-center gap-1 pt-1">
          <div className="h-2.5 w-2.5 rounded bg-gradient-to-br from-teal-500 to-sky-500" />
          <span className="text-[7px] font-bold text-slate-800">Bill & HMO</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1">
          <div className="h-4 w-4 rounded-full bg-gradient-to-br from-amber-300 to-rose-400" />
          <div>
            <p className="text-[7px] font-bold text-slate-900">Juan dela Cruz</p>
            <p className="text-[5px] text-slate-500">Iloilo City</p>
          </div>
        </div>
        <p className="mt-2 text-[6px] font-semibold text-slate-700">Items</p>
        {[
          { n: "Consultation", v: "₱300" },
          { n: "X-ray (Panorex)", v: "₱1,000" },
          { n: "Composite filling", v: "₱50" },
        ].map((it) => (
          <div
            key={it.n}
            className="mt-0.5 flex items-center justify-between rounded border-b border-dashed border-slate-200 py-0.5"
          >
            <span className="text-[6px] text-slate-700">{it.n}</span>
            <span className="text-[6px] font-semibold text-slate-900">{it.v}</span>
          </div>
        ))}
        <div className="mt-1.5 flex items-center justify-between rounded bg-teal-50 px-1.5 py-1">
          <span className="text-[6px] font-bold text-teal-800">Total</span>
          <span className="text-[8px] font-extrabold text-teal-800">₱1,350</span>
        </div>
        <p className="mt-2 text-[6px] font-semibold text-slate-700">HMO Coverage</p>
        {[
          { n: "Maxicare", s: "Approved", cls: "bg-teal-100 text-teal-700" },
          { n: "Intellicare", s: "Pending", cls: "bg-amber-100 text-amber-700" },
          { n: "Medicard", s: "Approved", cls: "bg-teal-100 text-teal-700" },
        ].map((h) => (
          <div key={h.n} className="mt-0.5 flex items-center justify-between">
            <span className="text-[6px] text-slate-700">{h.n}</span>
            <span className={`rounded-full px-1 py-[1px] text-[5px] font-bold ${h.cls}`}>
              {h.s}
            </span>
          </div>
        ))}
        <div className="mt-auto rounded-lg bg-gradient-to-br from-teal-500 to-sky-500 py-1.5 text-center text-[7px] font-bold text-white">
          Pay with GCash
        </div>
      </div>
    </PhoneFrame>
  );
}

export function PhoneReports(): JSX.Element {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-white p-3 text-[7px]">
        <p className="text-[8px] font-black uppercase text-slate-400">Weekly Reports</p>
        <div className="mt-4 flex-1">
          <div className="flex items-end gap-1.5 h-20">
            {[30, 45, 25, 60, 80, 55, 40].map((h, i) => (
              <div key={i} className="flex-1 bg-teal-500/20 rounded-t-sm relative group">
                <div className="absolute bottom-0 w-full bg-teal-500 rounded-t-sm" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[5px] text-slate-400 font-bold">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="rounded-xl bg-slate-50 p-2 flex justify-between items-center">
            <span className="font-bold">Total Revenue</span>
            <span className="text-teal-600 font-black">₱42.5k</span>
          </div>
          <div className="rounded-xl bg-slate-50 p-2 flex justify-between items-center">
            <span className="font-bold">New Patients</span>
            <span className="text-sky-600 font-black">+18</span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

export function PhonesStack({ variant = 0 }: { variant?: number }): JSX.Element {
  const label = (
    <p className="mb-3 text-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
      Illustrative UI � not live patient data
    </p>
  );
  if (variant === 1) {
    return (
      <div>
        {label}
        <div className="flex items-end gap-3">
          <div className="-mr-6 -mb-4 scale-90 opacity-90">
            <PhoneBilling />
          </div>
          <div className="relative z-10">
            <PhoneReports />
          </div>
          <div className="-ml-6 -mb-4 scale-90 opacity-90">
            <PhoneChart />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      {label}
      <div className="flex items-end gap-3">
        <div className="-mr-6 -mb-4 scale-90 opacity-90">
          <PhoneBooking />
        </div>
        <div className="relative z-10">
          <PhoneChart />
        </div>
        <div className="-ml-6 -mb-4 scale-90 opacity-90">
          <PhoneBilling />
        </div>
      </div>
    </div>
  );
}