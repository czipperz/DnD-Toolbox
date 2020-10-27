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
}

logInMain()
