// src/ui.ts
import { Modal, Setting, App, PluginSettingTab, Notice, TFile } from "obsidian";
import type CourseTrackerPlugin from "./plugin";
import * as fs from "fs";
import * as path from "path";
import type { FileSystemAdapter } from "obsidian";

export class UrlPromptModal extends Modal {
  url = "";
  constructor(app: App, private onSubmit: (url: string) => void) {
    super(app);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Enter Coursera Course URL" });
    new Setting(contentEl)
      .setName("URL")
      .addText(text =>
        text
          .setPlaceholder("https://www.coursera.org/…")
          .onChange(val => (this.url = val))
      );
    new Setting(contentEl).addButton(btn =>
      btn.setButtonText("Submit").setCta().onClick(() => {
        this.close();
        this.onSubmit(this.url);
      })
    );
  }
  onClose() {
    this.contentEl.empty();
  }
}

export class CourseTrackerSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: CourseTrackerPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Course Tracker Settings" });

    // Python interpreter path setting
    new Setting(containerEl)
      .setName("Python Path")
      .setDesc("Used to run coursera.py")
      .addText(text =>
        text
          .setPlaceholder("python3 or full path")
          .setValue(this.plugin.settings.pythonPath)
          .onChange(async value => {
            this.plugin.settings.pythonPath = value;
            await this.plugin.saveSettings();
          })
      );

    // Button to download/update coursera.py from CDN
    new Setting(containerEl)
      .setName("Update coursera.py")
      .setDesc("Download the latest coursera.py script from the repo via jsDelivr")
      .addButton(btn =>
        btn
          .setButtonText("Download")
          .onClick(async () => {
            const url = "https://cdn.jsdelivr.net/gh/matzalazar/obsidian-course-tracker/scraping/coursera.py";
            new Notice("⏳ Downloading coursera.py…");
            try {
              // 1) Fetch from CDN with caching
              const res = await fetch(url, { cache: "force-cache" });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const text = await res.text();

              // 2) Calculate absolute path to plugin directory
              const adapter = this.plugin.app.vault.adapter as FileSystemAdapter;
              const basePath = adapter.getBasePath();
              const scrapingDir = path.join(
                basePath,
                ".obsidian",
                "plugins",
                "obsidian-course-tracker",
                "scraping"
              );
              const targetFile = path.join(scrapingDir, "coursera.py");

              // 3) Ensure scraping/ folder exists
              await fs.promises.mkdir(scrapingDir, { recursive: true });

              // 4) Write (or overwrite) coursera.py
              await fs.promises.writeFile(targetFile, text, "utf8");

              new Notice("✅ coursera.py updated!");
            } catch (e) {
              console.error(e);
              new Notice("❌ Failed to download coursera.py");
            }
          })
      );
  }
}
