# scout/morning_runner.py — discovery-related helpers + constants (module-level; needs file imports from full module)

SCRIPT_DIR = Path(__file__).resolve().parent
CONFIG_PATH = SCRIPT_DIR / "config.json"
CITY_DATASET_PATH = SCRIPT_DIR / "cities_dataset.json"
CASES_DIR = SCRIPT_DIR / "cases"
CASE_FILES_DIR = SCRIPT_DIR / "case_files"
TODAY_PATH = SCRIPT_DIR / "today.json"
OPPORTUNITIES_PATH = SCRIPT_DIR / "opportunities.json"
CHAIN_CLUES = ["mcdonald", "starbucks", "subway", "dunkin", "walmart", "target", "chain", "franchise"]

# Template-like prefixes from mock data; skip these (not real Places results)
WEAK_NAME_PREFIXES = ("family ", "main street ", "local ", "downtown ")
# Default Google Places text-search terms per city/area (broad small-business pack).
# Flow: run all terms → merge → dedupe by place_id → then small-business / website / contact filters.
DEFAULT_SMALL_BUSINESS_SEARCH_TERMS = [
    "pressure washing",
    "landscaping",
    "roofing",
    "hvac",
    "plumbing",
    "car detailing",
    "salon",
    "barbershop",
    "med spa",
    "daycare",
    "pet grooming",
    "auto repair",
    "mechanic",
    "towing",
    "painting contractor",
    "flooring contractor",
    "electrician",
    "handyman",
    "pest control",
    "house cleaning",
    "junk removal",
    "moving company",
    "pool service",
    "tree service",
    "florist",
    "bakery",
    "cafe",
    "local restaurant",
    "chiropractor",
    "dentist",
    "boutique",
]

DEFAULT_DISCOVERY_CATEGORIES = list(DEFAULT_SMALL_BUSINESS_SEARCH_TERMS)
DEFAULT_TARGET_INDUSTRIES = ",".join(DEFAULT_SMALL_BUSINESS_SEARCH_TERMS)
DEFAULT_MULTI_CITY_SEQUENCE = [
    "Hot Springs",
    "Hot Springs Village",
    "Malvern",
    "Benton",
    "Bryant",
    "Little Rock",
    "Arkadelphia",
    "Sheridan",
]
ARKANSAS_CITIES_STATEWIDE = [
    "Little Rock",
    "Fort Smith",
    "Fayetteville",
    "Springdale",
    "Rogers",
    "Conway",
    "Jonesboro",
    "North Little Rock",
    "Bentonville",
    "Pine Bluff",
    "Hot Springs",
    "Texarkana",
    "Benton",
    "Sherwood",
    "Jacksonville",
    "Russellville",
    "Bryant",
    "Cabot",
    "Van Buren",
    "Searcy",
    "Hot Springs Village",
    "Malvern",
    "Arkadelphia",
    "El Dorado",
    "Magnolia",
    "Mountain Home",
    "Harrison",
    "Batesville",
    "Forrest City",
    "Paragould",
    "West Memphis",
    "Stuttgart",
    "Camden",
    "Hope",
    "Clarksville",
    "Monticello",
    "Helena",
    "Dumas",
    "Morrilton",
    "Greenwood",
]
ARKANSAS_REGION_CITIES = {
    "northwest": [
        "Fayetteville",
        "Springdale",
        "Rogers",
        "Bentonville",
        "Harrison",
        "Mountain Home",
    ],
    "central": [
        "Little Rock",
        "North Little Rock",
        "Conway",
        "Benton",
        "Sherwood",
        "Jacksonville",
        "Bryant",
        "Cabot",
        "Searcy",
        "Morrilton",
    ],
    "river_valley": [
        "Fort Smith",
        "Van Buren",
        "Russellville",
        "Clarksville",
        "Greenwood",
    ],
    "delta": [
        "Jonesboro",
        "Forrest City",
        "Paragould",
        "West Memphis",
        "Helena",
        "Stuttgart",
    ],
    "south": [
        "Pine Bluff",
        "Texarkana",
        "El Dorado",
        "Magnolia",
        "Camden",
        "Hope",
        "Monticello",
        "Dumas",
    ],
    "ouachita": [
        "Hot Springs",
        "Hot Springs Village",
        "Malvern",
        "Arkadelphia",
        "Batesville",
    ],
}
HOT_SPRINGS_NEARBY_CITIES = [
    "Hot Springs Village",
    "Malvern",
    "Benton",
    "Bryant",
    "Little Rock",
    "Arkadelphia",
    "Sheridan",
]
LOW_PRIORITY_INDUSTRIES = {
    "law firms",
    "marketing agencies",
    "software companies",
    "consultants",
    "large franchises",
}

