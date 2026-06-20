import { LAYERS, type NoteLayer } from "@/core";

type FunnelNote = {
  id: string;
  title: string;
  layer: string;
};

type FunnelViewProps = {
  notes: FunnelNote[];
  projectId: string;
};

export function FunnelView({ notes, projectId }: FunnelViewProps) {
  const notesByLayer = new Map<NoteLayer, FunnelNote[]>();

  for (const layer of LAYERS) {
    notesByLayer.set(layer.id, []);
  }

  for (const note of notes) {
    if (note.layer === "none") {
      continue;
    }

    const layerNotes = notesByLayer.get(note.layer as NoteLayer);

    if (layerNotes) {
      layerNotes.push(note);
    }
  }

  return (
    <section className="border-t border-slate-200 py-8">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-950">Embudo</h2>
        <p className="mt-1 text-sm text-slate-600">
          Las seis capas del negocio con sus notas asignadas.
        </p>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {LAYERS.map((layer) => (
          <section
            className="rounded-lg border border-slate-200 bg-white p-4"
            key={layer.id}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-sm font-semibold text-indigo-700">
                {layer.number}
              </span>
              <div>
                <h3 className="font-semibold text-slate-950">{layer.name}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {layer.question}
                </p>
              </div>
            </div>
            <ul className="mt-4 grid gap-2">
              {(notesByLayer.get(layer.id) ?? []).map((note) => (
                <li key={note.id}>
                  <a
                    className="block rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 transition hover:border-indigo-200 hover:bg-indigo-50"
                    href={`/projects/${projectId}?note=${note.id}`}
                  >
                    {note.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
