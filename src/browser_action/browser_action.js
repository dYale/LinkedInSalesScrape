function submitVals(val) {
  var scrapeQuery = {};
  scrapeQuery.phrases = document.getElementById('phrases').value;
  scrapeQuery.domain = document.getElementById('domain').value;
  scrapeQuery.location = document.getElementById('location').value;
  scrapeQuery.pages = document.getElementById('pages').value;
  scrapeQuery.emailtype = document.getElementById('emailtype').value;

  // alert( "Handler for .submit() called." );
  console.log(JSON.stringify(scrapeQuery));
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {"message": "submit_scrape_query", options: scrapeQuery}, function (resp) {
    })
  })
  event.preventDefault();
}

document.getElementById('scraperForm').onsubmit = submitVals;