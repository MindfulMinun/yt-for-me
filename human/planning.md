# Planning
Things that should be done in order of priority.


## Bottom sheet

Convert should add the video to the queue (bottom sheet). The sheet can be expanded to show the progression of the video conversion and download. Once done, the sheet will show the download URL and store previous url downloads in localstorage (to persist when the user navigates away). Maybe we can notify the user can be notified via a push notification?


## Search:

Rewrite Search so its handled by JavaScript. When the user reaches the bottom of the search, add a "Load More" button that dynamically searches and appends the next page of search results.



## Share Target:

ServiceWorker + text share target. Use a RegExp to find a YouTube link and navigate straight to it. Otherwise just search the text or go home as a failsafe?
