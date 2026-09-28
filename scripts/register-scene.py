"""Offline fixed-camera compositing; requires numpy and opencv-python-headless.

Usage: python3 scripts/register-scene.py stream source.mp4 destination.mp4
The checked-in affine tracks register each 24fps source frame to a fixed plate.
Coordinates are measured at 960x540. A constant crop hides all exposed edges.
No camera transform, optical-flow solver or extra library is shipped to browsers.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import shutil

import cv2
import numpy as np

cv2.setNumThreads(2)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('scene', choices=['stream', 'fire'])
parser.add_argument('source', type=Path)
parser.add_argument('destination', type=Path)
args = parser.parse_args()
track = json.loads((Path(__file__).parent / 'scene-registration' / f'{args.scene}.json').read_text())
if hashlib.sha256(args.source.read_bytes()).hexdigest() != track['sourceSha256']:
    raise ValueError('Source does not match the calibrated registration track')


def encoder(path):
    return subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo',
        '-pix_fmt', 'bgr24', '-s', '1920x1080', '-r', '24', '-i', '-', '-an',
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '15', str(path)], stdin=subprocess.PIPE)


def finish(process):
    process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError('Scene encoding failed')


with tempfile.TemporaryDirectory(prefix='sunrain-register-') as work:
    registered = Path(work) / 'registered.mp4'
    decoder = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', str(args.source),
        '-vf', 'fps=24,scale=1920:1080', '-pix_fmt', 'bgr24', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
    writer = encoder(registered)
    x0, y0, x1, y1 = track['crop']
    for values in track['transforms']:
        data = decoder.stdout.read(1920 * 1080 * 3)
        if len(data) != 1920 * 1080 * 3:
            raise ValueError('Registration track exceeds decoded source frames')
        frame = np.frombuffer(data, np.uint8).reshape(1080, 1920, 3)
        matrix = np.array(values)
        matrix[:, 2] *= 2
        frame = cv2.warpAffine(frame, matrix, (1920, 1080), flags=cv2.INTER_LANCZOS4)
        frame = cv2.resize(frame[y0:y1, x0:x1], (1920, 1080), interpolation=cv2.INTER_LANCZOS4)
        writer.stdin.write(frame.tobytes())
    finish(writer)
    decoder.stdout.close()
    if decoder.wait() != 0:
        raise RuntimeError('Source decoding failed')

    if args.scene == 'fire':
        # Keep the original flame pixels and their illumination intact.
        shutil.copyfile(registered, args.destination)
    else:
        capture = cv2.VideoCapture(str(registered))
        capture.set(cv2.CAP_PROP_POS_FRAMES, 48)
        ok, plate = capture.read()
        if not ok:
            raise ValueError('Missing stream reference frame')
        mask = np.zeros((540, 960), np.float32)
        cv2.fillPoly(mask, [np.int32([[190,285], [275,310], [355,350], [455,410],
            [540,460], [620,540], [959,540], [959,285], [830,275], [600,270], [425,278]])], 1)
        cv2.ellipse(mask, (300,281), (125,36), 0, 0, 360, 1, -1)
        alpha = cv2.resize(cv2.GaussianBlur(mask, (0,0), 6), (1920,1080))[:, :, None]
        capture.set(cv2.CAP_PROP_POS_FRAMES, 0)
        writer = encoder(args.destination)
        while True:
            ok, frame = capture.read()
            if not ok:
                break
            output = np.uint8(np.clip(frame * alpha + plate * (1-alpha), 0, 255))
            writer.stdin.write(output.tobytes())
        finish(writer)
        capture.release()
