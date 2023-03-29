import cv2 # type: ignore
from fastapi import FastAPI, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

import app.mnist_tools.model # type: ignore

model = app.mnist_tools.model.MnistModel()

app = FastAPI()

origins = [
    "https://www.hunterfiggs.com",
    "http://localhost",
    "http://localhost:5500",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def main():
    content = """
<body>
<form action="/predict-digit/" enctype="multipart/form-data" method="post">
<input name="file" type="file">
<input type="submit">
</form>
</body>
    """
    return HTMLResponse(content=content)

@app.post("/predict-digit/")
async def predict_digit(file: UploadFile):
    img_raw = await file.read()
    img_buf = np.asarray(bytearray(img_raw), dtype="uint8")
    img = cv2.imdecode(img_buf, cv2.IMREAD_UNCHANGED)

    return {"probs": model.predict_probs(img)}
