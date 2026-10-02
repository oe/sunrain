# Fixed-camera tracks

These data files are offline compositing assets, not browser dependencies.
Each array is one source-to-reference affine matrix at 24 fps, measured at
960 × 540. The source SHA-256 binds the calibration to the exact original file.
The same constant crop is used for every frame; there is no animated zoom.

The stream track uses one near-bank rock patch at x=120..380, y=440..525 in
tracking coordinates. Mixing distant canopy and foreground features previously
made robust fitting switch between different depth planes, jolting the water
while the frozen bank concealed the error. Forward/backward optical-flow checks
reject mismatches; the similarity fit uses a 0.8px inlier threshold and is filtered
with the normalized seven-frame kernel [1, 6, 15, 20, 15, 6, 1]. Frame support was
at least 273 features (median 368 / 92% of candidates) for this source.
The near/far parallax still cannot be removed by one camera transform, so the
composite anchors bank/canopy to frame 48 and retains water/steam through a
feathered mask. `audit:scenes` now bounds acceleration at three points over the
water: static-bank checks alone are insufficient.

The fire track was fitted to normalized template matches on two brick patches
and a log patch, referenced to frame 100. Occluded/low-correlation matches were
excluded; gaps were interpolated and the track lightly filtered. Registration
preserves actual flame pixels and firelight. Do not use a color-keyed flame matte:
that experiment damaged the flame's softer edges and was rejected.

To replace either source, recalibrate its track and crop. Do not bypass the hash
check or reuse these coordinates with another video. Preview all frames and
multiple loop cycles, including the overlapping transition, at desktop and
portrait aspect ratios. Frame-boundary differences alone cannot validate camera
stability, ghosting, or perceptual continuity.
