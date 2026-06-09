# Carbon Engine: Formulas & Emission Factors Reference

This document lists the baseline emission factors, sources, and mathematical formulas used by the **Carbon Compass** engine to guarantee transparency and scientific grounding.

---

## 1. Commute & Transport Formulas

Activity calculations are evaluated per week and converted to monthly estimates:

$$\text{Monthly Commute Emissions (kg CO}_2\text{e)} = (\text{Commute Distance (km/week)} \times \text{Factor (kg CO}_2\text{e/km)} \times 4.33) + \frac{\text{Annual Flights} \times \text{Flight Factor}}{12}$$

### Commute Emission Factors
We reference standard vehicular emission factors:

| Vehicle Type | Factor | Unit | Source Reference |
| :--- | :--- | :--- | :--- |
| **Car (Petrol)** | `0.18` | kg CO₂/km | IPCC AR6 Baseline |
| **Two-Wheeler (Petrol)** | `0.12` | kg CO₂/km | IPCC AR6 (India petrol scooter average) |
| **Public Transport (Bus/Metro)** | `0.30` | kg CO₂/trip | India urban bus/metro average |
| **Cab / Auto (LPG/CNG)** | `1.20` | kg CO₂/trip | India shared cab average |
| **Flights (Domestic)** | `250.0` | kg CO₂/flight | ICAO Carbon Calculator standard short-haul |

---

## 2. Home Energy Formulas

Activity is calculated based on monthly bill units or average hourly consumption:

$$\text{Monthly Energy Emissions (kg CO}_2\text{e)} = \text{Electricity (kWh)} \times \text{Grid Factor} \times (\text{Renewable Credit? } 0.5 : 1) + \text{LPG Cylinders} \times \text{LPG Factor}$$

### Energy Emission Factors
We utilize specific regional metrics for grid density:

- **India Grid Electricity Factor**: `0.710 kg CO₂/kWh`
  - **Source**: India Central Electricity Authority (CEA) Baseline Database for FY 2024–25 (weighted average emissions including imports).
- **LPG Cylinder Factor**: `42.5 kg CO₂e per 14.2kg cylinder`
  - **Source**: India Ministry of Petroleum and Natural Gas standard cylinder density.
- **AC Usage Hours Offset**: `0.71 kg CO₂e/hour`
  - **Source**: Average 1.5-ton AC power rating (~1 kWh/hour at 0.710 factor).
- **Renewable Energy Credit**: Redirection saves **50%** on electricity emissions if active.

---

## 3. Food, Shopping & Waste Factors

We apply habit-based profiles to score lifestyle choices:

- **Diet Base Tiers**:
  - `vegan`: `35 kg CO₂e / month`
  - `vegetarian`: `45 kg CO₂e / month`
  - `mixed`: `55 kg CO₂e / month`
  - `meat_heavy`: `80 kg CO₂e / month`
- **Meat meal extra impact**: `0.70 kg CO₂e / meal`
- **Dairy consumption**: Low `0 kg/month`, Medium `3 kg/month`, High `6 kg/month`
- **Food Delivery**: `0.25 kg CO₂e per order`
- **Food Waste**: Low `4 kg/month`, Medium `8 kg/month`, High `14 kg/month`
- **Online Shopping Items**: Clothes `6 kg CO₂e per item`, Online orders `0.80 kg CO₂e per order`, Electronics `120 kg CO₂e per device`.
- **Plastic usage**: Low `2 kg/month`, Medium `6 kg/month`, High `12 kg/month`
- **Waste Recycling Credit**: Reduces waste footprint by **3 kg CO₂e / month**.
- **Composting Credit**: Reduces waste footprint by **4 kg CO₂e / month**.
- **Waste Baseline**: `8 kg CO₂e / month` baseline.
