# backend/app/api/audio_routes.py

import os
import time
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app.models import db

audio_routes = Blueprint("audio", __name__)

ALLOWED_EXTENSIONS = {"mp3", "wav", "m4a", "webm"}

def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )

@audio_routes.route("/upload", methods=["POST"])
@login_required
def upload_audio():
    # 1) Make sure we got a file
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    # 2) Build safe filename
    filename = secure_filename(
        f"user_{current_user.id}_{int(time.time())}_{file.filename}"
    )
    upload_folder = os.path.join(
        current_app.root_path, "static", "audio_snippets"
    )
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, filename)

    # 3) Save & commit to user
    file.save(filepath)
    current_user.audio_file = filename
    db.session.commit()

    return jsonify({"filename": filename}), 200

@audio_routes.route("/upload", methods=["DELETE"])
@login_required
def delete_audio():
    # 1) Nothing to delete?
    if not current_user.audio_file:
        return jsonify({"error": "No snippet to delete"}), 404

    # 2) Remove file if it exists
    path = os.path.join(
        current_app.root_path, "static", "audio_snippets", current_user.audio_file
    )
    if os.path.exists(path):
        os.remove(path)

    # 3) Clear user record
    current_user.audio_file = None
    db.session.commit()

    return jsonify({"message": "Deleted"}), 200
