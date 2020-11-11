/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.variableName = "";

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

rhit.logOut = function() {
	firebase.auth().signOut()
}

rhit.setupNavbarLinks = function() {
	const navbarButtonsElem = document.createElement("div")
	navbarButtonsElem.classList.add("navbar-buttons")
	document.querySelector(".navbar").appendChild(navbarButtonsElem)
	
	firebase.auth().onAuthStateChanged(user => {
		if (user) {
			if (document.querySelector("#charPage")) {
				navbarButtonsElem.innerHTML =
				'<a href="#" data-toggle="modal" data-backdrop="static" data-target="#diceRollModal">Roll Dice</a>' +
				'<a href="profile.html">Profile</a>' +
				'<a href="#" class="logOutButton">Log out</a>'
			} else {
				navbarButtonsElem.innerHTML =
				'<a href="profile.html">Profile</a>' +
				'<a href="#" class="logOutButton">Log out</a>'
			}
			navbarButtonsElem.querySelector(".logOutButton").onclick = rhit.logOut
		} else {
			navbarButtonsElem.innerHTML =
				'<a href="register.html">Register</a>' +
				'<a href="login.html">Log in</a>'
		}
	})
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	rhit.setupNavbarLinks()
};

rhit.main();

function htmlToElement(html) {
	const wrapper = document.createElement("div")
	wrapper.innerHTML = html
	return wrapper.firstChild
}
