"""
Medical Web Scraper — uses Selenium + BeautifulSoup.
If Chrome/ChromeDriver crashes for any reason, falls back to Wikipedia API.
"""
import json
import urllib.request
import urllib.parse
import ssl

# ─── Selenium imports (graceful if not installed) ───────────────────────────
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from webdriver_manager.chrome import ChromeDriverManager
    from bs4 import BeautifulSoup
    import time
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False


def _build_chrome_options():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--disable-extensions")
    opts.add_argument("--disable-software-rasterizer")
    opts.add_argument("--window-size=1280,800")
    opts.add_argument("--log-level=3")
    opts.add_argument("--silent")
    opts.add_experimental_option("excludeSwitches", ["enable-logging"])
    return opts


def _scrape_with_selenium(query):
    """Selenium scraper: fetches Mayo Clinic article for the given query."""
    opts = _build_chrome_options()
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=opts,
    )
    try:
        search_url = f"https://www.google.com/search?q={urllib.parse.quote_plus(query)}+symptoms+treatment+site:mayoclinic.org"
        driver.get(search_url)
        time.sleep(2)

        # Grab first Mayo Clinic result link
        links = driver.find_elements(By.CSS_SELECTOR, "a[href*='mayoclinic.org']")
        target_url = None
        for link in links:
            href = link.get_attribute("href") or ""
            if "mayoclinic.org/diseases-conditions" in href or "mayoclinic.org/symptoms" in href:
                target_url = href
                break

        if not target_url:
            return None  # signal caller to use fallback

        driver.get(target_url)
        time.sleep(2)

        soup = BeautifulSoup(driver.page_source, "html.parser")
        title = soup.find("h1").get_text(strip=True) if soup.find("h1") else query.title()

        blocks = soup.find_all(["p", "h2", "h3", "ul", "li"])
        text = ""
        for b in blocks:
            t = b.get_text(strip=True)
            if len(t) > 40:
                text += t + "\n\n"
            if len(text) > 2500:
                break

        return {"title": title, "content": text.strip(), "source": target_url}

    finally:
        driver.quit()


def _scrape_with_wikipedia(query):
    """Fallback: Wikipedia Open Search + Extract API."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    headers = {"User-Agent": "HospitallyBot/2.0 (medical-assistant)"}

    # Search
    encoded = urllib.parse.quote(query)
    search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={encoded}&limit=1&format=json"
    req = urllib.request.Request(search_url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
        data = json.loads(r.read().decode())

    if not data[1]:
        return {"error": f"No results found for: {query}"}

    title = data[1][0]
    wiki_url = data[3][0]

    # Extract
    extract_url = f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles={urllib.parse.quote(title)}&format=json"
    req2 = urllib.request.Request(extract_url, headers=headers)
    with urllib.request.urlopen(req2, context=ctx, timeout=10) as r2:
        extract = json.loads(r2.read().decode())

    pages = extract.get("query", {}).get("pages", {})
    page = list(pages.values())[0]
    content = page.get("extract", "No description available.").strip()

    return {"title": title, "content": content, "source": wiki_url}


def scrape_medical_data(query):
    """
    Main entry: tries Selenium (Mayo Clinic) first, falls back to Wikipedia API.
    Always returns: { title, content, source } or { error }.
    """
    if SELENIUM_AVAILABLE:
        try:
            result = _scrape_with_selenium(query)
            if result:
                return result
            # Mayo Clinic link not found, use fallback
        except Exception as e:
            print(f"[Selenium] Error: {e} — switching to fallback")

    # Fallback
    try:
        return _scrape_with_wikipedia(query)
    except Exception as e:
        import traceback
        print(f"[Fallback] Error:\n{traceback.format_exc()}")
        return {"error": str(e)}
