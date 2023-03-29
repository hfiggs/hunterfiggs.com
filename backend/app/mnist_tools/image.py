import math

import cv2 # type: ignore
import numpy as np

from .config import MNIST_IMAGE_SIZE, MNIST_IMAGE_BORDER_SIZE, MNIST_IMAGE_BORDER_VALUE, MNIST_IMAGE_WITH_BORDER_SIZE, MNIST_IMAGE_WITH_BORDER_AREA # type: ignore

def preprocess(img: cv2.Mat) -> cv2.Mat:
    # If image dimensions are invalid, return empty image of correct size
    if (not hasattr(img, 'shape')) or len(img.shape) != 3 or img.shape[0] == 0 or img.shape[1] == 0 or (img.shape[2] != 3 and img.shape[2] != 4):
        return cv2.Mat(np.zeros((MNIST_IMAGE_WITH_BORDER_SIZE, MNIST_IMAGE_WITH_BORDER_SIZE), dtype='uint8'))

    gray_img = cv2.cvtColor(np.array(img), cv2.COLOR_BGR2GRAY)

    th = cv2.threshold(gray_img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    coords = cv2.findNonZero(th)
    x,y,w,h = cv2.boundingRect(coords)

    cropped_img = gray_img[y:y+h, x:x+w]

    old_shape = cropped_img.shape
    if old_shape[0] > old_shape[1]:
        new_shape = (int((MNIST_IMAGE_SIZE / old_shape[0]) * old_shape[1]), MNIST_IMAGE_SIZE)
    else:
        new_shape = (MNIST_IMAGE_SIZE, int((MNIST_IMAGE_SIZE / old_shape[1]) * old_shape[0]))

    normalized_img = cv2.resize(cropped_img, new_shape, interpolation=cv2.INTER_AREA)

    v_padding: float = MNIST_IMAGE_BORDER_SIZE + (0 if (normalized_img.shape[0] == MNIST_IMAGE_SIZE) else (MNIST_IMAGE_SIZE - normalized_img.shape[0])/2)
    h_padding: float = MNIST_IMAGE_BORDER_SIZE + (0 if (normalized_img.shape[1] == MNIST_IMAGE_SIZE) else (MNIST_IMAGE_SIZE - normalized_img.shape[1])/2)
 
    padded_img = cv2.copyMakeBorder(normalized_img, math.ceil(v_padding), math.floor(v_padding), math.ceil(h_padding), math.floor(h_padding), cv2.BORDER_CONSTANT, value=MNIST_IMAGE_BORDER_VALUE)

    inverted_img = cv2.bitwise_not(padded_img)

    return inverted_img
