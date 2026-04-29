import pandas as pd
from catboost import CatBoostClassifier
import json
import os

df = pd.read_csv('Health_Risk_Dataset.csv')

feature_cols = ['Heart_Rate', 'Oxygen_Saturation', 'Systolic_BP', 'Temperature']
X = df[feature_cols]

risk_map = {'Low': 0, 'Normal': 0, 'Medium': 1, 'High': 2}
y = df['Risk_Level'].map(risk_map)

model = CatBoostClassifier(iterations=30, depth=4, learning_rate=0.1, verbose=0)
model.fit(X, y)

model.save_model('catboost_model.json', format='json')

with open('catboost_model.json', 'r') as f:
    model_data = json.load(f)

scale, bias = model_data.get('scale_and_bias', [1.0, [0.0, 0.0, 0.0]])
if not isinstance(bias, list):
    bias = [bias] * 3

js_lines = []
js_lines.append("class RiskPredictor {")
js_lines.append("    static predict(bpm, spo2, sys, temp) {")
js_lines.append("        const features = [bpm, spo2, sys, temp];")
js_lines.append("        let logits = [0, 0, 0];")

trees = model_data['oblivious_trees']
for t_idx, tree in enumerate(trees):
    js_lines.append("")
    js_lines.append("        {")
    js_lines.append("            let index = 0;")
    splits = tree.get('splits', [])
    for s_idx, split in enumerate(splits):
        f_idx = split['float_feature_index']
        border = split['border']
        js_lines.append(f"            if (features[{f_idx}] > {border}) index |= (1 << {s_idx});")
    
    leaf_vals = tree['leaf_values']
    leaf_vals_str = "[" + ", ".join(map(str, leaf_vals)) + "]"
    js_lines.append(f"            const leaves = {leaf_vals_str};")
    js_lines.append("            logits[0] += leaves[index * 3 + 0];")
    js_lines.append("            logits[1] += leaves[index * 3 + 1];")
    js_lines.append("            logits[2] += leaves[index * 3 + 2];")
    js_lines.append("        }")

js_lines.append("")
js_lines.append(f"        logits[0] = logits[0] * {scale} + {bias[0]};")
js_lines.append(f"        logits[1] = logits[1] * {scale} + {bias[1]};")
js_lines.append(f"        logits[2] = logits[2] * {scale} + {bias[2]};")
js_lines.append("")
js_lines.append("        let maxIndex = 0;")
js_lines.append("        let maxValue = logits[0];")
js_lines.append("        for (let i = 1; i < 3; i++) {")
js_lines.append("            if (logits[i] > maxValue) {")
js_lines.append("                maxValue = logits[i];")
js_lines.append("                maxIndex = i;")
js_lines.append("            }")
js_lines.append("        }")
js_lines.append("")
js_lines.append("        const labels = ['Low Risk', 'Elevated Risk', 'High Risk'];")
js_lines.append("        return {")
js_lines.append("            riskLevel: maxIndex,")
js_lines.append("            riskLabel: labels[maxIndex]")
js_lines.append("        };")
js_lines.append("    }")
js_lines.append("}")
js_lines.append("")
js_lines.append("export default RiskPredictor;")

output_path = os.path.join('src', 'ml', 'RiskPredictor.js')
with open(output_path, 'w') as f:
    f.write("\n".join(js_lines))

print(f"Successfully trained CatBoost and generated {output_path}")
