import numpy as np
import pytest

from app.mnist_tools import config, image


@pytest.mark.parametrize(("img"), [
    [],
    [[[]]],
    np.zeros((10, 10, 10, 3), dtype='uint8'),
    np.zeros((10, 10), dtype='uint8'),
    np.zeros((0,  10, 3), dtype='uint8'),
    np.zeros((10,  0, 3), dtype='uint8'),
    np.zeros((0,   0, 3), dtype='uint8'),
    np.zeros((10, 10, 0), dtype='uint8'),
    np.zeros((0,   0, 0), dtype='uint8'),
    np.zeros((10, 10, 2), dtype='uint8'),
    np.zeros((10, 10, 5), dtype='uint8'),
    np.zeros((10, 10, 3), dtype='uint16'),
    np.zeros((10, 10, 3), dtype='float64'),
])
def test_is_valid_bad(img: np.ndarray):
    assert not image._is_valid_img(img)


@pytest.mark.parametrize(("img"), [
    np.zeros((1, 1, 3), dtype='uint8'),
    np.zeros((1, 1, 4), dtype='uint8'),
    np.zeros((10, 10, 3), dtype='uint8'),
    np.zeros((10, 10, 4), dtype='uint8'),
    np.zeros((10, 20, 3), dtype='uint8'),
    np.zeros((20, 10, 3), dtype='uint8'),
    np.zeros((1000, 1000, 3), dtype='uint8'),
])
def test_is_valid_good(img: np.ndarray):
    assert image._is_valid_img(img)


@pytest.mark.parametrize(("img"), [
    np.zeros((1, 1, 3), dtype='uint8'),
    np.zeros((1, 1, 4), dtype='uint8'),
    np.zeros((10, 10, 3), dtype='uint8'),
    np.zeros((100, 100, 3), dtype='uint8'),
])
def test_preprocess_black_square_img(img: np.ndarray):
    p_img = image.preprocess(img)

    expected_p_img = np.full(
        (config.MNIST_IMAGE_WITH_BORDER_SIZE, config.MNIST_IMAGE_WITH_BORDER_SIZE),
        np.iinfo('uint8').max - config.MNIST_IMAGE_BACKGROUND_VALUE,
        dtype='uint8'
    )

    start = config.MNIST_IMAGE_BORDER_SIZE
    end = start + config.MNIST_IMAGE_SIZE

    expected_p_img[start:end, start:end] = config.MNIST_IMAGE_BACKGROUND_VALUE

    assert p_img.shape == expected_p_img.shape
    assert not (np.bitwise_xor(p_img, expected_p_img).any())


def test_preprocess_black_wide_rectangle_img():
    img = np.zeros((10, 20, 3), dtype='uint8')

    p_img = image.preprocess(img)

    expected_p_img = np.full(
        (config.MNIST_IMAGE_WITH_BORDER_SIZE, config.MNIST_IMAGE_WITH_BORDER_SIZE),
        np.iinfo('uint8').max - config.MNIST_IMAGE_BACKGROUND_VALUE,
        dtype='uint8'
    )

    start_x = config.MNIST_IMAGE_BORDER_SIZE + 5
    end_x = start_x + config.MNIST_IMAGE_SIZE - 10

    start_y = config.MNIST_IMAGE_BORDER_SIZE
    end_y = start_y + config.MNIST_IMAGE_SIZE

    expected_p_img[start_x:end_x,
                   start_y:end_y] = config.MNIST_IMAGE_BACKGROUND_VALUE

    assert p_img.shape == expected_p_img.shape
    assert not (np.bitwise_xor(p_img, expected_p_img).any())


def test_preprocess_black_tall_rectangle_img():
    img = np.zeros((20, 10, 3), dtype='uint8')

    p_img = image.preprocess(img)

    expected_p_img = np.full(
        (config.MNIST_IMAGE_WITH_BORDER_SIZE, config.MNIST_IMAGE_WITH_BORDER_SIZE),
        np.iinfo('uint8').max - config.MNIST_IMAGE_BACKGROUND_VALUE,
        dtype='uint8'
    )

    start_x = config.MNIST_IMAGE_BORDER_SIZE
    end_x = start_x + config.MNIST_IMAGE_SIZE

    start_y = config.MNIST_IMAGE_BORDER_SIZE + 5
    end_y = start_y + config.MNIST_IMAGE_SIZE - 10

    expected_p_img[start_x:end_x,
                   start_y:end_y] = config.MNIST_IMAGE_BACKGROUND_VALUE

    assert p_img.shape == expected_p_img.shape
    assert not (np.bitwise_xor(p_img, expected_p_img).any())


@pytest.mark.parametrize(("img"), [
    [],
    [[[]]],
    np.zeros((10, 10, 10, 3), dtype='uint8'),
    np.zeros((10, 10), dtype='uint8'),
    np.zeros((0,  10, 3), dtype='uint8'),
    np.zeros((10,  0, 3), dtype='uint8'),
    np.zeros((0,   0, 3), dtype='uint8'),
    np.zeros((10, 10, 0), dtype='uint8'),
    np.zeros((0,   0, 0), dtype='uint8'),
    np.zeros((10, 10, 2), dtype='uint8'),
    np.zeros((10, 10, 5), dtype='uint8'),
    np.zeros((10, 10, 3), dtype='uint16'),
    np.zeros((10, 10, 3), dtype='float64'),
])
def test_preprocess_invalid_img(img: np.ndarray):
    p_img = image.preprocess(img)

    expected_p_img = np.full(
        (config.MNIST_IMAGE_WITH_BORDER_SIZE, config.MNIST_IMAGE_WITH_BORDER_SIZE),
        np.iinfo('uint8').max - config.MNIST_IMAGE_BACKGROUND_VALUE,
        dtype='uint8'
    )

    assert p_img.shape == expected_p_img.shape
    assert not (np.bitwise_xor(p_img, expected_p_img).any())


@pytest.mark.parametrize(("img"), [
    np.full((1, 1, 3), np.iinfo('uint8').max, dtype='uint8'),
    np.full((1, 1, 4), np.iinfo('uint8').max, dtype='uint8'),
    np.full((10, 10, 3), np.iinfo('uint8').max, dtype='uint8'),
    np.full((100, 100, 3), np.iinfo('uint8').max, dtype='uint8'),
])
def test_preprocess_white_square_img(img: np.ndarray):
    p_img = image.preprocess(img)

    expected_p_img = np.full(
        (config.MNIST_IMAGE_WITH_BORDER_SIZE, config.MNIST_IMAGE_WITH_BORDER_SIZE),
        np.iinfo('uint8').max - config.MNIST_IMAGE_BACKGROUND_VALUE,
        dtype='uint8'
    )

    assert p_img.shape == expected_p_img.shape
    assert not (np.bitwise_xor(p_img, expected_p_img).any())
