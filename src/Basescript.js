//***CODE INSTRUCTIONS***
// 1) log into LinkedIn sales navigator and search for leads with your desired filters.
// 2) right-click anywhere on the page and select "inspect."
// 3) open "console" at the top of the window and copy this code into the console.
// 4) adjust the arguments at the bottom (code line 97) to reflect your filters and email format (detailed instructions at line 98)
// 5) press "Enter" or "Return" to run the code.
// 6) copy all results between the first "<" symbol and last ">" symbol
// 7) paste into excel
// 8) CHECK FOR DUPLICATES.

function openExtension(request, sender, sendResponse) {
  var angularDiv = document.querySelector('#shqTargetMapper');

  /* Manually bootstrap the Angular app */

  if (request.message === "submit_scrape_query") {
    console.log(request);
    //scrapeLinkedInForMembers(["hewlett packard"], "@hp.com", "", 2, 1, "");
  }
}

//event listener that listeners to the reply of a user clicking the extension icon
chrome.runtime.onMessage.addListener(openExtension);


var users = [];
var running = true;

function scrapeLinkedInForMembers(searchTerms, email, location, time, pagesToTraverse, emailFormat) {
  $.each($("li.member"), function(x, val) {

    var company = $(val).find(".company-name").text().toLowerCase();
    var cardLocation = $($(val).find(".info-value")[2]).text();
    if (searchTerms.some(function(v) {
        return company.includes(v)
      }) && cardLocation.includes(location)) {
      var user = $(val).find(".name").text();
      if (user.includes(",") || user.includes(".")) {
        user = user.split(" ")[0] + " " + user.split(" ")[1].substring(0, user.split(" ")[1].length - 1)
      }

      var splitNames = user.split(" ");
      var firstName = splitNames[0];
      var lastName = splitNames[1];
      var emailAdr;
      if(emailFormat === "initialDot"){
        emailAdr = firstName[0] + "." + lastName + email;
      } else if (emailFormat === "underscore"){
        emailAdr = user.split(" ").join("_") + email;
      } else if (emailFormat === "initialUnderscore"){
        emailAdr = firstName[0] + "_" + lastName + email;
      } else if (emailFormat === "initial"){
        emailAdr = firstName[0] + lastName + email;
      } else if (emailFormat === "dot"){
        emailAdr = user.split(" ").join(".") + email;
      } else if (emailFormat === "lastFirst"){
        emailAdr = lastName + firstName + email;
      }else if (emailFormat === "lastInitial"){
        emailAdr = lastName + firstName[0] + email;
      } else if (emailFormat === "firstInitial"){
        emailAdr = firstName +lastName[0] + email;
      } else {
        emailAdr = firstName + lastName + email;
      }
      var title = $(val).find(".degree-icon").attr("title");

      if (user.includes("LinkedIn")) {
        return;
      }

      var user = {
        firstName,
        lastName,
        emailAdr,
        title,
        cardLocation
      };

      //if the user has been saved, skip over them
      if(!$(val).find(".saved")[0]){
        $(val).find(".save-lead-container").submit();
        users.push(user);
      }

    }
  });

  if (pagesToTraverse && typeof pagesToTraverse === "number" && pagesToTraverse-- > 0){
    if ($(".next-pagination").hasClass("disabled")) {
      console.log(makeTableHTML(users));
    } else {
      $(".next-pagination").click();
      setTimeout(function() {
        scrapeLinkedInForMembers(searchTerms, email, location, time, pagesToTraverse);
      }, time * 1000);
    }
  } else {
    console.log(makeTableHTML(users));
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

//in the parentheses (first argument, second argument, third argument, 4th argument, fifth argument, sixth argument)
//***HOW TO USE THE ARGUMENTS***
//First Argument: search terms, all lower-case. You can list multiple in this format: ["thing 1", "thing 2", "thing 3"]. this filters through any bad results that come up in the initial search, i.e. from a different account.
//Second Argument: email domain name for your account. This only works if you search one account at a time.
//Third Argument: location specific search, upper and lower case. Leave quotes empty if you want to search all locations.
//Fourth Argument: time spent scraping data on each page you run the code on. You probably won't need to mess with this.
//Fifth Argument: number of LinkedIn pages scraped per run of the code. I run it one page at a time to check for errors after each run, i.e. duplicates.
//Sixth Argument: email username format, see below for format options.
//  "" = jordanbishop@email.com
//  "dot" = jordan.bishop@email.com
//  "initial" = jbishop@email.com
//  "underscore" = jordan_bishop@email.com
//  "initialDot" = j.bishop@email.com
//  "initialUnderscore" = j_bishop@email.com
//  "lastFirst" = bishopjordan@email.com
//  "lastInitial" = bishopj@email.com
//  "firstInitial" = jordanb@email.com