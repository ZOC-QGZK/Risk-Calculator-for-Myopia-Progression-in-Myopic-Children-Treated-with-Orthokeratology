<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Myopia Progression Risk Calculator</title>
</head>
<body>
    <h1>Myopia Progression Risk Calculator</h1>
    <label for="age">Age:</label>
    <input type="number" id="age" required>
    <label for="alccc">ALCCC:</label>
    <input type="number" id="alccc" required>
    <button onclick="calculateProbability()">Calculate Risk</button>

    <h2>Results</h2>
    <div id="result-recessive"></div>
    <div id="result-rapid"></div>

    <script>
        // 模型系数
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

        // Bootstrap方法计算置信区间
        function bootstrapConfidenceInterval(data, modelCoefficients, modelStdError, nBootstrap = 1000, alpha = 0.05) {
            const bootstrapSamples = [];

            for (let i = 0; i < nBootstrap; i++) {
                const sample = [];
                for (let j = 0; j < data.length; j++) {
                    const randomIndex = Math.floor(Math.random() * data.length);
                    sample.push(data[randomIndex]);
                }

                // 计算每个抽样样本的概率
                const probabilities = sample.map(entry => {
                    const z = modelCoefficients.intercept +
                              modelCoefficients.age * entry.age +
                              modelCoefficients.alccc * entry.alccc;
                    return logisticFunction(z);
                });

                bootstrapSamples.push(...probabilities);
            }

            bootstrapSamples.sort((a, b) => a - b);
            const lowerIndex = Math.floor(nBootstrap * alpha / 2);
            const upperIndex = Math.floor(nBootstrap * (1 - alpha / 2));

            return [
                bootstrapSamples[lowerIndex],
                bootstrapSamples[upperIndex]
            ];
        }

        // 计算预测概率和95%置信区间
        function calculateProbability() {
            const age = parseFloat(document.getElementById("age").value);
            const alccc = parseFloat(document.getElementById("alccc").value);

            const data = [{ age, alccc }]; // 构建单个样本数据

            // 计算 recessive-model 的概率
            const z1 = recessiveModelCoefficients.intercept +
                recessiveModelCoefficients.age * age +
                recessiveModelCoefficients.alccc * alccc;
            const probability1 = logisticFunction(z1);

            // 计算 recessive-model 的Bootstrap置信区间
            const confidenceInterval1 = bootstrapConfidenceInterval(data, recessiveModelCoefficients, recessiveModelStdError);

            // 计算 rapid-model 的概率
            const z2 = rapidModelCoefficients.intercept +
                rapidModelCoefficients.age * age +
                rapidModelCoefficients.alccc * alccc;
            const probability2 = logisticFunction(z2);

            // 计算 rapid-model 的Bootstrap置信区间
            const confidenceInterval2 = bootstrapConfidenceInterval(data, rapidModelCoefficients, rapidModelStdError);

            // 显示 recessive-model 的结果
            document.getElementById("result-recessive").innerText =
                `Risk of excessive myopia progression: ${probability1.toFixed(4)},\n95% confidence intervals: [${confidenceInterval1[0].toFixed(4)}, ${confidenceInterval1[1].toFixed(4)}]`;

            // 显示 rapid-model 的结果
            document.getElementById("result-rapid").innerText =
                `Risk of rapid myopia progression: ${probability2.toFixed(4)},\n95% confidence intervals: [${confidenceInterval2[0].toFixed(4)}, ${confidenceInterval2[1].toFixed(4)}]`;
        }
    </script>
</body>
</html>
