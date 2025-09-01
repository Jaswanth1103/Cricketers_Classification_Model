from flask import Flask, request, jsonify
import os
import utils

app = Flask(__name__)

@app.route('/classify_image', methods=['POST'])
def classify_image_route():
    image_data = request.form.get('image_data')
    if not image_data:
        return jsonify({'error': 'No image data received'}), 400

    response = jsonify(utils.classify_image(image_data))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    print("Starting Flask Server for Cricketer Classification...")
    utils.load_saved_artifacts()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
