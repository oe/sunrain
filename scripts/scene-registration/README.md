# Fixed-camera tracks

These data files are offline compositing assets, not browser dependencies.
Each array is one source-to-reference affine matrix at 24 fps, measured at
960 × 540. The source SHA-256 binds the calibration to the exact original file.
The same constant crop is used for every frame; there is no animated zoom.

The stream track was estimated from forward/backward-checked feature tracks on
riverbank stones and tree structure, with a robust fit to the first frame. Its
near/far parallax cannot be removed by one camera transform, so the final composite
anchors the bank and canopy to frame 48 and retains the water/steam through a
feathered mask.

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
