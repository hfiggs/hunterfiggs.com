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

_IDX_DTYPE_MAP: dict[bytes, npt.DTypeLike] = {b'\x08': np.uint8,
                                              b'\x09': np.int8,
                                              b'\x0B': np.int16,
                                              b'\x0C': np.int32,
                                              b'\x0D': np.float32,
                                              b'\x0E': np.float64}


def _read_idx_file(file_path: Path) -> np.ndarray:
    with gzip.open(file_path, 'rb') as file:

        header_bytes: bytes = file.read(_IDX_HEADER_SIZE)

        if len(header_bytes) != _IDX_HEADER_SIZE:
            raise ValueError(
                (
                    "IDX file header length too small,"
                    f" expected {_IDX_HEADER_SIZE} bytes,"
                    f" read {len(header_bytes)} bytes"
                )
            )

        idx_header_zeros, idx_header_dtype, idx_header_ndim = struct.unpack(
            f"{_IDX_ENDIANNESS_FORMAT}{_IDX_HEADER_FORMAT}",
            header_bytes
        )

        idx_header_zeros_bytes = int.to_bytes(idx_header_zeros, 2, 'big')
        if idx_header_zeros_bytes != _IDX_HEADER_ZEROS:
            raise ValueError(
                (
                    "IDX file header missing first two zero bytes,"
                    f" expected {_IDX_HEADER_ZEROS!r},"
                    f" read {idx_header_zeros_bytes!r}"
                )
            )

        idx_header_dtype_bytes = int.to_bytes(idx_header_dtype, 1, 'big')
        if idx_header_dtype_bytes not in _IDX_DTYPE_MAP:
            raise ValueError(
                (
                    "IDX file header has invalid data type,"
                    f" expected {_IDX_DTYPE_MAP.keys()!r},"
                    f" read {idx_header_dtype_bytes!r}"
                )
            )

        dim_bytes: bytes = file.read(_IDX_DIM_DIZE*idx_header_ndim)

        if len(dim_bytes) != _IDX_DIM_DIZE*idx_header_ndim:
            raise ValueError(
                (
                    "IDX file dimensions length incorrect,"
                    f" expected {_IDX_DIM_DIZE*idx_header_ndim} bytes,"
                    f" read {len(dim_bytes)} bytes"
                )
            )

        data_shape: tuple = struct.unpack(
            f"{_IDX_ENDIANNESS_FORMAT}{_IDX_DIM_FORMAT*idx_header_ndim}",
            dim_bytes
        )

        data_type = np.dtype(_IDX_DTYPE_MAP[idx_header_dtype_bytes])
        data_type.newbyteorder('>')

        data_item_num = math.prod(data_shape) if len(data_shape) != 0 else 0
        data_size: int = data_item_num * data_type.itemsize

        data_bytes: bytes = file.read(data_size)

        if len(data_bytes) != data_size:
            raise ValueError(
                (
                    "IDX file data length incorrect,"
                    f" expected {data_size} bytes,"
                    f" read {len(data_bytes)} bytes"
                )
            )

        data = np.frombuffer(data_bytes, dtype=data_type)

        if data.size != 0:
            data = data.reshape(data_shape)

        return data


def load() -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    with importlib.resources.as_file(importlib.resources.files(_RESOURCE_PATH)) as path:
        train_images = _read_idx_file(path / _TRAIN_IMAGES_FILE_NAME)
        train_labels = _read_idx_file(path / _TRAIN_LABELS_FILE_NAME)
        test_images = _read_idx_file(path / _TEST_IMAGES_FILE_NAME)
        test_labels = _read_idx_file(path / _TEST_LABELS_FILE_NAME)

        return train_images, train_labels, test_images, test_labels
