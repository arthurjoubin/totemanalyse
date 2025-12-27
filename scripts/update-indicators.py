#!/usr/bin/env python3
"""
Script de mise à jour des indicateurs financiers.
Sources: Yahoo Finance (API directe), CoinGecko, ECB, FRED

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

# Chemin du fichier de données
SCRIPT_DIR = Path(__file__).parent
DATA_FILE = SCRIPT_DIR.parent / "public" / "data" / "indicators.json"


def get_yahoo_chart(symbol: str, range_: str = "10y", interval: str = "1mo") -> list:
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
            "days": "3650",
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

        return sorted(data, key=lambda x: x["date"])[-120:]

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
            "observation_start": (datetime.now() - timedelta(days=3650)).strftime("%Y-%m-%d")
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
        "sp500": ("^GSPC", "S&P 500", "Indice des 500 plus grandes entreprises américaines", "points"),
        "cac40": ("^FCHI", "CAC 40", "Indice des 40 plus grandes entreprises françaises", "points"),
        "gold": ("GC=F", "Or (Gold)", "Prix de l'once d'or en USD", "$/oz"),
        "brent": ("BZ=F", "Brent (Pétrole)", "Prix du baril de Brent en USD", "$/baril"),
        "fr10y": ("^TNX", "Taux US 10 ans", "Rendement des obligations d'État américaines à 10 ans", "%"),
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

    # CoinGecko
    print("\n🪙 CoinGecko...")
    print("  → Bitcoin")
    btc_data = get_coingecko_data("bitcoin")
    if btc_data:
        indicators["bitcoin"] = {
            "name": "Bitcoin (BTC)",
            "description": "Prix du Bitcoin en USD",
            "unit": "$",
            "source": "CoinGecko",
            "data": btc_data
        }
        print(f"    ✓ {len(btc_data)} points")

    # ECB
    print("\n🏦 ECB...")
    print("  → Taux directeur BCE")
    ecb_data = get_ecb_rate()
    if ecb_data:
        indicators["ecb"] = {
            "name": "Taux directeur BCE",
            "description": "Taux d'intérêt principal de la Banque Centrale Européenne",
            "unit": "%",
            "source": "ECB",
            "data": ecb_data
        }
        print(f"    ✓ {len(ecb_data)} points")

    # FRED
    if os.environ.get("FRED_API_KEY"):
        print("\n📈 FRED...")
        print("  → Taux Fed")
        fed_data = get_fred_data("FEDFUNDS")
        if fed_data:
            indicators["fed"] = {
                "name": "Taux directeur Fed",
                "description": "Taux d'intérêt de la Réserve Fédérale américaine",
                "unit": "%",
                "source": "FRED",
                "data": fed_data
            }
            print(f"    ✓ {len(fed_data)} points")
    else:
        print("\n⚠ FRED_API_KEY non définie")
        print("  → Clé gratuite: https://fred.stlouisfed.org/docs/api/api_key.html")

    # Données manuelles
    print("\n🏠 Données manuelles conservées...")
    for key in ["immoParis", "immoFrance"]:
        if key in existing.get("indicators", {}):
            indicators[key] = existing["indicators"][key]
            print(f"  → {key}: ✓")

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
