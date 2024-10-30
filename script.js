// 模型系数和标准误
const recessiveModelCoefficients = {
    intercept: 8.1794,
    age: -0.6749,
    alccc: 45.3377
};

const rapidModelCoefficients = {
    intercept: 5.3816,
    age: -0.6522,
    alccc: 50.9034
};

// 标准误差
const recessiveModelStdError = {
    intercept: 1.8575,
    age: 0.1659,
    alccc: 8.1219
};

const rapidModelStdError = {
    intercept: 2.0062,
    age: 0.1978,
    alccc: 11.2417
};

// 计算Logistic回归的概率
function logisticFunction(z) {
    return 1 / (1 + Math.exp(-z));
}

// 计算预测概率和95%置信区间
function calculateProbability() {
    // 获取用户输入
    const age = parseFloat(document.getElementById("age").value);
    const alccc = parseFloat(document.getElementById("alccc").value);

    // 计算 recessive-model 的 z 值
    const z1 = recessiveModelCoefficients.intercept +
        recessiveModelCoefficients.age * age +
        recessiveModelCoefficients.alccc * alccc;

    const probability1 = logisticFunction(z1);

    // 计算 recessive-model 的标准误差
    const variance1 = Math.pow(recessiveModelStdError.intercept, 2) +
                      Math.pow(recessiveModelStdError.age * age, 2) +
                      Math.pow(recessiveModelStdError.alccc * alccc, 2);
    const standardError1 = Math.sqrt(variance1);

    // 使用临界值 1.96 计算 95% 置信区间
    const zCritical = 1.96;
    const z1_upr = z1 + zCritical * standardError1;
    const z1_lwr = z1 - zCritical * standardError1;

    const lowerBound1 = logisticFunction(z1_lwr);
    const upperBound1 = logisticFunction(z1_upr);

    // 计算 rapid-model 的 z 值
    const z2 = rapidModelCoefficients.intercept +
        rapidModelCoefficients.age * age +
        rapidModelCoefficients.alccc * alccc;

    const probability2 = logisticFunction(z2);

    // 计算 rapid-model 的标准误差
    const variance2 = Math.pow(rapidModelStdError.intercept, 2) +
                      Math.pow(rapidModelStdError.age * age, 2) +
                      Math.pow(rapidModelStdError.alccc * alccc, 2);
    const standardError2 = Math.sqrt(variance2);

    // 计算 rapid-model 的 95% 置信区间
    const z2_upr = z2 + zCritical * standardError2;
    const z2_lwr = z2 - zCritical * standardError2;

    const lowerBound2 = logisticFunction(z2_lwr);
    const upperBound2 = logisticFunction(z2_upr);

    // 显示 recessive-model 的结果
    document.getElementById("result-recessive").innerText =
    `Risk of excessive AL progression: ${probability1.toFixed(4)},\n95% confidence intervals: [${lowerBound1.toFixed(4)}, ${upperBound1.toFixed(4)}]`;

    // 显示 rapid-model 的结果
    document.getElementById("result-rapid").innerText =
    `Risk of rapid AL progression: ${probability2.toFixed(4)},\n95% confidence intervals: [${lowerBound2.toFixed(4)}, ${upperBound2.toFixed(4)}]`;

}
