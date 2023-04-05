import cv2  # type: ignore
import numpy as np

from .config import (
    MNIST_IMAGE_SIZE, MNIST_IMAGE_BORDER_VALUE, MNIST_IMAGE_WITH_BORDER_SIZE)

# Center normalized image on full size image based on the center of mass of the digit


def _centerNormalizedDigitOnFullSize(normalized_img: cv2.Mat) -> cv2.Mat:

    full_size_image = cv2.Mat(
        np.full((MNIST_IMAGE_WITH_BORDER_SIZE,
                 MNIST_IMAGE_WITH_BORDER_SIZE),
                MNIST_IMAGE_BORDER_VALUE,
                dtype='uint8'))

    # Calculate center of mass coords for normalized image
    moments = cv2.moments(cv2.bitwise_not(normalized_img))
    c_x = int(moments["m10"] / moments["m00"])
    c_y = int(moments["m01"] / moments["m00"])

    # Rename images to large and small for readability
    l_img = full_size_image
    s_img = normalized_img

    # Get dimensions of both images
    l_img_size_x = l_img.shape[1]
    l_img_size_y = l_img.shape[0]

    s_img_size_x = s_img.shape[1]
    s_img_size_y = s_img.shape[0]

    # Calculate the offsets to center the small image
    x_off_0 = int(l_img_size_x/2) - c_x
    y_off_0 = int(l_img_size_y/2) - c_y

    # Bounds check the offset in case the center of mass is too extreme
    room_x = l_img_size_x - s_img_size_x
    room_y = l_img_size_y - s_img_size_y

    x_off_0 = min(x_off_0, room_x)
    y_off_0 = min(y_off_0, room_y)

    x_off_0 = max(x_off_0, 0)
    y_off_0 = max(y_off_0, 0)

    x_off_1 = x_off_0 + s_img_size_x
    y_off_1 = y_off_0 + s_img_size_y

    # Paste small image on to large image
    l_img[y_off_0:y_off_1, x_off_0:x_off_1] = s_img

    return l_img


def _is_valid_img(img: cv2.Mat) -> bool:
    return not ((not hasattr(img, 'shape'))
                or len(img.shape) != 3
                or img.shape[0] == 0
                or img.shape[1] == 0
                or (img.shape[2] != 3 and img.shape[2] != 4))


def preprocess(img: cv2.Mat) -> cv2.Mat:
    # If image dimensions are invalid, return empty image of correct size
    if not _is_valid_img(img):
        shape = (MNIST_IMAGE_WITH_BORDER_SIZE, MNIST_IMAGE_WITH_BORDER_SIZE)
        return cv2.Mat(np.zeros(shape,  dtype='uint8'))

    gray_img = cv2.cvtColor(np.array(img), cv2.COLOR_BGR2GRAY)

    _, th = cv2.threshold(gray_img, 0, 255, cv2.THRESH_BINARY_INV)

    coords = cv2.findNonZero(th)
    x, y, w, h = cv2.boundingRect(coords)

    cropped_img = gray_img[y:y+h, x:x+w]

    old_shape = cropped_img.shape
    if old_shape[0] > old_shape[1]:
        new_shape = (
            int((MNIST_IMAGE_SIZE / old_shape[0]) * old_shape[1]), MNIST_IMAGE_SIZE)
    else:
        new_shape = (MNIST_IMAGE_SIZE, int(
            (MNIST_IMAGE_SIZE / old_shape[1]) * old_shape[0]))

    normalized_img = cv2.resize(
        cropped_img, new_shape, interpolation=cv2.INTER_AREA)

    centered_img = _centerNormalizedDigitOnFullSize(normalized_img)

    inverted_img = cv2.bitwise_not(centered_img)

    return inverted_img
