import os
import uuid
import shutil

from fastapi import UploadFile
from app.core.exceptions import BadRequestException


ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"]

MAX_FILE_SIZE = 5 * 1024 * 1024


class FileHandler:

    @staticmethod
    async def save_file(file: UploadFile, folder: str):

        extension = os.path.splitext(file.filename)[1].lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise BadRequestException(
                "Invalid file type"
            )

        content = await file.read()

        if len(content) > MAX_FILE_SIZE:
            raise BadRequestException(
                "File too large"
            )

        filename = f"{uuid.uuid4()}{extension}"

        file_path = os.path.join(folder, filename)

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        return file_path


file_handler = FileHandler()