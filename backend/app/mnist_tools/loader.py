import gzip
import importlib.resources
import math
from pathlib import Path
import struct
from typing import Tuple

import numpy as np
import numpy.typing as npt

_RESOURCE_PATH: str = 'app.mnist_tools.resource'

_TRAIN_IMAGES_FILE_NAME: str = 'train-images-idx3-ubyte.gz'
_TRAIN_LABELS_FILE_NAME: str = 'train-labels-idx1-ubyte.gz'
_TEST_IMAGES_FILE_NAME: str = 't10k-images-idx3-ubyte.gz'
_TEST_LABELS_FILE_NAME: str = 't10k-labels-idx1-ubyte.gz'

_IDX_ENDIANNESS_FORMAT: str = '>'

_IDX_HEADER_SIZE: int = 4
_IDX_HEADER_FORMAT: str = 'HBB'
_IDX_HEADER_ZEROS: bytes = b'\x00\x00'
_IDX_DIM_DIZE: int = 4
_IDX_DIM_FORMAT: str = 'I'

_IDX_DTYPE_MAP: dict[bytes, npt.DTypeLike] = { b'\x08': np.uint8, b'\x09': np.int8, b'\x0B': np.int16, b'\x0C': np.int32, b'\x0D': np.float32, b'\x0E': np.float64 }

def _read_idx_file(file_path: Path) -> np.ndarray:
    with gzip.open(file_path, 'rb') as file:
        idx_header_zeros, idx_header_dtype, idx_header_ndim = struct.unpack(f"{_IDX_ENDIANNESS_FORMAT}{_IDX_HEADER_FORMAT}", file.read(_IDX_HEADER_SIZE))

        idx_header_zeros_bytes = int.to_bytes(idx_header_zeros, 2, 'big')
        if idx_header_zeros_bytes != _IDX_HEADER_ZEROS:
            raise ValueError(f"IDX file header incorrect format for first two bytes, expected {_IDX_HEADER_ZEROS!r}, read {idx_header_zeros_bytes!r}")
        
        idx_header_dtype_bytes = int.to_bytes(idx_header_dtype, 1, 'big')
        if idx_header_dtype_bytes not in _IDX_DTYPE_MAP:
            raise ValueError(f"IDX file header incorrect format for data type, expected {_IDX_DTYPE_MAP.keys()!r}, read {idx_header_dtype_bytes!r}")
        
        data_shape: tuple = struct.unpack(f"{_IDX_ENDIANNESS_FORMAT}{_IDX_DIM_FORMAT*idx_header_ndim}", file.read(_IDX_DIM_DIZE*idx_header_ndim))
        data_size: int = math.prod(data_shape) * np.dtype(np.uint16).itemsize
        data_type = np.dtype(_IDX_DTYPE_MAP[idx_header_dtype_bytes])
        data_type.newbyteorder('>')

        return np.frombuffer(file.read(data_size), dtype=data_type).reshape(data_shape)

def load() -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    with importlib.resources.as_file(importlib.resources.files(_RESOURCE_PATH)) as data_path:
        train_images = _read_idx_file(data_path / _TRAIN_IMAGES_FILE_NAME)
        train_labels = _read_idx_file(data_path / _TRAIN_LABELS_FILE_NAME)
        test_images = _read_idx_file(data_path / _TEST_IMAGES_FILE_NAME)
        test_labels = _read_idx_file(data_path / _TEST_LABELS_FILE_NAME)

        return train_images, train_labels, test_images, test_labels

if __name__ == '__main__':
    import cv2 # type: ignore
    import loader # type: ignore
    train_images, train_labels, _, _ = loader.load()

    for i in range(10):
        cv2.imshow(f"Example #{i+1}, Label: {train_labels[i]}", train_images[i])
        cv2.waitKey(0)
        cv2.destroyAllWindows()
