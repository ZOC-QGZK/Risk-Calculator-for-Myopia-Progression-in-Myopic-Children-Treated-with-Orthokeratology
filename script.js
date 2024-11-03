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

// 计算Logistic回归的概率
function logisticFunction(z) {
    return 1 / (1 + Math.exp(-z));
}

// 计算预测概率
function calculateProbability() {
    // 获取用户输入
    const age = parseFloat(document.getElementById("age").value);
    const alccc = parseFloat(document.getElementById("alccc").value);

    // 计算 recessive-model 的 z 值
    const z1 = recessiveModelCoefficients.intercept +
        recessiveModelCoefficients.age * age +
        recessiveModelCoefficients.alccc * alccc;

    const probability1 = logisticFunction(z1);

    // 计算 rapid-model 的 z 值
    const z2 = rapidModelCoefficients.intercept +
        rapidModelCoefficients.age * age +
        rapidModelCoefficients.alccc * alccc;

    const probability2 = logisticFunction(z2);

    // 显示 recessive-model 的结果
    document.getElementById("result-recessive").innerText =
    `Risk of excessive myopia progression: ${probability1.toFixed(4)}`;

    // 显示 rapid-model 的结果
    document.getElementById("result-rapid").innerText =
    `Risk of rapid myopia progression: ${probability2.toFixed(4)}`;
}
