import re

# All known Porsche exterior colors across generations + common PTS colors.
# Ordered longest-first so "Midnight Blue Metallic" is checked before "Blue".
_COLORS = [
    # F/G-Series
    "Bahama Yellow", "Grand Prix White", "Mexico Blue", "Peru Red", "Guards Red",
    "Irish Green", "Sahara Beige", "Light Yellow", "Yellow-Green", "Cockney Brown",
    "Signal Yellow", "Minerva Blue", "Bahia Red", "Orange",
    # 964
    "Dark Blue", "Murano Green", "Apricot Beige", "Speed Yellow", "Rubystone Red",
    "Riviera Blue", "Maritime Blue", "Amazon Green", "Mint Green", "Linen", "Black",
    # 993
    "Midnight Blue Metallic", "Aventurine Green Metallic", "Slate Grey Metallic",
    "Polar Silver Metallic", "Iris Blue Metallic", "Amaranth Violet", "Arena Red",
    # 996
    "Arctic Silver Metallic", "Ocean Blue Metallic", "Zenith Blue Metallic",
    "Turquoise Metallic", "Palladium Metallic", "Vesuvius Metallic",
    "Arena Red Metallic", "Pastel Yellow", "Snow White",
    # 997
    "Basalt Black Metallic", "Lapis Blue Metallic", "Seal Grey Metallic",
    "Atlas Grey Metallic", "Lagoon Green Metallic", "GT Silver Metallic",
    "Carmine Red", "Racing Yellow", "Miami Blue", "Aqua Blue Metallic",
    "Carrara White",
    # 991/992
    "Agate Grey Metallic", "Gentian Blue Metallic", "Dolomite Silver Metallic",
    "Python Green", "Shark Blue", "Frozen Blue", "Chalk",
    # PTS
    "Fayence Yellow", "Talbot Yellow", "Viper Green", "Tangerine", "Maritim Blue",
    "Acid Green", "Lime Gold", "Oak Green Metallic", "Brewster Green",
    "Cobalt Blue", "Ultraviolet",
]

# Deduplicate while preserving first occurrence, then sort longest-first.
_seen: set[str] = set()
_unique: list[str] = []
for _c in _COLORS:
    if _c.lower() not in _seen:
        _seen.add(_c.lower())
        _unique.append(_c)

COLORS = sorted(_unique, key=len, reverse=True)
_COLORS_LOWER = {c.lower(): c for c in COLORS}

# Patterns used to strip non-color prefixes that appear before the year.
_YEAR_RE      = re.compile(r'\b(19|20)\d{2}\b')
_MILEAGE_RE   = re.compile(r'^\s*[\d,]+k?-(?:Mile|Kilometer)\s+', re.IGNORECASE)
_NORESERVE_RE = re.compile(r'^\s*No\s+Reserve:\s*', re.IGNORECASE)

# Fallback: 1–2 Title-Case words followed by a common color word.
# Catches unknown PTS/special colors like "Oslo Blue", "Nardo Grey", "Gray Black".
_COLOR_WORD_RE = re.compile(
    r'^(?:[A-Z][a-zA-Z-]+ ){1,2}'
    r'(?:Blue|Green|Red|Grey|Gray|Silver|Yellow|White|Black|Brown|'
    r'Orange|Purple|Violet|Gold|Beige|Tan|Teal|Pink|Turquoise|Metallic)$'
)


def parse_exterior_color(title: str | None) -> str | None:
    """
    Extract the exterior color from a BaT lot title.

    Colors appear as a prefix before the model year:
        "Speed Yellow 2024 Porsche 911 GT3 RS Weissach"
        "752-Mile Gulf Blue 2023 Porsche 911 GT3 Touring"

    Known list is checked first; unknown PTS colors are caught by the
    fallback pattern (1–2 Title-Case words + common color word).
    """
    if not title:
        return None

    m = _YEAR_RE.search(title)
    if not m:
        return None

    prefix = title[:m.start()]
    prefix = _MILEAGE_RE.sub('', prefix)
    prefix = _NORESERVE_RE.sub('', prefix)
    prefix = prefix.strip()

    if not prefix:
        return None

    # Known list takes priority — returns canonical casing.
    known = _COLORS_LOWER.get(prefix.lower())
    if known:
        return known

    # Fallback: preserve the title's own casing for unknown colors.
    if _COLOR_WORD_RE.match(prefix):
        return prefix

    return None
