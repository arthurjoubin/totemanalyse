#!/usr/bin/env python3
"""
Script de mise à jour des indicateurs financiers.
Sources: Yahoo Finance (API directe), CoinGecko, ECB, FRED, EIA

Dépendances: pip install requests
Automatisation: GitHub Actions (voir .github/workflows/update-indicators.yml)

Usage:
    python scripts/update-indicators.py
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
import requests

# Clé API EIA (Energy Information Administration)
EIA_API_KEY = os.environ.get("EIA_API_KEY", "VjJrmmL7OcvnsjVp2Ngphybwd00eYhG1En0tOTcE")

# Chemin du fichier de données
SCRIPT_DIR = Path(__file__).parent
DATA_FILE = SCRIPT_DIR.parent / "public" / "data" / "indicators.json"


def get_yahoo_chart(symbol: str, range_: str = "20y", interval: str = "1mo") -> list:
    """Récupère les données depuis Yahoo Finance Chart API (sans lib externe)."""
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
        params = {
            "range": range_,
            "interval": interval,
            "includePrePost": "false"
        }
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }

        response = requests.get(url, params=params, headers=headers, timeout=30)
        response.raise_for_status()

        result = response.json()["chart"]["result"][0]
        timestamps = result["timestamp"]
        closes = result["indicators"]["quote"][0]["close"]

        data = []
        for ts, close in zip(timestamps, closes):
            if close is not None:
                date = datetime.fromtimestamp(ts)
                data.append({
                    "date": date.strftime("%Y-%m"),
                    "value": round(close, 2)
                })

        # Dédupliquer par mois (garder la dernière valeur)
        seen = {}
        for item in data:
            seen[item["date"]] = item["value"]

        return [{"date": k, "value": v} for k, v in sorted(seen.items())]

    except Exception as e:
        print(f"    ✗ Erreur: {e}")
        return []


def get_coingecko_data(coin_id: str = "bitcoin") -> list:
    """Récupère les données historiques depuis CoinGecko (gratuit)."""
    try:
        url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
        params = {
            "vs_currency": "usd",
            "days": "max",
            "interval": "monthly"
        }

        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()

        prices = response.json().get("prices", [])

        seen_months = {}
        for timestamp, price in prices:
            date = datetime.fromtimestamp(timestamp / 1000)
            month_key = date.strftime("%Y-%m")
            seen_months[month_key] = round(price, 0)

        return [{"date": k, "value": v} for k, v in sorted(seen_months.items())]

    except Exception as e:
        print(f"    ✗ Erreur CoinGecko: {e}")
        return []


def get_ecb_rate() -> list:
    """Récupère le taux directeur BCE depuis l'API ECB."""
    try:
        url = "https://sdw-wsrest.ecb.europa.eu/service/data/FM/M.U2.EUR.4F.KR.MRR_FR.LEV"
        headers = {"Accept": "application/json"}

        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        json_data = response.json()
        observations = json_data["dataSets"][0]["series"]["0:0:0:0:0:0:0"]["observations"]
        dimensions = json_data["structure"]["dimensions"]["observation"][0]["values"]

        data = []
        for idx, obs in observations.items():
            date_info = dimensions[int(idx)]
            date = date_info["id"]
            value = obs[0]
            if value is not None:
                data.append({
                    "date": date,
                    "value": round(value, 2)
                })

        return sorted(data, key=lambda x: x["date"])[-240:]

    except Exception as e:
        print(f"    ✗ Erreur ECB: {e}")
        return []


def get_fred_data(series_id: str) -> list:
    """Récupère les données depuis FRED (clé API requise)."""
    api_key = os.environ.get("FRED_API_KEY")
    if not api_key:
        return []

    try:
        url = "https://api.stlouisfed.org/fred/series/observations"
        params = {
            "series_id": series_id,
            "api_key": api_key,
            "file_type": "json",
            "frequency": "m",
            "observation_start": (datetime.now() - timedelta(days=7300)).strftime("%Y-%m-%d")
        }

        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()

        data = []
        for obs in response.json().get("observations", []):
            if obs["value"] != ".":
                data.append({
                    "date": obs["date"][:7],
                    "value": round(float(obs["value"]), 2)
                })
        return data

    except Exception as e:
        print(f"    ✗ Erreur FRED: {e}")
        return []


