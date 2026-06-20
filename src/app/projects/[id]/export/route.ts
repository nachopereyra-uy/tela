import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listEdges } from "@/server/edges";
import { listNotes } from "@/server/notes";
import { getProject } from "@/server/projects";

type ExportRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function safeFilename(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(_request: Request, { params }: ExportRouteContext) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await getProject(user.id, id);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [notes, edges] = await Promise.all([
    listNotes(user.id, id),
    listEdges(user.id, id),
  ]);
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    project,
    notes,
    edges,
  };
  const filename = `${safeFilename(project.name) || "tela-proyecto"}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
