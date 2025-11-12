# Video Placeholder Instructions

Since ffmpeg is not available in this environment, please create a placeholder video manually:

## Option 1: Quick Online Tool
1. Visit: https://ezgif.com/video-to-gif (or similar)
2. Create a 5-10 second video with text "HVSP Ready • Slides → Video"
3. Export as MP4
4. Save as `assets/hvsp_ready.mp4`

## Option 2: Using ffmpeg locally
```bash
ffmpeg -f lavfi -i color=c=0x1e293b:s=1280x720:d=8 \
  -vf "drawtext=text='HVSP Ready':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2" \
  -c:v libx264 -t 8 -pix_fmt yuv420p assets/hvsp_ready.mp4
```

## Option 3: Temporary Workaround
The app will work without the video file and show a placeholder card. Upload any short MP4 to `assets/hvsp_ready.mp4` when ready.

## For Demo Purposes
You can download any short stock video and rename it to `hvsp_ready.mp4`.