def get_eia_international_data(activity_id: int, product_id: int, country_id: str) -> list:
    """
    Récupère les données internationales depuis l'API EIA.

    Args:
        activity_id: 1=Production, 2=Consumption, 3=Imports, 4=Exports, 5=Stocks
        product_id: 57=Total petroleum, 26=Natural gas, 1=Coal, 12=Nuclear, 28=Renewables
        country_id: WORL, USA, CHN, OECD, etc.
    """
    try:
        url = "https://api.eia.gov/v2/international/data/"
        params = {
            "api_key": EIA_API_KEY,
            "frequency": "annual",
            "data[0]": "value",
            "facets[activityId][]": str(activity_id),
            "facets[productId][]": str(product_id),
            "facets[countryRegionId][]": country_id,
            "sort[0][column]": "period",
            "sort[0][direction]": "desc",
            "length": 100
        }

        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()

        result = response.json()
        data_points = result.get("response", {}).get("data", [])

        data = []
        for item in data_points:
            period = item.get("period")
            value = item.get("value")
            if period and value is not None:
                # Format annuel: YYYY -> YYYY-01 pour cohérence
                data.append({
                    "date": f"{period}-01",
                    "value": round(float(value), 2)
                })

        # Trier par date croissante
        return sorted(data, key=lambda x: x["date"])

    except Exception as e:
        print(f"    ✗ Erreur EIA International: {e}")
        return []


def get_eia_petroleum_stocks() -> list:
    """Récupère les stocks de pétrole US depuis l'API EIA."""
    try:
        url = "https://api.eia.gov/v2/petroleum/stoc/wstk/data/"
        params = {
            "api_key": EIA_API_KEY,
            "frequency": "weekly",
            "data[0]": "value",
            "facets[product][]": "EPC0",  # Crude Oil
            "facets[duoarea][]": "NUS",   # U.S.
            "sort[0][column]": "period",
            "sort[0][direction]": "desc",
            "length": 1000
        }

        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()

        result = response.json()
        data_points = result.get("response", {}).get("data", [])

        seen = {}
        for item in data_points:
            period = item.get("period")
            value = item.get("value")
            if period and value is not None:
                # Dédupliquer par mois (garder la dernière valeur)
                month_key = period[:7]  # YYYY-MM
                if month_key not in seen:
                    seen[month_key] = round(float(value), 2)

        return [{"date": k, "value": v} for k, v in sorted(seen.items())]

    except Exception as e:
        print(f"    ✗ Erreur EIA Stocks: {e}")
        return []


def load_existing_data() -> dict:
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"lastUpdated": "", "indicators": {}}


