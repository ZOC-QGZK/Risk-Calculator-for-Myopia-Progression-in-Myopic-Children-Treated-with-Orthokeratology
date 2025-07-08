//  ——— 模型系数 & 标准误 ———
export const MODELS = {
  excessive: { intercept: 3.9593, age: -0.3104, alccc: 43.311 },
  rapid:     { intercept: -2.0105, age: 0,       alccc: 56.9745 }
};

export const SE = {
  excessive: { intercept: 1.504, age: 0.137, alccc: 7.769 },
  rapid:     { intercept: 0.332, age: 0.000, alccc: 11.982 }
};


// —— **75% PI 的 z 值** ——
const Z_PI = 1.15035;
// —— **Bootstrap 采样次数** ——
const B = 1000;

const sigmoid = z => 1 / (1 + Math.exp(-z));

// ——— 从 N(μ,σ²) 采样 ———
function randNormal(mu, sigma) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mu + z0 * sigma;
}

// ——— 从 Logistic(0,1) 采样 ———
function randLogistic() {
  const u = Math.random();
  return Math.log(u / (1 - u));
}

// ——— 参数/残差自助对称 75% 预测区间 ———
export function predictWithBootstrapPI(modelKey, age, alccc) {
  const m  = MODELS[modelKey];
  const se = SE[modelKey];

  // 原始点估计
  const z0 = m.intercept + m.age * age + m.alccc * alccc;
  const p0 = sigmoid(z0);

  // Bootstrap 用于估计预测分布的标准差
  const ps = new Array(B);
  for (let i = 0; i < B; i++) {
    // 参数扰动
    const b0   = randNormal(m.intercept, se.intercept);
    const bAge = randNormal(m.age,       se.age);
    const bAlc = randNormal(m.alccc,     se.alccc);
    // 残差扰动
    const eps  = randLogistic();

    const z = b0 + bAge * age + bAlc * alccc + eps;
    ps[i] = sigmoid(z);
  }

  // 计算 Bootstrap 分布的标准差（用于对称区间）
  const meanP = ps.reduce((s, v) => s + v, 0) / B;
  const varP  = ps.reduce((s, v) => s + Math.pow(v - meanP, 2), 0) / (B - 1);
  const sdP   = Math.sqrt(varP);

  // 对称区间：以原点估计 p0 为中心
  let lo = p0 - Z_PI * sdP;
  let hi = p0 + Z_PI * sdP;
  lo = Math.max(0, lo);
  hi = Math.min(1, hi);

  return { p: p0, lo, hi };
}

// ——— 绑定按钮事件 ———
export function bindCalculator() {
  const $ = id => document.getElementById(id);
  const btn = $('calc');

  btn.addEventListener('click', () => {
    const age   = Number($('age').value);
    const alccc = Number($('alccc').value);
    if (Number.isNaN(age) || Number.isNaN(alccc)) {
      alert('Please fill in the complete and correct numbers！');
      return;
    }

    const resEx = predictWithBootstrapPI('excessive', age, alccc);
    const resRa = predictWithBootstrapPI('rapid',     age, alccc);

    $('result-excessive').textContent =
      `excessive myopia progression：${resEx.p.toFixed(3)} (75% PI ${resEx.lo.toFixed(3)}–${resEx.hi.toFixed(3)})`;
    $('result-rapid').textContent =
      `rapid myopia progression：${resRa.p.toFixed(3)} (75% PI ${resRa.lo.toFixed(3)}–${resRa.hi.toFixed(3)})`;
  });
}

// 确保 DOM 渲染完毕后再绑定
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindCalculator);
} else {
  bindCalculator();
}
