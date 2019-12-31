# Deployment

## Heroku

yt-for-me is deployed to Heroku by default. For this, two buildpacks are needed:

1. https://github.com/kontentcore/heroku-buildpack-ffmpeg (for ffmpeg)
2. heroku/nodejs (for Node.js duh)

The order of the buildpacks matters.

You can add buildpacks using the Heroku CLI:

```shell
heroku buildpacks:add https://github.com/kontentcore/heroku-buildpack-ffmpeg
```

This can also be accomplished by going to the Heroku Dashboard, navigating to Settings > Buildpacks > Add buildpack and pasting in the url.
