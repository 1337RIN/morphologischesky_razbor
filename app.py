import os
# Добавляем render_template в импорт из flask
from flask import Flask, request, jsonify, render_template 
from flask_cors import CORS 
from main import analyze_sentence

app = Flask(__name__)
CORS(app) 

# ДОБАВЛЯЕМ ЭТОТ МАРШРУТ: он будет отдавать твою веб-страницу локально
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def api_analyze():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "Передайте текст в поле 'text'"}), 400
    text = data['text']
    analysis_result = analyze_sentence(text)
    return jsonify(analysis_result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)