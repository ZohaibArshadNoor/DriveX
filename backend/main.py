from fastapi import FastAPI\n\napp = FastAPI(title="DriveX Rental API")\n\n@app.get("/")\ndef read_root():\n    return {"message": "DriveX Rental API scaffold"}\n
