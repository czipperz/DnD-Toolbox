function logInMain() {
	document.getElementById("logInButton").onclick = () => {
		const emailElem = document.getElementById("inputEmail")
		const passwordElem = document.getElementById("inputPassword")
		
		const errorsElem = document.getElementById("logInErrors")
		if (!emailElem.checkValidity()) {
			errorsElem.innerText = "Must provide a valid email address"
			return
		}
		if (!passwordElem.checkValidity()) {
			errorsElem.innerText = "Must provide a password"
			return
		}
		errorsElem.innerHTML = "&nbsp;"
		
		firebase.auth()
			.signInWithEmailAndPassword(emailElem.value, passwordElem.value)
			.catch(error => {
				errorsElem.innerText = error.message
			})
	}
	
	setupFirebaseAuthUi()
}

function setupFirebaseAuthUi() {	
	// FirebaseUI config.
	var uiConfig = {
		signInSuccessUrl: '/profile.html',
		signInOptions: [
			// Leave the lines as is for the providers you want to offer your users.
			firebase.auth.GoogleAuthProvider.PROVIDER_ID
		],
	};

	// Initialize the FirebaseUI Widget using Firebase.
	var ui = new firebaseui.auth.AuthUI(firebase.auth());
	// The start method will wait until the DOM is loaded.
	ui.start('#firebaseAuthUi', uiConfig);
};

logInMain()
