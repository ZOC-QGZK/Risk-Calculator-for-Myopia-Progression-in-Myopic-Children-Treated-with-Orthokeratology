//  ——— 模型系数 & 标准误 ———
export const MODELS = {
  excessive: { intercept: 3.9593, age: -0.3104, alccc: 43.311 },
  rapid:     { intercept: -2.0105, age: 0,       alccc: 56.9745 }
};

export const SE = {
  excessive: { intercept: 1.504, age: 0.137, alccc: 7.769 },
  rapid:     { intercept: 0.332, age: 0.000, alccc: 11.982 }
};


// 75% PI 对应的 z 分位数 ≈ 1.15035
const Z_PI = 1.15035;
// Logistic 残差方差 ≈ π²/3，用于包含个体差异
const RESID_VAR = Math.PI**2 / 3;

const sigmoid = z => 1 / (1 + Math.exp(-z));

// ——— Delta 方法：在概率空间构造对称预测区间 ———
export function predictWithSymmetricPI(modelKey, age, alccc) {
  // 1. 线性预测（log-odds）
  const m  = MODELS[modelKey];
  const se = SE[modelKey];
  const z  = m.intercept + m.age * age + m.alccc * alccc;

  // 2. 对数几率总方差 = 参数方差 + 残差方差
  const varZ = se.intercept**2
             + (age   * se.age  )**2
             + (alccc * se.alccc)**2;
  const varTotal = varZ + RESID_VAR;
  const seZ = Math.sqrt(varTotal);

  // 3. 点估计概率
  const p = sigmoid(z);

  // 4. 根据链式法则近似：SE_p ≈ p(1-p) · SE_z
  const seP = p * (1 - p) * seZ;

  // 5. 在概率空间做对称区间，并截断到 [0,1]
  let lo = p - Z_PI * seP;
  let hi = p + Z_PI * seP;
  lo = Math.max(0, lo);
  hi = Math.min(1, hi);

  return { p, lo, hi };
}

// ——— 绑定按钮事件 ———
export function bindCalculator() {
  const $ = id => document.getElementById(id);
  const btn = $('calc');

  btn.addEventListener('click', () => {
    const age   = Number($('age').value);
    const alccc = Number($('alccc').value);

    if (Number.isNaN(age) || Number.isNaN(alccc)) {
      alert('请填写完整且正确的数字！');
      return;
    }

    // 使用新的对称预测区间函数
    const resEx = predictWithSymmetricPI('excessive', age, alccc);
    const resRa = predictWithSymmetricPI('rapid',     age, alccc);

    $('result-excessive').textContent =
      `过度近视进展风险：${resEx.p.toFixed(3)} (75% PI ${resEx.lo.toFixed(3)}–${resEx.hi.toFixed(3)})`;
    $('result-rapid').textContent =
      `快速近视进展风险：${resRa.p.toFixed(3)} (75% PI ${resRa.lo.toFixed(3)}–${resRa.hi.toFixed(3)})`;
  });
}

// 确保 DOM 渲染完毕后再绑定
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindCalculator);
} else {
  bindCalculator();
}
