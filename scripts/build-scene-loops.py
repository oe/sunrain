"""Rebuild approved scene loops from the licensed originals (Python 3 + ffmpeg).

Usage: python3 scripts/build-scene-loops.py /path/to/originals [--only ocean]
Download originals using motion-sources.json; originals are not committed.
The middle segment is followed by a forward-only tail/head dissolve. The next
loop starts at the frame following the head segment, without reversing motion.
"""
import argparse
import json
import pathlib
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('sources', type=pathlib.Path)
parser.add_argument('--only', choices=['stream', 'fire', 'ocean'])
args = parser.parse_args()
root = pathlib.Path(__file__).resolve().parents[1] / 'public' / 'scenes'
manifest = json.loads((root / 'motion-sources.json').read_text())

def run(*arguments):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *map(str, arguments)], check=True)

for spec in manifest['scenes']:
    name, length, seam = spec['id'], spec['length'], spec['overlap']
    if args.only and name != args.only:
        continue
    weight = f"(0.5-0.5*cos(PI*min(1,T/{seam-1/24})))"
    graph = (
        '[0:v]fps=24,scale=1920:1080:force_original_aspect_ratio=increase,'
        'crop=1920:1080,setsar=1,format=yuv420p,'
        'eq=saturation=0.9:brightness=-0.015,split=3[a][b][c];'
        f'[a]trim=start={seam}:end={length-seam},setpts=PTS-STARTPTS[mid];'
        f'[b]trim=start={length-seam}:end={length},setpts=PTS-STARTPTS[tail];'
        f'[c]trim=start=0:end={seam},setpts=PTS-STARTPTS[head];'
        f"[tail][head]blend=all_expr='A*(1-{weight})+B*{weight}':shortest=1[seam];"
        '[mid][seam]concat=n=2:v=1:a=0[v]'
    )
    out = root / f'{name}-loop.mp4'
    run('-i', args.sources / spec['input'], '-filter_complex_threads', '2',
        '-filter_complex', graph, '-map', '[v]', '-an', '-c:v', 'libx264',
        '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out)
    run('-i', out, '-vf', 'scale=1280:720', '-an', '-c:v', 'libx264',
        '-preset', 'slow', '-crf', '25', '-movflags', '+faststart', root / f'{name}-loop-mobile.mp4')
    run('-i', out, '-frames:v', '1', '-vf', 'scale=1600:900', '-q:v', '2', root / f'{name}-poster.jpg')
    print(name, out.stat().st_size, flush=True)
