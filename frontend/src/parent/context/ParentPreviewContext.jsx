// ─── Parent Preview Context (TEMPORARY — dev-only) ─────────────────────────
// Parent Authentication does not exist yet. Until it does, this context
// stands in for "the logged-in parent's session": it reads ERPContext (the
// single source of truth) and lets a developer pick which parent to preview
// the portal as, via the "PREVIEW MODE" switcher in ParentNavbar.
//
// Nothing here duplicates ERP state — parents/students are read directly
// from useERP() on every render. This file only tracks *which* parent is
// currently being previewed.
//
// REMOVAL PLAN: once real Parent Authentication ships, delete this file and
// the <PreviewAsSwitcher /> block in ParentNavbar.jsx, then replace the
// `parent` value below with whatever the auth session resolves to. Every
// other Parent Portal component reads only `{ parent, child, linkedStudents }`
// from useParentPreview(), so nothing else needs to change.

import { createContext, useContext, useMemo, useState } from "react";
import { useERP } from "../../pages/ERPContext.jsx";

const ParentPreviewContext = createContext(undefined);

export function ParentPreviewProvider({ children }) {
  const { parents, students } = useERP();

  // Only active parent records are eligible to preview.
  const activeParents = useMemo(
    () => parents.filter((p) => p.active !== false),
    [parents]
  );

  const [selectedId, setSelectedId] = useState(null);

  const parent = useMemo(() => {
    if (activeParents.length === 0) return null;

    const found =
      selectedId &&
      activeParents.find((p) => p.id === selectedId);

    return found || activeParents[0];
  }, [activeParents, selectedId]);

  // Students are linked using phone number.
  const linkedStudents = useMemo(() => {
    if (!parent) return [];

    return students.filter((s) => s.phone === parent.phone);
  }, [students, parent]);

  const child = useMemo(() => {
    if (linkedStudents.length === 0) return null;

    return (
      linkedStudents.find((s) => s.status === "Active") ||
      linkedStudents[0]
    );
  }, [linkedStudents]);

  const selectParent = (id) => setSelectedId(id);

  const value = {
    activeParents,
    parent,
    linkedStudents,
    child,
    selectParent,
  };

  return (
    <ParentPreviewContext.Provider value={value}>
      {children}
    </ParentPreviewContext.Provider>
  );
}

export function useParentPreview() {
  const ctx = useContext(ParentPreviewContext);

  if (ctx === undefined) {
    throw new Error(
      "useParentPreview must be used within a ParentPreviewProvider"
    );
  }

  return ctx;
}