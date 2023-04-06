import gzip
from pathlib import Path

import pytest

from app.mnist_tools import loader

IDX_FILE_NAME = 'temp'
IDX_FILE_NAME_SUFFIX = '-idx3-ubyte'
GZIP_FILE_EXT = '.gz'


@pytest.mark.parametrize(("b"), [
    b'',
    b'\x00',
    b'\x00\x00',
    b'\x00\x00\x08',
])
def test_read_idx_file_bad_header_length(b: bytes, tmp_path: Path):
    file_path = tmp_path / f"{IDX_FILE_NAME}{IDX_FILE_NAME_SUFFIX}{GZIP_FILE_EXT}"
    with gzip.open(file_path, 'wb') as f:
        f.write(b)

    with pytest.raises(ValueError) as excinfo:
        loader._read_idx_file(file_path)

    assert "header length" in str(excinfo.value)


@pytest.mark.parametrize(("b"), [
    b'\x00\x01\x08\x00',
    b'\x01\x00\x08\x00',
    b'\x69\x69\x08\x00',
])
def test_read_idx_file_bad_header_first_two_zero_bytes(b: bytes, tmp_path: Path):
    file_path = tmp_path / f"{IDX_FILE_NAME}{IDX_FILE_NAME_SUFFIX}{GZIP_FILE_EXT}"
    with gzip.open(file_path, 'wb') as f:
        f.write(b)

    with pytest.raises(ValueError) as excinfo:
        loader._read_idx_file(file_path)

    assert "zero bytes" in str(excinfo.value)


@pytest.mark.parametrize(("b"), [
    b'\x00\x00\x00\x00',
    b'\x00\x00\x01\x00',
    b'\x00\x00\x07\x00',
    b'\x00\x00\x0F\x00',
    b'\x00\x00\x80\x00',
])
def test_read_idx_file_bad_header_invalid_data_type(b: bytes, tmp_path: Path):
    file_path = tmp_path / f"{IDX_FILE_NAME}{IDX_FILE_NAME_SUFFIX}{GZIP_FILE_EXT}"
    with gzip.open(file_path, 'wb') as f:
        f.write(b)

    with pytest.raises(ValueError) as excinfo:
        loader._read_idx_file(file_path)

    assert "data type" in str(excinfo.value)


@pytest.mark.parametrize(("b"), [
    b'\x00\x00\x08\x01',
    b'\x00\x00\x08\x02\x00\x01',
    b'\x00\x00\x08\x02\x00\x01\x00',
    b'\x00\x00\x08\x10\x00\x01\x00\x01\x00\x01\x00\x01',
])
def test_read_idx_file_bad_dimensions_length(b: bytes, tmp_path: Path):
    file_path = tmp_path / f"{IDX_FILE_NAME}{IDX_FILE_NAME_SUFFIX}{GZIP_FILE_EXT}"
    with gzip.open(file_path, 'wb') as f:
        f.write(b)

    with pytest.raises(ValueError) as excinfo:
        loader._read_idx_file(file_path)

    assert "dimensions length" in str(excinfo.value)


@pytest.mark.parametrize(("b"), [
    b'\x00\x00\x08\x01\x00\x00\x00\x01',
    b'\x00\x00\x08\x01\x00\x00\x00\x02\x69',
    b'\x00\x00\x0B\x01\x00\x00\x00\x01',
    b'\x00\x00\x0B\x01\x00\x00\x00\x02\x69\x69',
])
def test_read_idx_file_bad_data_length(b: bytes, tmp_path: Path):
    file_path = tmp_path / f"{IDX_FILE_NAME}{IDX_FILE_NAME_SUFFIX}{GZIP_FILE_EXT}"
    with gzip.open(file_path, 'wb') as f:
        f.write(b)

    with pytest.raises(ValueError) as excinfo:
        loader._read_idx_file(file_path)

    assert "data length" in str(excinfo.value)


def test_read_idx_file_no_data(tmp_path: Path):
    file_path = tmp_path / f"{IDX_FILE_NAME}{IDX_FILE_NAME_SUFFIX}{GZIP_FILE_EXT}"
    with gzip.open(file_path, 'wb') as f:
        f.write(b'\x00\x00\x08\x00')

    data = loader._read_idx_file(file_path)

    assert len(data) == 0
