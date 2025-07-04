import base64, cv2, numpy as np, os
from pathlib import Path
from insightface.app import FaceAnalysis
from PIL import Image

# ─── SETTINGS ────────────────────────────────────────────
REF_DIR = "reference"        # folder of known faces
EMB_THRESH = 0.60            # cosine‑similarity threshold
# ─────────────────────────────────────────────────────────

# ---------- InsightFace initialisation ----------
face_app = FaceAnalysis(providers=["CPUExecutionProvider"])
face_app.prepare(ctx_id=0, det_size=(640, 640))

def get_emb(bgr):
    faces = face_app.get(bgr)
    if not faces:
        return None
    emb = faces[0].embedding
    return emb / np.linalg.norm(emb)

# ---------- preload reference embeddings ----------
reference = {}
# Correct the path to be relative to the project root
ref_dir_path = Path(__file__).parent.parent / REF_DIR
Path(ref_dir_path).mkdir(exist_ok=True)

print(f"Loading reference images from: {ref_dir_path}")
for img_p in ref_dir_path.glob("*.[jp][pn]g"):
    bgr = cv2.imread(str(img_p))
    if bgr is None:
        print(f"Warning: Could not read image {img_p}. Skipping.")
        continue
    emb = get_emb(bgr)
    if emb is not None:
        reference[img_p.name] = emb
print("Loaded reference:", list(reference))

def run_verification():
    """
    Captures an image from the webcam, performs face verification, and returns the result.
    """
    print("\nPress 's' to save the image and proceed with verification.")
    print("Press 'q' to quit.")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Can't receive frame (stream end?). Exiting ...")
            break

        # Display the resulting frame
        cv2.imshow('Webcam Verification', frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('s'):
            # Save the captured image
            image_path = "captured_image.jpg"
            cv2.imwrite(image_path, frame)
            print(f"Image saved as {image_path}")

            # Perform verification
            bgr = cv2.imread(image_path)
            emb = get_emb(bgr)
            if emb is None:
                print("Verification failed: No face detected in the captured image.")
                break

            best, name = 0.0, "Unknown"
            for n, ref in reference.items():
                score = float(np.dot(ref, emb))
                if score > best:
                    best, name = score, n

            if best >= EMB_THRESH:
                print(f"\nVerification successful!")
                print(f"Person: {name}")
                print(f"Score: {best:.2f}")
            else:
                print(f"\nVerification failed: No match found.")
                print(f"Closest match: {name} with score {best:.2f}")
            
            # Clean up the captured image
            os.remove(image_path)
            break

        elif key == ord('q'):
            print("Verification cancelled.")
            break

    # When everything done, release the capture
    cap.release()
    cv2.destroyAllWindows()

def verify_image(b64_img):
    """
    Performs face verification on a base64 encoded image.
    """
    try:
        # Decode the base64 image
        img_data = base64.b64decode(b64_img.split(',')[1])
        nparr = np.frombuffer(img_data, np.uint8)
        bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if bgr is None:
            return {"ok": False, "error": "Could not decode image."}

        # Get embedding
        emb = get_emb(bgr)
        if emb is None:
            return {"ok": False, "error": "No face detected in the image."}

        # Perform verification
        best, name = 0.0, "Unknown"
        for n, ref in reference.items():
            score = float(np.dot(ref, emb))
            if score > best:
                best, name = score, n

        if best >= EMB_THRESH:
            return {"ok": True, "name": name, "score": f"{best:.2f}"}
        else:
            return {"ok": False, "error": "Verification failed: No match found.", "name": name, "score": f"{best:.2f}"}

    except Exception as e:
        return {"ok": False, "error": f"An error occurred: {str(e)}"}


if __name__ == "__main__":
    run_verification()
