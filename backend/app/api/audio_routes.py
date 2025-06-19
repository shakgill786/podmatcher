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
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@audio_routes.route("/upload", methods=["POST"])
@login_required
def upload_audio():
    file = request.files.get("file")
    if not file or file.filename == "":
        return jsonify({"error": "No file provided"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    # build safe filename with timestamp
    fname = secure_filename(f"user_{current_user.id}_{int(time.time())}_{file.filename}")
    upload_folder = os.path.join(current_app.root_path, "static", "audio_snippets")
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, fname)
    file.save(filepath)

    # update user model
    current_user.audio_file = fname
    db.session.commit()

    return jsonify({"filename": fname}), 200

@audio_routes.route("/upload", methods=["DELETE"])
@login_required
def delete_audio():
    fname = current_user.audio_file
    if not fname:
        return jsonify({"error": "No snippet to delete"}), 404

    path = os.path.join(current_app.root_path, "static", "audio_snippets", fname)
    if os.path.exists(path):
        os.remove(path)

    current_user.audio_file = None
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200
