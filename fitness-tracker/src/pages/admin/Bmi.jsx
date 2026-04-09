import React, { useState } from "react";
import { useSettings } from "../../contexts/SettingsContext";

const BMICalculator = () => {
  const { settings } = useSettings();
  const isWeightMetric = settings.units.weight === "kg";
  const isHeightMetric = settings.units.height === "cm";

  const [form, setForm] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "male",
  });

  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const inputClass =
    "w-full p-3.5 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all";
  const labelClass =
    "text-xs font-semibold text-gray-300 block mb-1.5 uppercase tracking-wider";

  const handle = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const calculate = () => {
    setError("");
    const age = parseInt(form.age);
    const gender = form.gender;

    // ── Height → cm ──────────────────────────────────────────
    let heightCm;
    if (isHeightMetric) {
      heightCm = parseFloat(form.height);
      // cm validation
      if (heightCm < 50 || heightCm > 300) {
        setError("Please enter height in cm (e.g. 175)");
        return;
      }
    } else {
      // User inputs decimal feet like 5.4 → treat the decimal part as inches fraction
      // e.g. 5.4 ft = 5 ft + 0.4 ft = 5 ft + 4.8 in
      const totalFt = parseFloat(form.height);
      if (totalFt < 1 || totalFt > 10) {
        setError("Please enter height in feet (e.g. 5.4 for 5 ft 4 in)");
        return;
      }
      // 1 ft = 30.48 cm
      heightCm = totalFt * 30.48;
    }

    // ── Weight → kg ──────────────────────────────────────────
    let weightKg = parseFloat(form.weight);
    if (!isWeightMetric) weightKg = weightKg / 2.20462;

    if (!weightKg || !heightCm || !age || age < 5 || age > 120) {
      setError("Please fill in all fields with valid values.");
      return;
    }

    const hM = heightCm / 100;

    // ── BMI ────────────────────────────────────────────────
    const bmi = weightKg / (hM * hM);

    // ── Category (WHO standard) ────────────────────────────
    let category, categoryColor, categoryEmoji, healthRisk, advice;
    if (bmi < 16) {
      category = "Severely Underweight";
      categoryColor = "text-red-400";
      categoryEmoji = "⚠️";
      healthRisk = "Very high risk of malnutrition, anemia, immune deficiency, and organ failure.";
      advice = "Consult a doctor urgently. Focus on calorie-dense, nutrient-rich foods. Small, frequent meals are recommended.";
    } else if (bmi < 18.5) {
      category = "Underweight";
      categoryColor = "text-blue-400";
      categoryEmoji = "📉";
      healthRisk = "Elevated risk of nutritional deficiencies, bone loss, and weakened immunity.";
      advice = "Increase caloric intake with healthy foods (nuts, dairy, lean meats, whole grains). Aim for a 300–500 kcal daily surplus.";
    } else if (bmi < 25) {
      category = "Normal Weight";
      categoryColor = "text-green-400";
      categoryEmoji = "✅";
      healthRisk = "Low health risk. You are in the healthy weight range.";
      advice = "Maintain your lifestyle! Exercise 150+ min/week and eat a balanced diet of fruits, vegetables, proteins, and whole grains.";
    } else if (bmi < 30) {
      category = "Overweight";
      categoryColor = "text-yellow-400";
      categoryEmoji = "📈";
      healthRisk = "Moderate risk of heart disease, type 2 diabetes, and hypertension.";
      advice = "Aim to reduce 300–500 kcal/day through diet and 30 min of moderate exercise daily. Cut back on processed foods and sugar.";
    } else if (bmi < 35) {
      category = "Obese (Class I)";
      categoryColor = "text-orange-400";
      categoryEmoji = "🔴";
      healthRisk = "High risk of cardiovascular disease, sleep apnea, and joint problems.";
      advice = "Consult a healthcare provider. Focus on sustainable dietary changes and daily activity. Aim for 0.5–1 kg/week weight loss.";
    } else if (bmi < 40) {
      category = "Obese (Class II)";
      categoryColor = "text-red-400";
      categoryEmoji = "🔴";
      healthRisk = "Very high risk of serious health conditions including stroke and type 2 diabetes.";
      advice = "Medical supervision is strongly recommended. Structured diet, exercise, and possibly medication may be needed.";
    } else {
      category = "Obese (Class III)";
      categoryColor = "text-red-600";
      categoryEmoji = "🔴";
      healthRisk = "Extremely high risk — life-threatening complications are possible.";
      advice = "Please seek immediate medical advice. Weight loss surgery or intensive medical programs may be considered.";
    }

    // ── Ideal Weight Range (BMI 18.5–24.9) ────────────────
    const idealMinKg = 18.5 * hM * hM;
    const idealMaxKg = 24.9 * hM * hM;

    // ── Body Fat % — Deurenberg formula ───────────────────
    const bodyFat = (1.2 * bmi) + (0.23 * age) - (10.8 * (gender === "male" ? 1 : 0)) - 5.4;

    // ── BMR — Mifflin-St Jeor ─────────────────────────────
    const bmr = gender === "male"
      ? Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5)
      : Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);

    // ── Weight diff to reach middle of healthy range ──────
    const targetKg = 21.7 * hM * hM;
    const diffKg = weightKg - targetKg;

    // ── BMI Scale % — piecewise linear mapping ─────────────
    // Zones: Under(<18.5)=0-20% | Normal(18.5-24.9)=20-50% | Over(25-29.9)=50-80% | Obese(≥30)=80-100%
    let bmiPercent;
    const bmiVal = bmi;
    if (bmiVal <= 18.5) {
      bmiPercent = (bmiVal / 18.5) * 20;
    } else if (bmiVal <= 24.9) {
      bmiPercent = 20 + ((bmiVal - 18.5) / (24.9 - 18.5)) * 30;
    } else if (bmiVal <= 29.9) {
      bmiPercent = 50 + ((bmiVal - 24.9) / (29.9 - 24.9)) * 30;
    } else {
      bmiPercent = 80 + Math.min(20, ((bmiVal - 30) / 10) * 20);
    }
    bmiPercent = Math.min(100, Math.max(0, bmiPercent));

    setResults({
      bmi: bmi.toFixed(1),
      category,
      categoryColor,
      categoryEmoji,
      bodyFat: Math.max(0, bodyFat).toFixed(1),
      bmr,
      idealMinKg: idealMinKg.toFixed(1),
      idealMaxKg: idealMaxKg.toFixed(1),
      diffKg: diffKg.toFixed(1),
      healthRisk,
      advice,
      bmiPercent,
    });
  };

  const displayKg = (kg) =>
    isWeightMetric ? `${kg} kg` : `${(kg * 2.20462).toFixed(1)} lbs`;

  const heightPlaceholder = isHeightMetric
    ? "e.g. 175"
    : "e.g. 5.4  (5 ft 4 in)";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold text-white drop-shadow-md mb-8">
        BMI Calculator
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Input Form ─── */}
        <div className="lg:col-span-1 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-8 h-fit space-y-5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <span className="text-2xl">⚖️</span> Your Details
          </h3>

          {/* Gender */}
          <div>
            <label className={labelClass}>Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {["male", "female"].map((g) => (
                <button
                  key={g}
                  onClick={() => handle("gender", g)}
                  className={`py-2.5 rounded-xl font-semibold capitalize transition-all text-sm ${
                    form.gender === g
                      ? "bg-yellow-500 text-black"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {g === "male" ? "👨 Male" : "👩 Female"}
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div>
            <label className={labelClass}>Age (years)</label>
            <input
              type="number"
              min="5" max="120"
              placeholder="e.g. 25"
              className={inputClass}
              value={form.age}
              onChange={(e) => handle("age", e.target.value)}
            />
          </div>

          {/* Weight */}
          <div>
            <label className={labelClass}>Weight ({isWeightMetric ? "kg" : "lbs"})</label>
            <input
              type="number"
              step="0.1"
              placeholder={isWeightMetric ? "e.g. 70" : "e.g. 154"}
              className={inputClass}
              value={form.weight}
              onChange={(e) => handle("weight", e.target.value)}
            />
          </div>

          {/* Height */}
          <div>
            <label className={labelClass}>
              Height ({isHeightMetric ? "cm" : "ft  — enter decimal, e.g. 5.4"})
            </label>
            <input
              type="number"
              step="0.1"
              placeholder={heightPlaceholder}
              className={inputClass}
              value={form.height}
              onChange={(e) => handle("height", e.target.value)}
            />
            {!isHeightMetric && (
              <p className="text-[10px] text-gray-500 mt-1">
                5.4 = 5 ft 4 in &nbsp;|&nbsp; 5.10 = 5 ft 10 in
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm font-medium">{error}</p>
          )}

          <button
            className="bg-gradient-to-r from-yellow-500 to-orange-600 w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] transform transition-all duration-300 active:scale-95"
            onClick={calculate}
          >
            Calculate BMI
          </button>

          {/* Mini result in card */}
          {results && (
            <div className="p-4 rounded-2xl bg-black/20 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Your BMI</p>
              <div className={`text-5xl font-extrabold ${results.categoryColor}`}>
                {results.bmi}
              </div>
              <div className={`text-base font-bold mt-1 ${results.categoryColor}`}>
                {results.categoryEmoji} {results.category}
              </div>
            </div>
          )}
        </div>

        {/* ─── Results / Info Panel ─── */}
        <div className="lg:col-span-2 space-y-6">
          {results ? (
            <>
              {/* BMI Scale */}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-7">
                <h3 className="text-xl font-bold text-white mb-5">📊 BMI Scale</h3>
                {/* Color bar — widths match zone mapping: 20% | 30% | 30% | 20% */}
                <div className="flex rounded-full overflow-hidden h-5 mb-1">
                  <div className="bg-blue-400/70"   style={{ width: '20%' }} title="Underweight" />
                  <div className="bg-green-400/70"  style={{ width: '30%' }} title="Normal" />
                  <div className="bg-yellow-400/70" style={{ width: '30%' }} title="Overweight" />
                  <div className="bg-red-500/70"    style={{ width: '20%' }} title="Obese" />
                </div>
                {/* Marker */}
                <div className="relative h-5 mb-1">
                  <div
                    className="absolute top-1 -translate-x-1/2 transition-all duration-700"
                    style={{ left: `${results.bmiPercent}%` }}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-lg ring-2 ring-yellow-400" />
                  </div>
                </div>
                <div className="flex text-[9px] text-gray-400 font-bold uppercase">
                  <span style={{ width: '20%' }}>Under<br />&lt;18.5</span>
                  <span style={{ width: '30%' }} className="text-center">Normal<br />18.5–24.9</span>
                  <span style={{ width: '30%' }} className="text-center">Overweight<br />25–29.9</span>
                  <span style={{ width: '20%' }} className="text-right">Obese<br />≥30</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-black/20 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">BMI Score</p>
                  <p className={`text-3xl font-extrabold ${results.categoryColor}`}>{results.bmi}</p>
                </div>
                <div className="bg-black/20 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Category</p>
                  <p className={`text-base font-bold ${results.categoryColor}`}>{results.category}</p>
                </div>
                <div className="bg-black/20 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Body Fat %</p>
                  <p className="text-2xl font-extrabold text-purple-300">{results.bodyFat}%</p>
                </div>
                <div className="bg-black/20 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">BMR (kcal/day)</p>
                  <p className="text-2xl font-extrabold text-cyan-300">{results.bmr}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">at rest</p>
                </div>
                <div className="bg-black/20 rounded-2xl p-4 text-center md:col-span-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Ideal Weight Range</p>
                  <p className="text-xl font-extrabold text-green-300">
                    {displayKg(results.idealMinKg)} – {displayKg(results.idealMaxKg)}
                  </p>
                </div>
                <div className="bg-black/20 rounded-2xl p-4 text-center md:col-span-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Weight to Goal</p>
                  <p className={`text-xl font-extrabold ${parseFloat(results.diffKg) === 0 ? "text-green-400" : "text-yellow-300"}`}>
                    {parseFloat(results.diffKg) > 0
                      ? `Lose ${displayKg(Math.abs(results.diffKg))}`
                      : parseFloat(results.diffKg) < 0
                      ? `Gain ${displayKg(Math.abs(results.diffKg))}`
                      : "🎯 You're at goal!"}
                  </p>
                </div>
              </div>

              {/* Health Risk */}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-7">
                <h3 className="text-xl font-bold text-white mb-3">🩺 Health Risk</h3>
                <p className="text-gray-300 leading-relaxed">{results.healthRisk}</p>
              </div>

              {/* Advice */}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-7">
                <h3 className="text-xl font-bold text-white mb-3">💡 Recommendations</h3>
                <p className="text-gray-300 leading-relaxed">{results.advice}</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-white mb-5">Understanding BMI</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  BMI (Body Mass Index) = Weight (kg) ÷ Height² (m²). Fill in the form to get a full health analysis including Body Fat %, BMR, and ideal weight.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Severely Underweight", range: "BMI < 16",     color: "bg-red-500/10 text-red-300" },
                    { label: "Underweight",           range: "BMI 16–18.4",  color: "bg-blue-500/10 text-blue-200" },
                    { label: "Normal Weight",         range: "BMI 18.5–24.9",color: "bg-green-500/10 text-green-200" },
                    { label: "Overweight",            range: "BMI 25–29.9",  color: "bg-yellow-500/10 text-yellow-200" },
                    { label: "Obese Class I",         range: "BMI 30–34.9",  color: "bg-orange-500/10 text-orange-200" },
                    { label: "Obese Class II+",       range: "BMI ≥ 35",     color: "bg-red-500/10 text-red-200" },
                  ].map((item) => (
                    <div key={item.label} className={`p-4 rounded-xl ${item.color}`}>
                      <p className="font-bold mb-1 text-sm">{item.label}</p>
                      <p className="text-xs opacity-80">{item.range}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-white mb-4">📋 What You'll Get</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  {[
                    "📊 BMI Score with color-coded scale",
                    "💪 Estimated Body Fat Percentage",
                    "🔥 BMR — Calories burned at rest",
                    "⚖️ Ideal weight range for your height",
                    "🎯 How much weight to gain/lose",
                    "🩺 Health risk assessment",
                    "💡 Personalized recommendations",
                  ].map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;
