//  ——— 模型系数 & 标准误 ———
export const MODELS = {
  excessive: { intercept: 3.9593, age: -0.3104, alccc: 43.311 },
  rapid:     { intercept: -2.0105, age: 0,       alccc: 56.9745 }
};

export const SE = {
  excessive: { intercept: 1.504, age: 0.137, alccc: 7.769 },
  rapid:     { intercept: 0.332, age: 0.000, alccc: 11.982 }
};

const Z_95 = 1.96;
const sigmoid = z => 1 / (1 + Math.exp(-z));

// ——— 计算函数，带 95% CI ———
export function predictWithCI(modelKey, age, alccc) {
  const m  = MODELS[modelKey];
  const se = SE[modelKey];
  const z  = m.intercept + m.age * age + m.alccc * alccc;

  const varZ = se.intercept**2
             + (age   * se.age  )**2
             + (alccc * se.alccc)**2;
  const seZ   = Math.sqrt(varZ);
  const zLow  = z - Z_95 * seZ;
  const zHigh = z + Z_95 * seZ;

  return {
    p:  sigmoid(z),
    lo: sigmoid(zLow),
    hi: sigmoid(zHigh)
  };
}

// ——— 绑定按钮事件 ———
export function bindCalculator() {
  console.log('✅ bindCalculator() called');
  const $ = id => document.getElementById(id);

  const btn = $('calc');
  console.log('按钮：', btn);
  btn.addEventListener('click', () => {
    console.log('🚀 Calculate clicked');
    const age   = Number($('age').value);
    const alccc = Number($('alccc').value);

    if (Number.isNaN(age) || Number.isNaN(alccc)) {
      alert('请填写完整且正确的数字！');
      return;
    }

    const resEx = predictWithCI('excessive', age, alccc);
    const resRa = predictWithCI('rapid',     age, alccc);

    $('result-excessive').textContent =
      `过度近视进展风险：${resEx.p.toFixed(3)} (95% CI ${resEx.lo.toFixed(3)}–${resEx.hi.toFixed(3)})`;
    $('result-rapid').textContent =
      `快速近视进展风险：${resRa.p.toFixed(3)} (95% CI ${resRa.lo.toFixed(3)}–${resRa.hi.toFixed(3)})`;
  });
}

// 确保 DOM 渲染完毕后再绑定
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindCalculator);
} else {
  bindCalculator();
}
