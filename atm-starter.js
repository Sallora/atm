var R = require("ramda"); // Helps with {}s and []s http://ramdajs.com/docs/#find
var prompt = require("prompt");
var userCollection = require("./users");

var cardNumber;
var pin;
var numAttempts = 0;
var MAX_ATTEMPTS = 3;

prompt.start();

function authenticateUser() {
  console.log("🤖 Starting ATM process...");

  // Check card number and pin against user collection
  console.log(
    "🤖 Looking for user in collection with card number: " + cardNumber
  );

  var currentUser;
  // Loop through collection and try and match card number
  for (var i = 0; i < userCollection.length; i++) {
    if (userCollection[i].cardNumber === cardNumber) {
      console.log(
        "🤖 Found user in collection with card number: " +
          userCollection[i].name
      );

      // Check that the pin number is correct
      if (userCollection[i].pin !== pin) {
        numAttempts++;

        if (numAttempts < MAX_ATTEMPTS) {
          // Warn the user their pin was wrong
          return handleError(
            "Incorrect PIN. Attempts remaining: " + (MAX_ATTEMPTS - numAttempts)
          );
        } else {
          // We've exceeded max number of attempts, keep the users card
          return withholdCard();
        }
      }

      // Set current user to be the matched object
      currentUser = userCollection[i];
    }
  }

  // Before we continue, make sure we have a current user
  if (!currentUser) {
    handleError(
      "Unable to find user in collection with card number: " + cardNumber
    );
  } else {
    return currentUser;
  }
}

function withholdCard() {
  handleError("Maximum retries exceeded. Withholding card...");

  var numAttempts = 0;

  startATM();
}

function withdrawCash(currentUser) {
  prompt.get(
    [
      {
        name: "amount",
        description: "How much £££ would you like to withdraw?",
        type: "number"
      }
    ],
    function(err, result) {
      var amount = Number(result.amount);

      // Check they have enough money
      if (amount > currentUser.balance) {
        console.log("🤖 You do not have enough money :(");
      } else {
        currentUser.balance -= amount;
        console.log("🦎 You have withdrawn £" + amount);
      }

      selectService(currentUser);
    }
  );
}

function selectService(currentUser) {
  console.log("🦎 How can Salamander bank help you today? 🦎");
  prompt.get(
    [
      {
        name: "service",
        description:
          "Which service would you like today? \n0 = Return card \n1 = Check Balance \n2 = Withdraw Cash \n\nPlease select",
        type: "integer"
      }
    ],
    function(err, result) {
      switch (result.service) {
        case 0:
          console.log("🦎 Card returned. Have a nice day! 🦎");
          break;
        case 1:
          console.log("🤖 Checking balance ...");
          console.log("🦎 Your balance is: £" + currentUser.balance);
          selectService(currentUser);
          break;
        case 2:
          console.log("🤖 Withdrawing cash ...");
          withdrawCash(currentUser);
          break;
        default:
          handleError("Sneaky attempt at trying an unknown service");
      }
    }
  );
}

// Main application process
function startATM() {
  console.log("🦎 Welcome to Salamander Bank 🦎");
  prompt.get(
    [
      {
        name: "cardNumber",
        description: "Enter your card number",
        required: true,
        type: "number"
      },
      {
        name: "pin",
        description: "Enter your pin code",
        required: true,
        type: "integer"
      }
    ],
    function(err, result) {
      if (err) {
        return err;
      }

      cardNumber = Number(result.cardNumber);
      pin = Number(result.pin);

      // 1. Authenticate the user and check their credentials
      var currentUser = authenticateUser();
      // 2. Ask them which service they want to use
      selectService(currentUser);
    }
  );
}

// Error handle
function handleError(errorString) {
  console.log("❌ Error: " + errorString);

  // Clear out previous variobles
  cardNumber = null;
  pin = null;

  startATM();
}

// Away we go...
startATM();