def save_data(data: dict):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def main():
    print("=" * 50)
    print("Mise à jour des indicateurs financiers")
    print("=" * 50)
    print()

    existing = load_existing_data()
    indicators = existing.get("indicators", {})

    # Configuration Yahoo Finance
    yahoo_config = {
        # Indices
        "sp500": ("^GSPC", "S&P 500", "Indice des 500 plus grandes entreprises américaines", "points"),
        "cac40": ("^FCHI", "CAC 40", "Indice des 40 plus grandes entreprises françaises", "points"),
        "nasdaq": ("^IXIC", "NASDAQ", "Indice des valeurs technologiques américaines", "points"),
        "dax": ("^GDAXI", "DAX", "Indice des 40 plus grandes entreprises allemandes", "points"),
        "nikkei": ("^N225", "Nikkei 225", "Indice des 225 plus grandes entreprises japonaises", "points"),
        # Matières premières
        "gold": ("GC=F", "Or (Gold)", "Prix de l'once d'or en USD", "$/oz"),
        "silver": ("SI=F", "Argent (Silver)", "Prix de l'once d'argent en USD", "$/oz"),
        "brent": ("BZ=F", "Brent (Pétrole)", "Prix du baril de Brent en USD", "$/baril"),
        "natgas": ("NG=F", "Gaz Naturel", "Prix du gaz naturel en USD", "$/MMBtu"),
        # Devises
        "eurusd": ("EURUSD=X", "EUR/USD", "Taux de change Euro/Dollar", ""),
        # Taux
        "fr10y": ("^TNX", "Taux US 10 ans", "Rendement des obligations d'État américaines à 10 ans", "%"),
        # Crypto
        "bitcoin": ("BTC-USD", "Bitcoin (BTC)", "Prix du Bitcoin en USD", "$"),
    }

    # Yahoo Finance
    print("📊 Yahoo Finance...")
    for key, (symbol, name, desc, unit) in yahoo_config.items():
        print(f"  → {name} ({symbol})")
        data = get_yahoo_chart(symbol)
        if data:
            indicators[key] = {
                "name": name,
                "description": desc,
                "unit": unit,
                "source": "Yahoo Finance",
                "data": data
            }
            print(f"    ✓ {len(data)} points")
        elif key in indicators:
            print(f"    ⚠ Données existantes conservées")

    # EIA (Energy Information Administration)
    print()
    print("🛢️ EIA (Energy Information Administration)...")

    # Configuration EIA - Consommation de pétrole par région
    # activityId: 2 = Consumption, productId: 4415 = Petroleum and other liquids
    eia_oil_consumption = {
        "oil_consumption_world": ("WORL", "Conso. Pétrole Monde", "Consommation mondiale de pétrole", "quad Btu"),
        "oil_consumption_usa": ("USA", "Conso. Pétrole USA", "Consommation de pétrole des États-Unis", "quad Btu"),
        "oil_consumption_china": ("CHN", "Conso. Pétrole Chine", "Consommation de pétrole de la Chine", "quad Btu"),
        "oil_consumption_europe": ("EU27", "Conso. Pétrole Europe", "Consommation de pétrole de l'Union Européenne", "quad Btu"),
        "oil_consumption_oecd": ("OECD", "Conso. Pétrole OCDE", "Consommation de pétrole des pays de l'OCDE", "quad Btu"),
    }

    for key, (country_id, name, desc, unit) in eia_oil_consumption.items():
        print(f"  → {name} ({country_id})")
        data = get_eia_international_data(activity_id=2, product_id=4415, country_id=country_id)
        if data:
            indicators[key] = {
                "name": name,
                "description": desc,
                "unit": unit,
                "source": "EIA",
                "data": data
            }
            print(f"    ✓ {len(data)} points")
        elif key in indicators:
            print(f"    ⚠ Données existantes conservées")

    # Configuration EIA - Consommation mondiale par type d'énergie
    # activityId: 2 = Consumption, countryId: WORL
    # ProductIds: 4415=Petroleum, 4413=Natural gas, 4411=Coal, 4417=Nuclear, 4418=Renewables
    eia_energy_types = {
        "energy_petroleum": (4415, "Conso. Mondiale Pétrole", "Consommation mondiale de pétrole", "quad Btu"),
        "energy_natgas": (4413, "Conso. Mondiale Gaz", "Consommation mondiale de gaz naturel", "quad Btu"),
        "energy_coal": (4411, "Conso. Mondiale Charbon", "Consommation mondiale de charbon", "quad Btu"),
        "energy_nuclear": (4417, "Conso. Mondiale Nucléaire", "Consommation mondiale d'énergie nucléaire", "quad Btu"),
        "energy_renewables": (4418, "Conso. Mondiale Renouvelables", "Consommation mondiale d'énergies renouvelables", "quad Btu"),
    }

    for key, (product_id, name, desc, unit) in eia_energy_types.items():
        print(f"  → {name} (productId={product_id})")
        data = get_eia_international_data(activity_id=2, product_id=product_id, country_id="WORL")
        if data:
            indicators[key] = {
                "name": name,
                "description": desc,
                "unit": unit,
                "source": "EIA",
                "data": data
            }
            print(f"    ✓ {len(data)} points")
        elif key in indicators:
            print(f"    ⚠ Données existantes conservées")


    # Sauvegarder
    result = {
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "indicators": indicators
    }
    save_data(result)

    print()
    print("=" * 50)
    print(f"✓ Fichier: {DATA_FILE}")
    print(f"✓ Date: {result['lastUpdated']}")
    print("=" * 50)


if __name__ == "__main__":
    main()
