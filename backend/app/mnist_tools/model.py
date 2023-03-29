import importlib.resources
import pickle

import cv2 # type: ignore
import numpy as np
from sklearn.neighbors import KNeighborsClassifier # type: ignore

from app.mnist_tools.config import MNIST_IMAGE_WITH_BORDER_AREA
import app.mnist_tools.image
import app.mnist_tools.loader

_BIN_PATH = 'app.mnist_tools.bin'
_MODEL_BIN_FILE_NAME = 'knn_model_bin.pkl'

_KNN_NUM_NEIGHBORS: int = 3

class MnistModel:
    def __init__(self) -> None:

        with importlib.resources.as_file(importlib.resources.files(_BIN_PATH)) as bin_path:

            if (bin_path / _MODEL_BIN_FILE_NAME).is_file():
                with open(str(bin_path / _MODEL_BIN_FILE_NAME), 'rb') as model_bin_file:
                    self.model = pickle.load(model_bin_file)

                    if not isinstance(self.model, KNeighborsClassifier):
                        raise ValueError(f"Model loaded from file has incorrect type, expected {str(KNeighborsClassifier)}, got {str(type(self.model))}")

            else:
                self.model = KNeighborsClassifier(n_neighbors=_KNN_NUM_NEIGHBORS)
                train_images, train_labels, _, _ = app.mnist_tools.loader.load()
                num_samples, num_x, num_y = train_images.shape
                train_images = train_images.reshape(num_samples, num_x*num_y)
                self.model.fit(train_images, train_labels)
                with open(str(bin_path / _MODEL_BIN_FILE_NAME), 'wb') as model_bin_file:
                    pickle.dump(self.model, model_bin_file)


    def predict_probs(self, img: cv2.Mat) -> dict[int, float]:
        img = app.mnist_tools.image.preprocess(img)

        flat_img = np.array(img).reshape(1, MNIST_IMAGE_WITH_BORDER_AREA)

        return dict(enumerate(self.model.predict_proba(flat_img)[0]))
