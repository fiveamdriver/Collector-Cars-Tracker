#!/usr/bin/env python3
"""
Discover BaT keyword_pages IDs for each Porsche model search term.

Hits BaT's autocomplete endpoint for every name defined in bat_ingest.CONFIGS,
prints all matches with their IDs, and rate-limits to avoid being blocked.

Usage (from backend/ directory):
    python data/bat_discover.py

Review the output, pick the correct ID for each model, and update CONFIGS in
bat_ingest.py accordingly. The right ID is not always the first result.
"""
import sys
import time
import os

# Allow running from anywhere under backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.bat_ingest import CONFIGS, discover_keyword_pages, AUTOCOMPLETE_URL

DELAY_BETWEEN_REQUESTS = 2.0  # seconds — enough to avoid rate-limiting


def main() -> None:
    terms = [cfg["name"] for cfg in CONFIGS]
    print(f"Autocomplete endpoint: {AUTOCOMPLETE_URL}?term=<term>")
    print(f"Discovering keyword_pages IDs for {len(terms)} search terms...\n")
    print("=" * 70)

    for i, term in enumerate(terms):
        import urllib.parse
        full_url = f"{AUTOCOMPLETE_URL}?{urllib.parse.urlencode({'term': term})}"
        print(f"\n[{term}]  →  {full_url}")
        matches = discover_keyword_pages(term)

        if not matches:
            print("  (no results)")
        else:
            for m in matches:
                print(f"  id={m['id']!s:<12}  type={m.get('result_type',''):<6}  {m['label']}")

        if i < len(terms) - 1:
            time.sleep(DELAY_BETWEEN_REQUESTS)

    print("\n" + "=" * 70)
    print("Done. Cross-reference IDs with current CONFIGS in bat_ingest.py.")


if __name__ == "__main__":
    main()
