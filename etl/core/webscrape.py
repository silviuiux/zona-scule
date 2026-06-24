"""Polite HTTP fetcher with on-disk caching, used by supplier resolvers.

Runs on YOUR machine (network access required) — not needed for --dry-run/--no-scrape.
The cache means re-runs and crashes don't re-hit the supplier site for pages already
fetched, and variants that share a product page only download once.
"""

from __future__ import annotations

import hashlib
import time
from pathlib import Path


class HttpFetcher:
    def __init__(self, cache_dir: str = ".scrape_cache", delay: float = 0.5,
                 timeout: float = 20.0, user_agent: str | None = None):
        self.cache = Path(cache_dir)
        self.cache.mkdir(parents=True, exist_ok=True)
        self.delay = delay
        self.timeout = timeout
        self.ua = user_agent or "ZonaSculeETL/1.0 (+catalog import; contact site owner)"
        self._session = None
        self.hits = 0
        self.misses = 0

    def _session_obj(self):
        if self._session is None:
            import requests  # lazy: only needed for a real scrape run
            self._session = requests.Session()
            self._session.headers.update({"User-Agent": self.ua})
        return self._session

    def get(self, url: str) -> str | None:
        """Return page text (from cache if present), or None on failure/404."""
        key = self.cache / (hashlib.sha1(url.encode()).hexdigest() + ".html")
        if key.exists():
            self.hits += 1
            return key.read_text(encoding="utf-8")
        try:
            resp = self._session_obj().get(url, timeout=self.timeout, allow_redirects=True)
        except Exception:
            self.misses += 1
            return None
        time.sleep(self.delay)  # be polite
        if resp.status_code != 200 or not resp.text:
            self.misses += 1
            return None
        key.write_text(resp.text, encoding="utf-8")
        self.misses += 1
        return resp.text