HIGH_CLOSE_CATEGORIES = {
    "dentists",
    "chiropractors",
    "restaurants",
    "cafes",
    "gyms",
    "hair salons",
    "barbershops",
    "auto repair",
    "mechanics",
    "body shops",
    "tire shops",
    "plumbers",
    "roofing",
    "hvac",
    "electricians",
    "landscaping",
    "cleaning services",
    "pressure washing",
    "contractors",
    "med spa",
    "daycare",
    "pet grooming",
    "towing",
    "painters",
    "flooring",
    "handyman",
    "pest control",
    "house cleaning",
    "junk removal",
    "moving companies",
    "pool service",
    "tree service",
    "florists",
    "bakeries",
    "boutiques",
    "churches",
    "car detailing",
}
PRIORITY_INDUSTRY_CATEGORIES = {
    "roofing",
    "hvac",
    "electricians",
    "plumbers",
    "landscaping",
    "cleaning services",
    "pressure washing",
    "auto repair",
    "mechanics",
    "churches",
    "restaurants",
    "cafes",
    "hair salons",
    "barbershops",
    "dentists",
    "chiropractors",
    "med spa",
    "daycare",
    "pet grooming",
    "towing",
    "painters",
    "flooring",
    "handyman",
    "pest control",
    "house cleaning",
    "junk removal",
    "moving companies",
    "pool service",
    "tree service",
    "florists",
    "bakeries",
    "boutiques",
    "car detailing",
}
ONLINE_ONLY_NAME_CLUES = (
    "saas",
    "e-commerce",
    "ecommerce",
    "dropship",
    "dropshipping",
    "online only",
    "digital agency",
    "software development",
    "app development",
    "web development company",
    "marketing agency",
    "seo agency",
    "nft ",
    "crypto ",
    "amazon fba",
)


def _looks_online_only_business(name: str, category: str) -> bool:
    blob = f"{name} {category}".lower()
    return any(clue in blob for clue in ONLINE_ONLY_NAME_CLUES)


def _has_standalone_website_url(place: dict) -> bool:
    w = str(place.get("website") or "").strip().lower()
    if not w:
        return False
    if "facebook.com" in w or "fb.com" in w:
        return False
    return bool(w.startswith("http") or "." in w)


def _scout_brain_category_summary(rows: list[dict], *, max_keys: int = 80) -> dict[str, int]:
    """Histogram of Places search category labels (pre downstream filtering)."""
    hist: dict[str, int] = {}
    for p in rows:
        k = str(p.get("category") or "(unknown)").strip() or "(unknown)"
        hist[k] = hist.get(k, 0) + 1
    items = sorted(hist.items(), key=lambda kv: (-kv[1], kv[0]))
    return dict(items[:max_keys])


def _has_discovery_contact_row(place: dict) -> bool:
    return bool(
        str(place.get("phone") or "").strip()
        or str(place.get("website") or "").strip()
        or str(place.get("maps_url") or place.get("maps_link") or "").strip()
    )


EASY_CLOSE_CATEGORIES = {
    "plumbers",
    "roofing",
    "hvac",
    "electricians",
    "landscaping",
    "cleaning services",
    "pressure washing",
    "auto repair",
    "mechanics",
    "churches",
    "restaurants",
    "cafes",
    "hair salons",
    "barbershops",
    "dentists",
    "chiropractors",
    "med spa",
    "daycare",
    "pet grooming",
    "towing",
    "painters",
    "flooring",
    "handyman",
    "pest control",
    "house cleaning",
    "junk removal",
    "moving companies",
    "pool service",
    "tree service",
    "florists",
    "bakeries",
    "boutiques",
    "gyms",
    "body shops",
    "tire shops",
    "local retail shops",
    "car detailing",
}
def _is_chain(name: str) -> bool:
    if not name:
        return False
    lower = name.lower()
    return any(c in lower for c in CHAIN_CLUES)


