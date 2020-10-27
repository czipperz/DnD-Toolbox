function registerMain() {
	document.getElementById("registerButton").onclick = () => {
		const emailElem = document.getElementById("inputEmail")
		const passwordElem = document.getElementById("inputPassword")
		
		const errorsElem = document.getElementById("registerErrors")
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
			.createUserWithEmailAndPassword(emailElem.value, passwordElem.value)
			.catch(error => {
				errorsElem.innerText = error.message
			})
	}
}

registerMain()
