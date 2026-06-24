"""Stage 3 — enrich: messy raw text -> structured catalog fields, via Claude.

This is the step that used to be hand-written, brittle, per-supplier parsing. Here
it's ONE model call with a forced JSON schema (schema.ENRICHMENT_TOOL), so every
supplier's free-text gets turned into the same st*/c*/app*/specs/axes shape.

Resilient by design: if there's no ANTHROPIC_API_KEY (or enrichment is disabled),
rows pass through untouched with enriched=False, so the rest of the pipeline still
runs end-to-end. You can backfill enrichment later by re-running on enriched=False.
"""

from __future__ import annotations

import json
import os

from .schema import ENRICHED_FIELDS, ENRICHMENT_TOOL

MODEL = os.environ.get("ENRICH_MODEL", "claude-opus-4-8")
SYSTEM = (
    "You normalize raw e-commerce supplier data into clean Romanian catalog fields "
    "for a power-tools / equipment shop. Be faithful to the source: never invent "
    "specifications that aren't supported by the input. When a field is genuinely "
    "unknown, return an empty string (for text) or omit it (for axes). All "
    "human-readable output must be in natural Romanian."
)


class Enricher:
    """Lazily-constructed Claude client; no-ops cleanly when unavailable."""

    def __init__(self, enabled: bool = True):
        self.client = None
        self.enabled = enabled and bool(os.environ.get("ANTHROPIC_API_KEY"))
        if self.enabled:
            try:
                import anthropic  # imported lazily so --no-enrich needs no dep
                self.client = anthropic.Anthropic()
            except Exception as exc:  # pragma: no cover - env dependent
                print(f"  [enrich] disabled (anthropic unavailable: {exc})")
                self.enabled = False

    def enrich(self, row: dict, source_text: str) -> dict:
        """Return the row with enriched fields filled in. Mutates a copy."""
        out = dict(row)
        if not self.enabled or not source_text.strip():
            out["enriched"] = False
            return out

        try:
            msg = self.client.messages.create(
                model=MODEL,
                max_tokens=2000,
                system=SYSTEM,
                tools=[ENRICHMENT_TOOL],
                tool_choice={"type": "tool", "name": ENRICHMENT_TOOL["name"]},
                messages=[{
                    "role": "user",
                    "content": (
                        "Raw supplier data for one product:\n\n"
                        f"{source_text}\n\n"
                        "Emit the structured catalog fields."
                    ),
                }],
            )
            data = _extract_tool_input(msg)
        except Exception as exc:
            print(f"  [enrich] row failed, leaving raw ({exc})")
            out["enriched"] = False
            return out

        for key in ENRICHED_FIELDS:
            if key in data and data[key] not in (None, ""):
                out[key] = data[key]
        # Merge structured maps rather than overwrite anything the feed provided.
        out["specs"] = {**(row.get("specs") or {}), **(data.get("specs") or {})}
        out["axes"] = {**(row.get("axes") or {}), **(data.get("axes") or {})}
        out["enriched"] = True
        return out


def _extract_tool_input(msg) -> dict:
    for block in msg.content:
        if getattr(block, "type", None) == "tool_use":
            return block.input
    # Defensive fallback if the model replied with text JSON.
    text = "".join(getattr(b, "text", "") for b in msg.content)
    try:
        return json.loads(text)
    except Exception:
        return {}
