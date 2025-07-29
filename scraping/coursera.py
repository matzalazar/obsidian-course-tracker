import requests
from bs4 import BeautifulSoup
import json
import sys

def scrape_coursera(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
    }
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    title_tag = soup.find("h1")
    title = title_tag.text.strip() if title_tag else "Untitled Course"

    modules = []

    for mod in soup.select("div[data-testid='accordion-item']"):
        h3 = mod.find("h3")
        if not h3:
            continue
        module_title = h3.get_text(strip=True)

        lessons = []
        for li in mod.select("ul li"):
            lesson_title = li.get_text("•", strip=True).split("•")[0].strip()
            duration = "?"
            span_duracion = li.select_one("span span")
            if span_duracion:
                duration = span_duracion.text.strip()

            lessons.append({
                "title": lesson_title,
                "duration": duration
            })

        modules.append({
            "module": module_title,
            "lessons": lessons
        })

    return {
        "title": title,
        "url": url,
        "modules": modules
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python coursera.py <url>")
        sys.exit(1)
    url = sys.argv[1]
    data = scrape_coursera(url)
    print(json.dumps(data, indent=2, ensure_ascii=False))
