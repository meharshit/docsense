---
title: Upload pre-recorded ambient audio
pageType: howto
version: "2.0"
tags: [audio, ambient]
---

# Upload pre-recorded ambient audio

Use this flow when the clinician encounter was recorded offline.

## Get an upload URL

Call the file upload URL endpoint, then `PUT` the audio bytes to the signed URL.

```http
POST /v1/ambient/sessions/{id}/file-uploadurl
```

## End the session

After the upload finishes, end the session so note generation can start.
