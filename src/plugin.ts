import { Plugin, FileSystemAdapter, Notice } from "obsidian";
import { CourseTrackerSettingTab, UrlPromptModal } from "./ui";
import { saveCourse } from "./writer";
import type { CourseTrackerSettings, Course } from "./types";
import * as path from "path";
import * as child_process from "child_process";

const DEFAULT_SETTINGS: CourseTrackerSettings = { pythonPath: "python3" };

export default class CourseTrackerPlugin extends Plugin {
  settings!: CourseTrackerSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new CourseTrackerSettingTab(this.app, this));

    this.addCommand({
      id: "create-course-from-url",
      name: "Create Course from URL",
      callback: async () => {
        new UrlPromptModal(this.app, async (url: string) => {
          if (!url) return;
          new Notice("⏳ Fetching course data...");

          const platform = detectPlatform(url);
          if (platform === "unknown") {
            new Notice("❌ Unrecognized platform. Only Coursera is supported for now.");
            return;
          }

          const adapter = this.app.vault.adapter;
          if (!(adapter instanceof FileSystemAdapter)) {
            new Notice("❌ This plugin only works in Obsidian Desktop.");
            return;
          }

          const scriptPath = path.join(
            adapter.getBasePath(),
            ".obsidian",
            "plugins",
            "obsidian-course-tracker",
            "scraping",
            `${platform}.py`
          );

          try {
            const output = child_process.execSync(
              `${this.settings.pythonPath} "${scriptPath}" "${url}"`,
              { encoding: "utf-8" }
            );
            const course: Course = JSON.parse(output);
            const folder = `Courses/${capitalize(platform)}/${sanitize(course.title)}`;
            await saveCourse(this.app.vault, folder, course);
            new Notice(`✅ Course created: ${folder}`);
          } catch (err) {
            console.error(err);
            new Notice("❌ Failed to process course.");
          }
        }).open();
      },
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

function detectPlatform(url: string): "coursera" | "unknown" {
  if (url.includes("coursera.org")) return "coursera";
  return "unknown";
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function sanitize(input: string | undefined | null): string {
  if (!input || typeof input !== "string") return "Untitled";
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\/\\?%*:|"<>]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}