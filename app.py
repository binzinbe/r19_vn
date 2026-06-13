from flask import Flask, render_template, send_from_directory, jsonify
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/characters')
def get_characters():
    with open('data/characters.json', 'r', encoding='utf-8') as f:
        import json
        return jsonify(json.load(f))

@app.route('/data/<path:filename>')
def serve_data(filename):
    return send_from_directory('data', filename)

@app.route('/image/<path:filename>')
def serve_image(filename):
    return send_from_directory('image', filename)

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True, port=5533)
