var users = [];

function queryRequest(request, sender, sendResponse) {

  if (request.message === "submit_scrape_query") {
    var options = request.options;
    scrapeLinkedInForMembers(options.phrases.toLowerCase().split(" "), options.domain, options.location, 3, options.pages, options.emailtype, options.skippedSaved, options.saveAsLead);
  }
}

function sendToBackground(message, data, callback) {
  chrome.runtime.sendMessage({message, data}, function (response) {
  });
}

//event listener that listeners to the reply of a user clicking the extension icon
chrome.runtime.onMessage.addListener(queryRequest);


//First Argument: search terms, all lower-case. You can list multiple in this format: ["thing 1", "thing 2", "thing 3"]. this filters through any bad results that come up in the initial search, i.e. from a different account.
//Second Argument: email domain name for your account. This only works if you search one account at a time.
//Third Argument: location specific search, upper and lower case. Leave quotes empty if you want to search all locations.
//Fourth Argument: time spent scraping data on each page you run the code on. You probably won't need to mess with this.
//Fifth Argument: number of LinkedIn pages scraped per run of the code. I run it one page at a time to check for errors after each run, i.e. duplicates.
//Sixth Argument: email username format, see below for format options.
//  "" = joebishop@email.com
//  "dot" = joe.bishop@email.com
//  "initial" = jbishop@email.com
//  "underscore" = joe_bishop@email.com
//  "initialDot" = j.bishop@email.com
//  "initialUnderscore" = j_bishop@email.com
//  "lastFirst" = bishopjoe@email.com
//  "lastInitial" = bishopj@email.com
//  "firstInitial" = joeb@email.com
function scrapeLinkedInForMembers(searchTerms, email, location, time, pagesToTraverse, emailFormat, skipSaved, saveAsLead) {
  $.each($("li.member"), function (x, val) {

    var company = $(val).find(".company-name").text().toLowerCase();
    var cardLocation = $($(val).find(".info-value")[2]).text();

    if (searchTerms.some(function (v) {
        return company.includes(v)
      }) && cardLocation.includes(location)) {
      var user = $(val).find(".name").text();
      if (user.includes(",") || user.includes(".")) {
        user = user.split(" ")[0] + " " + user.split(" ")[1].substring(0, user.split(" ")[1].length - 1);
      } else if (user.includes("(")) {
        var splitUserOnSpace = user.split(" ");
        user = splitUserOnSpace[0] + " " + splitUserOnSpace[2];
      }

      var splitNames = user.split(" ");
      var firstName = splitNames[0];
      var lastName = splitNames[1];
      var emailAdr;

      if (emailFormat === "initialDot") {
        emailAdr = firstName[0] + "." + lastName + email;
      } else if (emailFormat === "underscore") {
        emailAdr = user.split(" ").join("_") + email;
      } else if (emailFormat === "initialUnderscore") {
        emailAdr = firstName[0] + "_" + lastName + email;
      } else if (emailFormat === "initial") {
        emailAdr = firstName[0] + lastName + email;
      } else if (emailFormat === "dot") {
        emailAdr = user.split(" ").join(".") + email;
      } else if (emailFormat === "lastFirst") {
        emailAdr = lastName + firstName + email;
      } else if (emailFormat === "lastInitial") {
        emailAdr = lastName + firstName[0] + email;
      } else if (emailFormat === "firstInitial") {
        emailAdr = firstName + lastName[0] + email;
      } else {
        emailAdr = firstName + lastName + email;
      }
      var title = $(val).find(".degree-icon").attr("title");

      //weird edge cases
      if (user.includes("LinkedIn")) {
        return;
      }

      var userObj = {
        firstName,
        lastName,
        emailAdr,
        title,
        cardLocation
      };

      //if the user has been saved, skip over them
      if (skipSaved && !$(val).find(".saved")[0]) {
        if (saveAsLead) {
          var elem = val.querySelectorAll(".primary-action-btn")[0];
          elem.click();
        }
        if (users.indexOf(userObj) === -1) {
          users.push(userObj);
        }
      } else if (!skipSaved) {
        if (saveAsLead && !$(val).find(".saved")[0]) {
          var elem = val.querySelectorAll(".primary-action-btn")[0];
          elem.click();
        }
        if (users.indexOf(userObj) === -1) {
          users.push(userObj);
        }
      }

    }
  });

  //recurse if necessary requested by user
  if (pagesToTraverse && typeof pagesToTraverse === "number" && pagesToTraverse-- > 1
    && !Array.prototype.slice.call(document.getElementsByClassName("next-pagination")[0].classList).includes("disabled")) {
    document.getElementsByClassName("next-pagination")[0].click();
    setTimeout(function () {
      scrapeLinkedInForMembers(searchTerms, email, location, time, pagesToTraverse, emailFormat, skipSaved, saveAsLead);
    }, time * 1000);
  } else {
    sendToBackground("query_results", makeTableHTML(users));
    users = [];
  }

}

function makeTableHTML(myArray) {
  var result = "<table border=1>";
  for (var i = 0; i < myArray.length; i++) {
    result += "<tr>";
    for (var key in myArray[i]) {
      result += "<td>" + myArray[i][key] + "</td>";
    }
    result += "</tr>";
  }
  result += "</table>";
  return result;
}