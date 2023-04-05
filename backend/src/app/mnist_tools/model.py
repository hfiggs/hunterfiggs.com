import importlib.resources
import pickle

import numpy as np
from sklearn.neighbors import KNeighborsClassifier  # type: ignore

from .config import MNIST_IMAGE_WITH_BORDER_AREA
from .image import preprocess
from .loader import load

_BIN_PATH = 'app.mnist_tools.bin'
_MODEL_BIN_FILE_NAME = 'knn_model_bin.pkl'

_KNN_NUM_NEIGHBORS: int = 3


class MnistModel:
    def __init__(self) -> None:

        with importlib.resources.as_file(importlib.resources.files(_BIN_PATH)) as path:

            if (path / _MODEL_BIN_FILE_NAME).is_file():
                with open(str(path / _MODEL_BIN_FILE_NAME), 'rb') as model_bin_file:
                    self.model = pickle.load(model_bin_file)

                    if not isinstance(self.model, KNeighborsClassifier):
                        raise ValueError(
                            (
                                "Model loaded from file has incorrect type,"
                                f" expected {str(KNeighborsClassifier)},"
                                f" got {str(type(self.model))}"
                            )
                        )

            else:
                self.model = KNeighborsClassifier(
                    n_neighbors=_KNN_NUM_NEIGHBORS)
                train_images, train_labels, _, _ = load()
                num_samples, num_x, num_y = train_images.shape
                train_images = train_images.reshape(num_samples, num_x*num_y)
                self.model.fit(train_images, train_labels)
                with open(str(path / _MODEL_BIN_FILE_NAME), 'wb') as model_bin_file:
                    pickle.dump(self.model, model_bin_file)

    def predict_probs(self, img: np.ndarray) -> dict[int, float]:
        img = preprocess(img)

        flat_img = img.reshape(1, MNIST_IMAGE_WITH_BORDER_AREA)

        return dict(enumerate(self.model.predict_proba(flat_img)[0]))
