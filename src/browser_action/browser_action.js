function submitVals() {
  var scrapeQuery = {};
  scrapeQuery.phrases = document.getElementById('phrases').value;
  scrapeQuery.domain = document.getElementById('domain').value;
  scrapeQuery.location = document.getElementById('location').value;
  scrapeQuery.pages = Number(document.getElementById('pages').value);
  scrapeQuery.emailtype = document.getElementById('emailtype').value;

  // alert( "Handler for .submit() called." );
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {"message": "submit_scrape_query", options: scrapeQuery}, function (resp) {
    })
  });
  event.preventDefault();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message == "query_results") {
    copyResults(request.data);
  }
});

document.getElementById('scraperForm').onsubmit = submitVals;

function copyResults(message) {
  var input = document.createElement('textarea');
  document.body.appendChild(input);
  input.value = message.text;
  input.focus();
  input.select();
  document.execCommand('Copy');
  input.remove();
}