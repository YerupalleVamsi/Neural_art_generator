# api/generate.py
import json, base64, io
from PIL import Image
import numpy as np
import tensorflow as tf
import tensorflow_hub as hub

# Load model globally
hub_model = hub.load('https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2')

def load_image(file_bytes, image_size=256):
    img = Image.open(io.BytesIO(file_bytes)).convert('RGB')
    img = img.resize((image_size, image_size))
    img = np.array(img).astype(np.float32)/255.0
    return tf.expand_dims(img, axis=0)

def deprocess(image):
    image = tf.clip_by_value(image, 0.0, 1.0)
    image = (image[0].numpy()*255).astype(np.uint8)
    return Image.fromarray(image)

def handler(request):
    try:
        content_file = request.files['content'].read()
        style_file = request.files['style'].read()
        image_size = int(request.form.get('image_size', 256))

        content_image = load_image(content_file, image_size)
        style_image = load_image(style_file, image_size)

        stylized_image = hub_model(tf.constant(content_image), tf.constant(style_image))[0]
        output_image = deprocess(stylized_image)

        buffered = io.BytesIO()
        output_image.save(buffered, format="PNG")
        img_str = "data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode()

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"stylized_image": img_str})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)})
        }