def _preferred_industry_terms() -> list[str]:
    raw = (
        os.environ.get("SCOUT_TARGET_INDUSTRIES")
        or DEFAULT_TARGET_INDUSTRIES
    )
    return [part.strip().lower() for part in str(raw).split(",") if part.strip()]


def _normalize_industry(value: str) -> str:
    text = str(value or "").strip().lower()
    if not text:
        return ""
    aliases = {
        "restaurant": "restaurants",
        "restaurants": "restaurants",
        "cafe": "cafes",
        "cafes": "cafes",
        "coffee shop": "cafes",
        "bakery": "bakeries",
        "bakeries": "bakeries",
        "plumber": "plumbers",
        "plumbers": "plumbers",
        "plumbing": "plumbers",
        "hvac": "hvac",
        "hvac service": "hvac",
        "hvac contractor": "hvac",
        "heating and air": "hvac",
        "heating and cooling": "hvac",
        "electrician": "electricians",
        "electricians": "electricians",
        "roofing contractor": "roofing",
        "roofing contractors": "roofing",
        "roofer": "roofing",
        "roofing": "roofing",
        "auto repair": "auto repair",
        "mechanic": "mechanics",
        "mechanics": "mechanics",
        "body shop": "body shops",
        "body shops": "body shops",
        "tire shop": "tire shops",
        "tire shops": "tire shops",
        "landscaper": "landscaping",
        "landscaping": "landscaping",
        "cleaning service": "cleaning services",
        "cleaning services": "cleaning services",
        "pressure washing": "pressure washing",
        "pressure washer": "pressure washing",
        "pressure washers": "pressure washing",
        "boutique": "boutiques",
        "boutiques": "boutiques",
        "florist": "florists",
        "florists": "florists",
        "hair salon": "hair salons",
        "hair salons": "hair salons",
        "salon": "hair salons",
        "barbershop": "barbershops",
        "barbershops": "barbershops",
        "daycare": "daycare",
        "child care": "daycare",
        "childcare": "daycare",
        "dog grooming": "pet grooming",
        "pet grooming": "pet grooming",
        "painter": "painters",
        "painters": "painters",
        "painting": "painters",
        "painting contractor": "painters",
        "flooring contractor": "flooring",
        "car detailing": "car detailing",
        "auto detailing": "car detailing",
        "moving company": "moving companies",
        "moving companies": "moving companies",
        "movers": "moving companies",
        "pool service": "pool service",
        "pool cleaning": "pool service",
        "tree service": "tree service",
        "tree trimming": "tree service",
        "tree removal": "tree service",
        "house cleaning": "house cleaning",
        "maid service": "house cleaning",
        "maids": "house cleaning",
        "junk removal": "junk removal",
        "towing": "towing",
        "tow company": "towing",
        "tow truck": "towing",
        "handyman": "handyman",
        "handy man": "handyman",
        "pest control": "pest control",
        "exterminator": "pest control",
        "local restaurant": "restaurants",
        "dentist": "dentists",
        "dentists": "dentists",
        "chiropractor": "chiropractors",
        "chiropractors": "chiropractors",
        "small law firm": "law firms",
        "lawyer": "law firms",
        "law firms": "law firms",
        "med spa": "med spa",
        "medical spa": "med spa",
        "med spas": "med spa",
        "medical spas": "med spa",
        "marketing agency": "marketing agencies",
        "marketing agencies": "marketing agencies",
        "software company": "software companies",
        "software companies": "software companies",
        "consultant": "consultants",
        "consultants": "consultants",
        "franchise": "large franchises",
        "large franchise": "large franchises",
        "large franchises": "large franchises",
        "church": "churches",
        "churches": "churches",
        "small restaurant": "restaurants",
        "local retail shops": "local retail shops",
        "retail": "local retail shops",
        "flooring": "flooring",
        "floor installation": "flooring",
    }
    return aliases.get(text, text)


def _industry_is_preferred(value: str) -> bool:
    normalized = _normalize_industry(value)
    preferred = {_normalize_industry(term) for term in _preferred_industry_terms()}
    if not normalized:
        return False
    return normalized in preferred


