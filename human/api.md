# API Documentation

yt-for-me exposes a simple API for itself. The API isn't for use for the public at large, only for requests from this app to itself.

All requests must be made relative to the `/api` endpoint.
All of the responses are expressed in JSON, unless otherwise stated.

## GET /info

Accepts the following parameters:
- `id`: Query parameter. Required. The YouTube ID of the video in question

And responds with one of the following status codes:

- 200 OK:
    - JSON of video metadata provided by ytdl-core
- 400 Bad Request
    - The `error` and `errCode` properties describe the error
- 500 Internal Server Error
    - The `error` and `errCode` properties describe the error


## GET /search

Accepts the following parameters:
- `q`: Query parameter. Required. The search query
- `page`: Query parameter. Optional. The current search page number. Defaults to 1. 

And responds with one of the following status codes:

- 200 OK:
    - JSON, the vids property returns results provided by ytSearch
- 400 Bad Request
    - The `error` and `errCode` properties describe the error
- 500 Internal Server Error
    - The `error` and `errCode` properties describe the error

## GET /progress/:id

Accepts the following parameters:
- `id`: Provided in URL. Required. The ID of the video download.

And responds with one of the following status codes:

- 200 OK:
    - JSON, describes the video download/conversion progression
- 400 Bad Request
    - The `error` and `errCode` properties describe the error

## POST /download

Accepts the following parameters (passed as JSON):
- `id`: The YouTube id of the video (obviously)
- `videoItag`: The itag of the video file or `'none'`
- `audioItag`: The itag of the audio file or `'none'`
- `outFormat`: The format of the output file

And responds with one of the following status codes:

- 200 OK:
    - JSON, describes the video download/conversion progression
- 400 Bad Request
    - The `error` and `errCode` properties describe the error
- 500 Internal Server Error
    - The `error` and `errCode` properties describe the error



# Errors

Errors are in hexadecimal. The generic responses always have a zero as their least significant term

```js
{
    [0x0010]: "Request error (HTTP 400)",
        [0x0011]: "Empty request",
        [0x0012]: "Not found",
        [0x0013]: "Refused to serve cross-origin request",
        [0x0014]: "Too many requests (HTTP 429)",
        [0x0015]: "You're a bot",
    [0x0030]: "Client-side error",
        [0x0031]: "Assertion failed",
        [0x0032]: "YouTube ID didn't match RegExp",
    [0x0040]: "API error",
        [0x0041]: "Failed to retrieve video information via ytdl-core",
        [0x0042]: "Search via yt-search failed",
        [0x0043]: "Download progress ID invalid",
        [0x0044]: "YouTube video ID invalid",
        [0x0045]: "Invalid output format",
        [0x0046]: "No input files provided",
        [0x0047]: "Conversion error",
        [0x0048]: "Format download error",
    [0x0050]: "Server error",
        [0x0051]: "Unexpected server error",
        [0x0052]: "Temporary outage (HTTP 503)",
        [0xba11ad]: "Service discontinued",
    // For future use?
        [0x0961]: "L is real",
        [0x0539]: "Debugging"
}
```
