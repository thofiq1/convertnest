// Keeps fillable form fields working when PDFs are merged with pdf-lib.
// copyPages() brings the field widgets across but not the document-level
// form (AcroForm) that makes them editable, so we rebuild it here.
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFObjectCopier, PDFRef, PDFString, PDFBool, type PDFPage } from "pdf-lib";

const N = (s: string) => PDFName.of(s);

export type FormCarry = { roots: PDFRef[]; names: Set<string>; dr?: PDFDict; da?: PDFString };

/** Call after copyPages for one source document. Collects that document's top-level fields. */
export function collectFields(merged: PDFDocument, src: PDFDocument, copiedPages: PDFPage[]): FormCarry | null {
  const ctx = merged.context;
  const roots = new Map<string, PDFRef>();
  for (const page of copiedPages) {
    const annots = page.node.lookupMaybe(N("Annots"), PDFArray);
    if (!annots) continue;
    for (let i = 0; i < annots.size(); i++) {
      const first = annots.get(i);
      if (!(first instanceof PDFRef)) continue;
      let ref: PDFRef = first;
      let dict: PDFDict | undefined = ctx.lookupMaybe(ref, PDFDict);
      if (!dict || dict.get(N("Subtype")) !== N("Widget")) continue;
      // Walk up to the top-level field this widget belongs to.
      for (let guard = 0; guard < 50; guard++) {
        const parent: unknown = dict!.get(N("Parent"));
        if (!(parent instanceof PDFRef)) break;
        const pd: PDFDict | undefined = ctx.lookupMaybe(parent, PDFDict);
        if (!pd) break;
        ref = parent; dict = pd;
      }
      if (dict && (dict.has(N("T")) || dict.has(N("FT")))) roots.set(ref.tag, ref);
    }
  }
  if (roots.size === 0) return null;

  const names = new Set<string>();
  for (const r of roots.values()) {
    const t = ctx.lookupMaybe(r, PDFDict)?.lookup(N("T"));
    if (t && "decodeText" in t) names.add((t as PDFString).decodeText());
  }

  // Bring the source form's default fonts/appearance across too.
  let dr: PDFDict | undefined, da: PDFString | undefined;
  const srcForm = src.catalog.lookupMaybe(N("AcroForm"), PDFDict);
  if (srcForm) {
    const copier = PDFObjectCopier.for(src.context, ctx);
    const srcDr = srcForm.lookupMaybe(N("DR"), PDFDict);
    if (srcDr) dr = copier.copy(srcDr);
    const srcDa = srcForm.lookup(N("DA"));
    if (srcDa instanceof PDFString) da = PDFString.of(srcDa.asString());
  }
  return { roots: [...roots.values()], names, dr, da };
}

/** Call once after all documents are added. */
export function attachForm(merged: PDFDocument, carries: (FormCarry | null)[]) {
  const ctx = merged.context;
  const withFields = carries.filter((c): c is FormCarry => !!c);
  if (withFields.length === 0) return;

  const fields: PDFRef[] = [];
  const seen = new Set<string>();
  withFields.forEach((c, idx) => {
    const clash = [...c.names].some((n) => seen.has(n));
    if (clash) {
      // Two files use the same field names: group this file's fields under
      // their own parent so both sets stay independent.
      const group = ctx.obj({ T: PDFString.of(`file${idx + 1}`), Kids: c.roots });
      const groupRef = ctx.register(group);
      for (const r of c.roots) ctx.lookup(r, PDFDict).set(N("Parent"), groupRef);
      fields.push(groupRef);
    } else {
      fields.push(...c.roots);
    }
    c.names.forEach((n) => seen.add(n));
  });

  const form = ctx.obj({ Fields: fields, NeedAppearances: PDFBool.True });
  const fonts = ctx.obj({});
  for (const c of withFields) {
    const f = c.dr?.lookupMaybe(N("Font"), PDFDict);
    if (f) for (const [k, v] of f.entries()) if (!fonts.has(k)) fonts.set(k, v);
  }
  if (fonts.keys().length > 0) form.set(N("DR"), ctx.obj({ Font: fonts }));
  const da = withFields.find((c) => c.da)?.da;
  if (da) form.set(N("DA"), da);
  merged.catalog.set(N("AcroForm"), ctx.register(form));
}
