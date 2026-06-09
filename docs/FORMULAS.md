# Carbon Engine: Formulas & Emission Factors Reference

This document lists the baseline emission factors, sources, and mathematical formulas used by the **Carbon Compass** engine to guarantee transparency and scientific grounding.

---

## 1. Commute & Transport Formulas

Activity calculations are evaluated per week and converted to monthly estimates:

$$\text{Monthly Commute Emissions (kg CO}_2\text{e)} = \text{Commute Distance (km/week)} \times \text{Factor (kg CO}_2\text{e/km)} \times 4.33$$

### Commute Emission Factors
We reference standard vehicular emission factors:

| Vehicle Type | Factor (kg CO₂e/km) | Source Reference |
| :--- | :--- | :--- |
| **Car (Petrol)** | `0.143` | US EPA / GHG Protocol Baseline |
| **Two-Wheeler (Petrol)** | `0.052` | India MoPNG / BEE Commuter averages |
| **Bus / Metro (Public)** | `0.015` | Delhi Metro Rail Corporation (DMRC) offset metrics |
| **Cab / Auto (LPG/CNG)** | `0.095` | City Auto-Rickshaw average limits |
| **Flights (Annual)** | `0.115` per km | ICAO Carbon Calculator standard short-haul |

---

## 2. Home Energy Formulas

Activity is calculated based on monthly bill units or average hourly consumption:

$$\text{Monthly Energy Emissions (kg CO}_2\text{e)} = \text{Electricity (kWh)} \times \text{Grid Factor} + \text{LPG Cylinders} \times \text{LPG Factor}$$

### Energy Emission Factors
We utilize specific regional metrics for grid density:

- **India Grid Electricity Factor**: `0.710 kg CO₂/kWh`
  - **Source**: India Central Electricity Authority (CEA) Baseline Database for FY 2024–25 (weighted average emissions including imports).
- **LPG Cylinder Factor**: `42.5 kg CO₂e per 14.2kg cylinder`
  - **Source**: India Ministry of Petroleum and Natural Gas standard cylinder density.
- **AC Usage Hours Offset**: `0.75 kg CO₂e/hour`
  - **Source**: Average 1.5-ton AC power rating (~1.05 kWh/hour at 0.710 factor).
- **Renewable Energy Credit**: Saves **15%** on the home energy totals if active.

---

## 3. Food, Shopping & Waste Factors

We apply habit-based profiles to score lifestyle choices:

- **Diet Base Tiers**:
  - `vegan`: `45 kg CO₂e / month`
  - `vegetarian`: `75 kg CO₂e / month`
  - `mixed`: `120 kg CO₂e / month`
  - `meat_heavy`: `210 kg CO₂e / month`
- **Online Shopping Delivery**: `1.2 kg CO₂e per order` (includes packaging & last-mile delivery).
- **Waste Recycling Credit**: Reduces waste footprint by **12 kg CO₂e / month**.