def _industry_is_lower_priority(value: str) -> bool:
    normalized = _normalize_industry(value)
    return normalized in {_normalize_industry(v) for v in LOW_PRIORITY_INDUSTRIES}


def _industry_is_high_close_probability(value: str) -> bool:
    normalized = _normalize_industry(value)
    if normalized in HIGH_CLOSE_CATEGORIES:
        return True
    return "contractor" in normalized


def _is_easy_close_category(value: str) -> bool:
    normalized = _normalize_industry(value)
    if not normalized:
        return False
    return normalized in EASY_CLOSE_CATEGORIES


def _derive_easy_target_reasons(lead: dict, website_quality: dict | None = None) -> list[str]:
    website_quality = website_quality or {}
    website = str(lead.get("website") or "").strip()
    facebook_url = str(lead.get("facebook") or lead.get("facebook_url") or "").strip()
    has_website = bool(website) and not bool(lead.get("no_website"))
    fetch_ok = lead.get("fetch_ok")
    ssl_ok = lead.get("ssl_ok")
    viewport_ok = lead.get("viewport_ok")
    mobile_score = _as_int(lead.get("mobile_score"), 100)
    contact_page = str(lead.get("contact_page") or "").strip()
    contact_form_present = bool(lead.get("contact_form_present"))
    contact_page_present = bool(contact_page or contact_form_present)
    contact_depth = _as_int(lead.get("contact_link_depth"), 1)
    website_status = str(website_quality.get("website_status") or lead.get("website_status") or "").strip().lower()
    reasons: list[str] = []
    if not has_website and facebook_url:
        reasons.append("Facebook-only presence")
    elif not has_website:
        reasons.append("No website found")
    if has_website and (fetch_ok is False or website_status in {"unreachable", "broken_website"}):
        reasons.append("Website unreachable")
    if has_website and (website.lower().startswith("http://") or ssl_ok is False):
        reasons.append("Website uses insecure HTTP")
    if has_website and (not contact_page_present or contact_depth >= 3):
        reasons.append("Contact page missing")
    if has_website and (viewport_ok is False or mobile_score < 50):
        reasons.append("Mobile layout broken")
    return list(dict.fromkeys(reasons))


def _resolve_discovery_categories(config: dict) -> list[str]:
    configured = config.get("categories", DEFAULT_DISCOVERY_CATEGORIES)
    configured_list = [str(c).strip() for c in configured if str(c).strip()]
    preferred = [term for term in _preferred_industry_terms() if term]
    ordered: list[str] = []
    seen: set[str] = set()

    # Preferred industries first.
    for term in preferred:
        norm = _normalize_industry(term)
        if not norm:
            continue
        if norm not in seen:
            ordered.append(term)
            seen.add(norm)

    # Include any configured categories not already covered.
    for category in configured_list:
        norm = _normalize_industry(category)
        if not norm:
            continue
        if norm not in seen:
            ordered.append(category)
            seen.add(norm)

    # Always merge the default small-business discovery list so a single niche from UI
    # still runs many category queries per city (deduped by normalized industry).
    for category in DEFAULT_DISCOVERY_CATEGORIES:
        norm = _normalize_industry(category)
        if not norm:
            continue
        if norm not in seen:
            ordered.append(category)
            seen.add(norm)

    return ordered or list(DEFAULT_DISCOVERY_CATEGORIES)
