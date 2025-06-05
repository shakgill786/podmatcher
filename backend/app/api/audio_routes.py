# app/api/audio_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
import os
from werkzeug.utils import secure_filename

audio_routes = Blueprint("audio", __name__)

UPLOAD_FOLDER = 'static/audio_snippets'
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'm4a'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@audio_routes.route("/upload", methods=["POST"])
@login_required
def upload_audio():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(f"user_{current_user.id}_{file.filename}")
        path = os.path.join(UPLOAD_FOLDER, filename)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file.save(path)

        # Save filename to user model if needed
        current_user.audio_file = filename
        from app.models import db
        db.session.commit()

        return jsonify({"filename": filename}), 200

    return jsonify({"error": "Invalid file type"}), 400
