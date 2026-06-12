#!/usr/bin/env python3
"""
Migration: add exterior_color column to auction_results and backfill from lot_title.

Usage (from backend/ directory):
    python data/migrate_color.py
"""
import os
import sqlite3
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

from app.config import DATABASE_PATH
from app.utils.color_parser import parse_exterior_color

DB_PATH = DATABASE_PATH


def get_columns(cur, table: str) -> list[str]:
    cur.execute(f"PRAGMA table_info({table})")
    return [row[1] for row in cur.fetchall()]


def main() -> None:
    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()

    if "exterior_color" not in get_columns(cur, "auction_results"):
        cur.execute("ALTER TABLE auction_results ADD COLUMN exterior_color TEXT")
        conn.commit()
        print("Added column: exterior_color")
    else:
        print("Column exterior_color already exists — skipping ALTER TABLE")

    cur.execute("SELECT id, lot_title FROM auction_results")
    rows = cur.fetchall()

    updates = [(parse_exterior_color(title), id_) for id_, title in rows]
    matched = sum(1 for color, _ in updates if color is not None)

    cur.executemany(
        "UPDATE auction_results SET exterior_color = ? WHERE id = ?",
        updates,
    )
    conn.commit()
    conn.close()

    print(f"Backfilled {len(rows)} records — {matched} colors detected ({len(rows) - matched} null)")
    print(f"Database: {DB_PATH}")


if __name__ == "__main__":
    main()