def _haversine_miles(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    radius_miles = 3958.8
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_miles * c


def _quick_site_precheck(url: str, timeout: int = 3) -> dict:
    result = {
        "unreachable": False,
        "http_status": None,
        "ssl_issue": str(url or "").strip().lower().startswith("http://"),
    }
    target = str(url or "").strip()
    if not target:
        result["unreachable"] = True
        return result
    try:
        req = urllib_request.Request(
            target,
            headers={"User-Agent": "Mozilla/5.0 Scout-Brain/1.0"},
            method="GET",
        )
        with urllib_request.urlopen(req, timeout=max(1, timeout)) as resp:
            result["http_status"] = int(getattr(resp, "status", 200) or 200)
    except urllib_error.HTTPError as e:
        result["http_status"] = int(getattr(e, "code", 0) or 0)
        result["unreachable"] = result["http_status"] >= 400 or result["http_status"] == 0
    except Exception:
        result["unreachable"] = True
    return result


def load_config():
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(f"Config not found: {CONFIG_PATH}")
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def load_city_dataset() -> list[dict]:
    if not CITY_DATASET_PATH.exists():
        return []
    with open(CITY_DATASET_PATH, encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        return []
    out = []
    for row in data:
        if not isinstance(row, dict):
            continue
        name = str(row.get("city_name") or "").strip()
        state = str(row.get("state") or "").strip()
        if not name:
            continue
        try:
            lat = float(row.get("latitude")) if row.get("latitude") is not None else None
            lng = float(row.get("longitude")) if row.get("longitude") is not None else None
        except Exception:
            lat = None
            lng = None
        out.append(
            {
                "city_name": name,
                "state": state,
                "latitude": lat,
                "longitude": lng,
                "population": int(row.get("population") or 0),
            }
        )
    return out


def _resolve_target_cities(config: dict) -> list[dict]:
    multi_city_enabled = bool(config.get("multi_city_enabled", False))
    home_city = str(config.get("home_city") or "City").strip()
    if not multi_city_enabled:
        return [{"city_name": home_city, "state": "", "latitude": None, "longitude": None, "population": 0}]

    dataset = load_city_dataset()
    if not dataset:
        return [{"city_name": home_city, "state": "", "latitude": None, "longitude": None, "population": 0}]
    city_radius = float(os.environ.get("SCOUT_CITY_RADIUS", "80") or "80")

    explicit_targets = config.get("target_cities") or []
    requested_region = str(os.environ.get("SCOUT_REGION_OVERRIDE", "") or "").strip().lower()
    if requested_region == "all_arkansas":
        explicit_targets = [{"city_name": city, "state": "AR"} for city in ARKANSAS_CITIES_STATEWIDE]
    elif requested_region in ARKANSAS_REGION_CITIES:
        explicit_targets = [
            {"city_name": city, "state": "AR"} for city in ARKANSAS_REGION_CITIES.get(requested_region, [])
        ]
    if not explicit_targets and bool(config.get("scan_statewide_arkansas", False)):
        explicit_targets = [{"city_name": city, "state": "AR"} for city in ARKANSAS_CITIES_STATEWIDE]
    selected = []
    dataset_by_key = {
        f"{r['city_name'].lower()}|{r['state'].lower()}": r for r in dataset
    }
    for t in explicit_targets:
        if isinstance(t, str):
            city_name = t.strip()
            state = ""
        elif isinstance(t, dict):
            city_name = str(t.get("city_name") or t.get("city") or "").strip()
            state = str(t.get("state") or "").strip()
        else:
            continue
        if not city_name:
            continue
        row = dataset_by_key.get(f"{city_name.lower()}|{state.lower()}")
        selected.append(row or {"city_name": city_name, "state": state, "latitude": None, "longitude": None, "population": 0})

    nearby_seed = str(config.get("nearby_city_seed") or "").strip()
    if not selected and home_city.strip().lower().startswith("hot springs"):
        for city_name in DEFAULT_MULTI_CITY_SEQUENCE:
            row = next((r for r in dataset if str(r.get("city_name") or "").strip().lower() == city_name.lower()), None)
            selected.append(
                row
                or {
                    "city_name": city_name,
                    "state": "AR",
                    "latitude": None,
                    "longitude": None,
                    "population": 0,
                }
            )

    if not selected:
        max_cities = max(1, int(config.get("max_cities_per_run", 5)))
        ranked = sorted(dataset, key=lambda r: int(r.get("population") or 0), reverse=True)
        selected = ranked[:max_cities]

    # Expand nearby cities when home city is Hot Springs (legacy behavior).
    if home_city.strip().lower().startswith("hot springs"):
        seed = None
        for row in selected:
            if str(row.get("city_name") or "").strip().lower() == "hot springs":
                seed = row
                break
        if seed is None:
            seed = next((r for r in dataset if str(r.get("city_name") or "").strip().lower() == "hot springs"), None)
        seen = {str(r.get("city_name") or "").strip().lower() for r in selected}
        for city_name in HOT_SPRINGS_NEARBY_CITIES:
            match = next((r for r in dataset if str(r.get("city_name") or "").strip().lower() == city_name.lower()), None)
            if (
                match
                and seed
                and seed.get("latitude") is not None
                and seed.get("longitude") is not None
                and match.get("latitude") is not None
                and match.get("longitude") is not None
            ):
                try:
                    distance = _haversine_miles(
                        float(seed.get("latitude")),
                        float(seed.get("longitude")),
                        float(match.get("latitude")),
                        float(match.get("longitude")),
                    )
                    if distance > city_radius:
                        continue
                except Exception:
                    pass
            if city_name.lower() in seen:
                continue
            selected.append(
                match
                or {
                    "city_name": city_name,
                    "state": "AR",
                    "latitude": None,
                    "longitude": None,
                    "population": 0,
                }
            )
            seen.add(city_name.lower())

    # Generic nearby-city expansion when explicitly requested by scan settings.
    if nearby_seed:
        seed = next((r for r in dataset if str(r.get("city_name") or "").strip().lower() == nearby_seed.lower()), None)
        if seed:
            seed_lat = seed.get("latitude")
            seed_lng = seed.get("longitude")
            seen = {str(r.get("city_name") or "").strip().lower() for r in selected}
            candidates: list[tuple[float, dict]] = []
            for row in dataset:
                city_name = str(row.get("city_name") or "").strip()
                if not city_name or city_name.lower() in seen or city_name.lower() == nearby_seed.lower():
                    continue
                if seed_lat is None or seed_lng is None or row.get("latitude") is None or row.get("longitude") is None:
                    continue
                try:
                    distance = _haversine_miles(float(seed_lat), float(seed_lng), float(row.get("latitude")), float(row.get("longitude")))
                except Exception:
                    continue
                if distance <= city_radius:
                    candidates.append((distance, row))
            candidates.sort(key=lambda item: item[0])
            max_cities = max(1, int(config.get("max_cities_per_run", 8)))
            if not any(str(r.get("city_name") or "").strip().lower() == nearby_seed.lower() for r in selected):
                selected.insert(0, seed)
            for _, row in candidates:
                if len(selected) >= max_cities:
                    break
                selected.append(row)

    return selected


def _fetch_places(
    city: str,
    categories: list,
    max_per: int,
    radius: float,
    current_lat: float | None = None,
    current_lng: float | None = None,
    radii_miles: list[float] | None = None,
    max_total_results: int = 120,
    search_metrics: dict | None = None,
):
    def log(msg: str) -> None:
        print(f"  {msg}")

    try:
        from .places_client import search_places
        return search_places(
            city,
            categories,
            max_per,
            radii_miles if radii_miles else radius,
            log=log,
            current_lat=current_lat,
            current_lng=current_lng,
            max_total_results=max_total_results,
            metrics=search_metrics,
        )
    except ImportError:
        from places_client import search_places
        return search_places(
            city,
            categories,
            max_per,
            radii_miles if radii_miles else radius,
            log=log,
            current_lat=current_lat,
            current_lng=current_lng,
            max_total_results=max_total_results,
            metrics=search_metrics,
        )
def _as_int(value, default: int = 0) -> int:
    try:
        if value is None:
            return default
        return int(value)
    except Exception:
        return default
def _scan_depth_limit(depth: str | None, default_limit: int) -> int:
    normalized = str(depth or "").strip().lower()
    mapping = {
        "quick": 25,
        "normal": 100,
        "deep": 300,
    }
    if normalized in mapping:
        return int(mapping[normalized])
    return int(default_limit)
def _write_empty(summary: str | None = None, reduced_mode_notice: str | None = None):
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    today = {
        "generated_at": generated_at,
        "summary": summary or "No opportunities found.",
        "case_slugs": [],
        "no_website_slugs": [],
        "weak_website_slugs": [],
        "top_opportunities": [],
        "cities_scanned": 0,
        "industries_scanned": 0,
        "businesses_found": 0,
        "high_score_opportunities": 0,
        "leads_created": 0,
        "reduced_mode_notice": reduced_mode_notice or None,
    }
    with open(SCRIPT_DIR / "today.json", "w", encoding="utf-8") as f:
        json.dump(today, f, indent=2)
    with open(SCRIPT_DIR / "opportunities.json", "w", encoding="utf-8") as f:
        json.dump([], f, indent=2)
