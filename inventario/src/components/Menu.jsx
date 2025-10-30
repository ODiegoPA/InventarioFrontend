import { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/productos", label: "Productos" },
  { to: "/marcas", label: "Marcas" },
  { to: "/lotes", label: "Lotes" },
  { to: "/sucursales", label: "Sucursales" },
  { to: "/lotes-sucursales", label: "Lote-Sucursales" },
];

export default function NavInventarioInventory() {
  const [open, setOpen] = useState(false);

  const base =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const active =
    "bg-blue-600 text-white";
  const inactive =
    "text-neutral-800 hover:bg-neutral-100";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
            II
          </div>
          <span className="text-base font-semibold tracking-tight">
            InventarioInventory
          </span>
        </div>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${base} ${isActive ? active : inactive}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 md:hidden"
          aria-label="Abrir menú"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {links.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `${base} block ${isActive ? active : inactive}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
