// src/writer.ts
import { TFile, Vault } from "obsidian";
import type { Course } from "./types";

export async function writeToVault(
  vault: Vault,
  folderPath: string,
  fileName: string,
  content: string
) {
  const folderParts = folderPath.split("/");
  let currentPath = "";
  for (const part of folderParts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    if (!vault.getAbstractFileByPath(currentPath)) {
      await vault.createFolder(currentPath);
    }
  }
  const fullPath = `${folderPath}/${fileName}`;
  const existing = vault.getAbstractFileByPath(fullPath);
  if (existing instanceof TFile) {
    await vault.modify(existing, content);
  } else {
    await vault.create(fullPath, content);
  }
}

export async function saveCourse(vault: Vault, baseFolder: string, course: Course) {
  const indexLines: string[] = [];
  indexLines.push(`# 📘 ${course.title}\n`);
  indexLines.push(`**Course link:** [Go to course](${course.url})\n`);
  indexLines.push(`---\n`);

  for (let i = 0; i < course.modules.length; i++) {
    const mod = course.modules[i];
    if (!mod.lessons?.length) continue;

    const modSlug = `${String(i).padStart(2, "0")} ${sanitize(mod.module)}`;
    const modPath = `${baseFolder}/${modSlug}`;
    indexLines.push(`## ${mod.module}\n`);

    for (let j = 0; j < mod.lessons.length; j++) {
      const lec = mod.lessons[j];
      const lecSlug = `${String(j).padStart(2, "0")} ${sanitize(lec.title)}`;
      const link = `[[${modSlug}/${lecSlug}]]`;
      indexLines.push(`- ${link} — _${lec.duration}_`);

      const yaml = `---\ntitle: "${lec.title}"\nduration: "${lec.duration}"\ndate: null\n---\n`;
      const body = `# ${lec.title}\n\nDuration: ${lec.duration}\n`;
      await writeToVault(vault, modPath, `${lecSlug}.md`, `${yaml}\n${body}`);
    }

    indexLines.push("");
  }

  await writeToVault(vault, baseFolder, `_index.md`, indexLines.join("\n"));
}

function sanitize(input: string | undefined | null): string {
  if (!input || typeof input !== "string") return "Untitled";
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\/\\?%*:|"<>]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
