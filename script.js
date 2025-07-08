// === 近视进展风险计算（含 95% 置信区间） ===

// 模型系数
export const MODELS = {
  excessive: { intercept: 3.9593, age: -0.3104, alccc: 43.311 },
  rapid:     { intercept: -2.0105, age: 0,       alccc: 56.9745 }
};

// 各 β 的标准误 (示例值；请替换为真实数据)
export const SE = {
  excessive: { intercept: 1.504, age: 0.137, alccc: 7.769 },
  rapid:     { intercept: 0.332, age: 0.000, alccc: 11.982 }
};

const Z_95 = 1.96; // 95% CI 对应的 z 分位数
const sigmoid = z => 1 / (1 + Math.exp(-z));

export function predictWithCI(modelKey, age, alccc) {
  const m  = MODELS[modelKey];
  const se = SE[modelKey];

  const z = m.intercept + m.age * age + m.alccc * alccc;

  // 方差估计（假设各 β 独立）
  const varZ =
    Math.pow(se.intercept, 2) +
    Math.pow(age * se.age, 2) +
    Math.pow(alccc * se.alccc, 2);

  const seZ = Math.sqrt(varZ);
  const zLow = z - Z_95 * seZ;
  const zHigh = z + Z_95 * seZ;

  return {
    p: sigmoid(z),
    lo: sigmoid(zLow),
    hi: sigmoid(zHigh)
  };
}

// 如果要直接和页面元素绑定，可调用 bindCalculator()
export function bindCalculator() {
  const get = id => document.getElementById(id);
  get("calc").addEventListener("click", () => {
    const age   = Number(get("age").value);
    const alccc = Number(get("alccc").value);
    if (Number.isNaN(age) || Number.isNaN(alccc)) {
      alert("请填写完整且正确的数字！");
      return;
    }

    const resEx = predictWithCI("excessive", age, alccc);
    const resRa = predictWithCI("rapid",     age, alccc);

    get("result-excessive").textContent =
      `过度近视进展风险：${resEx.p.toFixed(3)} (95% CI ${resEx.lo.toFixed(3)}–${resEx.hi.toFixed(3)})`;

    get("result-rapid").textContent =
      `快速近视进展风险：${resRa.p.toFixed(3)} (95% CI ${resRa.lo.toFixed(3)}–${resRa.hi.toFixed(3)})`;
  });
}
