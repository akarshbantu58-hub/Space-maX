#!/usr/bin/env python3
"""Offline validation for the Space-maX starter content catalog.

This checks data shape and unique IDs; it does not claim the game has 150 parts
or 20 planets yet. Run with: python3 tools/validate_catalog.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "godot-game" / "data" / "parts_catalog.json"


def main() -> int:
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    for collection_name in ("parts", "planets"):
        entries = data.get(collection_name)
        if not isinstance(entries, list) or not entries:
            raise SystemExit(f"FAIL: {collection_name} must be a non-empty list")
        ids = [entry.get("id") for entry in entries]
        if any(not isinstance(item, str) or not item.strip() for item in ids):
            raise SystemExit(f"FAIL: every {collection_name} entry needs a non-empty id")
        if len(ids) != len(set(ids)):
            raise SystemExit(f"FAIL: duplicate id in {collection_name}")
        for entry in entries:
            if not entry.get("name"):
                raise SystemExit(f"FAIL: unnamed entry in {collection_name}: {entry}")
    print(f"PASS: {len(data['parts'])} starter parts; {len(data['planets'])} starter planets")
    print("NOTE: starter catalog only; target catalog expansion is a later milestone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
