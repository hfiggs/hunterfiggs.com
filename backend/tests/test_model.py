import importlib.resources
import pickle
from pathlib import Path

import numpy as np
import pytest

from app.mnist_tools import model
from app.mnist_tools.model import _BIN_PATH, _MODEL_BIN_FILE_NAME

PROBS_DICT_LENGTH: int = 10


@pytest.fixture
def dummy_image() -> np.ndarray:
    return np.zeros((100, 100, 3), dtype='uint8')


def test_model_train_model(dummy_image: np.ndarray):
    # Delete model bin file if it exists
    with importlib.resources.as_file(importlib.resources.files(_BIN_PATH)) as path:
        if (path / _MODEL_BIN_FILE_NAME).is_file():
            Path.unlink(path / model._MODEL_BIN_FILE_NAME)

        assert not (path / _MODEL_BIN_FILE_NAME).is_file()

    # Get model via training
    m = model.MnistModel()

    probs_dict = m.predict_probs(dummy_image)

    assert len(probs_dict) == PROBS_DICT_LENGTH


def test_model_load_model(dummy_image: np.ndarray):
    # Ensure model bin exists
    model.MnistModel()

    with importlib.resources.as_file(importlib.resources.files(_BIN_PATH)) as path:
        assert (path / _MODEL_BIN_FILE_NAME).is_file()

    # Get model via loading from bin
    m = model.MnistModel()

    probs_dict = m.predict_probs(dummy_image)

    assert len(probs_dict) == PROBS_DICT_LENGTH


def test_model_bad_model_pickle():
    # Ensure model bin exists
    model.MnistModel()

    with importlib.resources.as_file(importlib.resources.files(_BIN_PATH)) as path:
        assert (path / _MODEL_BIN_FILE_NAME).is_file()

        # Overwrite model bin with junk
        with open(path / _MODEL_BIN_FILE_NAME, 'wb') as model_bin_file:
            model_bin_file.write("not a pickle".encode())

    with pytest.raises(pickle.UnpicklingError):
        model.MnistModel()

    # Cleanup model bin
    with importlib.resources.as_file(importlib.resources.files(_BIN_PATH)) as path:
        if (path / _MODEL_BIN_FILE_NAME).is_file():
            Path.unlink(path / model._MODEL_BIN_FILE_NAME)

        assert not (path / _MODEL_BIN_FILE_NAME).is_file()


def test_model_bad_model_pickle_type():
    # Delete model bin file if it exists
    with importlib.resources.as_file(importlib.resources.files(_BIN_PATH)) as path:
        if (path / _MODEL_BIN_FILE_NAME).is_file():
            Path.unlink(path / model._MODEL_BIN_FILE_NAME)

        assert not (path / _MODEL_BIN_FILE_NAME).is_file()

    # Ensure model bin exists
    model.MnistModel()

    with importlib.resources.as_file(importlib.resources.files(_BIN_PATH)) as path:
        assert (path / _MODEL_BIN_FILE_NAME).is_file()

        # Overwrite model bin with pickle dump of wrong type
        with open(path / _MODEL_BIN_FILE_NAME, 'wb') as model_bin_file:
            pickle.dump("wrong type", model_bin_file)

    with pytest.raises(ValueError):
        model.MnistModel()

    # Cleanup model bin
    with importlib.resources.as_file(importlib.resources.files(_BIN_PATH)) as path:
        if (path / _MODEL_BIN_FILE_NAME).is_file():
            Path.unlink(path / model._MODEL_BIN_FILE_NAME)

        assert not (path / _MODEL_BIN_FILE_NAME).is_file()
