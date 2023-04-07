from pathlib import Path
import tarfile

from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)

FIXTURE_DIR = Path(__file__).parent.resolve() / 'data'

PREDICT_DIGIT_GET_RESPONSE = """
<body>
<form action="/predict-digit" enctype="multipart/form-data" method="post">
<input name="file" type="file">
<input type="submit">
</form>
</body>
    """

PREDICT_DIGIT_ACCURACY_MIN = 0.9
EXAMPLE_PER_DIGIT_MIN = 5

def test_root_get():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World!"}


def test_root_head():
    response = client.head("/")
    assert response.status_code == 200
    assert len(response.content) == 0


def test_wakeup_head():
    response = client.head("/wakeup")
    assert response.status_code == 200
    assert len(response.content) == 0


def test_predict_digit_get():
    response = client.get("/predict-digit")
    assert response.status_code == 200

    response_content = response.content.decode(response.encoding)

    assert response_content == PREDICT_DIGIT_GET_RESPONSE


@pytest.mark.datafiles(
    FIXTURE_DIR
)
def test_predict_digit_post(datafiles: Path, tmp_path: Path):

    # Extract data files into temp directory
    assert FIXTURE_DIR.is_dir()
    assert (FIXTURE_DIR / 'digits.tar.xz').is_file()
    with tarfile.open(FIXTURE_DIR / 'digits.tar.xz', 'r') as tar:
        tar.extractall(tmp_path)
    assert (tmp_path / 'digits').is_dir()

    # Keep track of model accuracy
    num_total = 0
    num_correct = 0

    # For digits 0-9
    for digit in range(10):
        # Ensure enough examples for this digit
        current_dir = tmp_path / 'digits' / str(digit)
        assert current_dir.is_dir()
        assert (len(list(current_dir.iterdir()))) >= EXAMPLE_PER_DIGIT_MIN

        # For each example image for current digit
        for img_path in current_dir.iterdir():
            files = {'file': open(img_path, 'rb')}
            response = client.post("/predict-digit", files=files)

            assert response.status_code == 200
            assert 'probs' in response.json()
            assert isinstance(response.json()['probs'], dict)

            probs: dict = response.json()['probs']
            assert len(probs) == 10

            predicted_digit = int(max(probs, key=probs.__getitem__))

            num_total += 1
            if predicted_digit == digit:
                num_correct += 1

    assert (num_correct / num_total) >= PREDICT_DIGIT_ACCURACY_MIN
