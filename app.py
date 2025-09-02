from flask import Flask, request, jsonify, render_template
import os
import utils
from werkzeug.exceptions import RequestEntityTooLarge

app = Flask(__name__)

# Max upload size 10 MB
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  

# Load model
utils.load_saved_artifacts()

# Handle file too large
@app.errorhandler(RequestEntityTooLarge)
def handle_large_file(e):
    return jsonify({"error": "File too large. Maximum allowed size is 10 MB."}), 413

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/classify_image', methods=['POST'])
def classify_image_route():
    image_data = request.form.get('image_data')
    if not image_data:
        return jsonify({'error': 'No image data received'}), 400

    try:
        result = utils.classify_image(image_data)
        if not result:
            return jsonify({'error': 'Could not classify image'}), 400
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    print("Starting Flask Server for Cricketer Classification...")
    port = int(os.environ.get("PORT", 5000))
    print(f"Running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port)
