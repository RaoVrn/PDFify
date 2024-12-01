import os
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
import fitz
from docx import Document
from PIL import Image
from flask_cors import CORS

app = Flask(__name__)
CORS = (app)

@app.after_request
def after_request(response):
  response.headers.add('Access-Control-Allow-Origin', '*')
  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  return response

# Set absolute paths for uploads and converted folders
base_dir = os.path.dirname(os.path.abspath(__file__))
upload_folder = os.path.join(base_dir, 'uploads')
converted_folder = os.path.join(base_dir, 'converted')

# Create subdirectories for each conversion type
text_dir = os.path.join(converted_folder, 'text')
word_dir = os.path.join(converted_folder, 'word')
img_dir = os.path.join(converted_folder, 'images')

# Ensure the directories exist
os.makedirs(upload_folder, exist_ok=True)
os.makedirs(text_dir, exist_ok=True)
os.makedirs(word_dir, exist_ok=True)
os.makedirs(img_dir, exist_ok=True)

app.config['UPLOAD_FOLDER'] = upload_folder
app.config['CONVERTED_FOLDER'] = converted_folder
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}

# Helper function to check file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# PDF to Text conversion
def pdf_to_text(pdf_path):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"File {pdf_path} does not exist.")
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    text_file = os.path.join(text_dir, f'{os.path.splitext(os.path.basename(pdf_path))[0]}.txt')
    with open(text_file, 'w', encoding='utf-8') as f:
        f.write(text)
    return text_file

# PDF to Word conversion
def pdf_to_word(pdf_path):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"File {pdf_path} does not exist.")
    doc = Document()
    reader = PdfReader(pdf_path)
    for page in reader.pages:
        doc.add_paragraph(page.extract_text())
    word_file = os.path.join(word_dir, f'{os.path.splitext(os.path.basename(pdf_path))[0]}.docx')
    doc.save(word_file)
    return word_file

# PDF to Image conversion

def pdf_to_image(pdf_path):
    doc = fitz.open(pdf_path)
    img_paths = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(dpi=300)
        img_path = os.path.join(img_dir, f'{os.path.splitext(os.path.basename(pdf_path))[0]}_{page_num+1}.png')
        pix.save(img_path)
        img_paths.append(img_path)
    return img_paths


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    file = request.files['file']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        print(f"Saving file to: {file_path}")
        file.save(file_path)
        return jsonify({'message': 'File uploaded successfully', 'filename': filename}), 200
    return jsonify({'message': 'Invalid file format'}), 400

@app.route('/converted', methods=['POST'])
def convert_file():
    data = request.json
    filename = data.get('filename')
    conversion_type = data.get('conversion_type')

    if not filename or not conversion_type:
        return jsonify({'message': 'Missing filename or conversion type'}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    try:
        converted_files = []
        
        # Debug log to verify the file path
        print(f"Processing file: {file_path}")
        
        if conversion_type == 'text':
            print("Converting to text...")
            text_file = pdf_to_text(file_path)
            converted_files.append({'type': 'text', 'filename': os.path.basename(text_file)})

        elif conversion_type == 'word':
            print("Converting to word...")
            word_file = pdf_to_word(file_path)
            converted_files.append({'type': 'word', 'filename': os.path.basename(word_file)})

        elif conversion_type == 'image':
            print("Converting to image...")
            img_paths = pdf_to_image(file_path)
            converted_files.extend([{'type': 'image', 'filename': os.path.basename(img)} for img in img_paths])

        else:
            return jsonify({'message': 'Invalid conversion type'}), 400

        return jsonify({'converted_files': converted_files}), 200

    except Exception as e:
        # Log the error for debugging
        print(f"Error: {str(e)}")
        return jsonify({'message': f"Error converting file: {str(e)}"}), 500




@app.route('/download/<conversion_type>/<filename>', methods=['GET'])
def download_file(conversion_type, filename):
    # Map conversion type to corresponding directory
    folder_map = {
        'text': text_dir,
        'word': word_dir,
        'image': img_dir,
    }

    if conversion_type not in folder_map:
        return jsonify({'message': 'Invalid conversion type'}), 400

    folder = folder_map[conversion_type]
    return send_from_directory(folder, filename)

if __name__ == '__main__':
    app.run(debug=True)
