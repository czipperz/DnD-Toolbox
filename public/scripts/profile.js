const db = firebase.firestore()

const defaultCharacter = {}

class UserManager {
	constructor(uid) {
		this._uid = uid
		this._ref = db.collection("Characters").where("Owner", "==", uid)
	}
	
	startListening(callback) {
		this._unsubscribe = this._ref.onSnapshot(snap => {
			this._docs = snap.docs
			callback()
		})
	}
	
	stopListening() {
		this._unsubscribe()
	}
	
	get numCharacters() {
		return this._docs.length
	}
	
	getCharacter(index) {
		return {
			id: this._docs[index].id,
			...this._docs[index].data()
		}
	}
	
	addCharacter(callback) {
		db.collection("Characters")
			.add({ Owner: this._uid, ...defaultCharacter })
			.then(doc => callback(doc.id))
	}
}

function htmlToElement(html) {
	const wrapper = document.createElement("div")
	wrapper.innerHTML = html
	return wrapper.firstChild
}

class UserController {
	constructor(uid) {
		this._manager = new UserManager(uid)
		this._manager.startListening(this.update.bind(this))
	}
	
	update() {
		console.log("Update", this._manager.numCharacters)
		
		const newList = document.createElement("div")
		newList.setAttribute("id", "characters")
		
		for (let i = 0; i < this._manager.numCharacters; ++i) {
			const c = this._manager.getCharacter(i)
			
			const elem = htmlToElement('<div class="character"><h3 class="name"><a class="link"></a></h3></div>')
			elem.querySelector(".link").href = "charPage.html?id=" + c.id
			elem.querySelector(".link").innerText = c.Name
			
			newList.appendChild(elem)
		}
		
		const oldList = document.getElementById("characters")
		oldList.parentElement.replaceChild(newList, oldList)
	}
}

function setupProfile(uid) {
	new UserController(uid)
}

firebase.auth().onAuthStateChanged(user => {
	if (!user) {
		window.location.href = "/"
		return
	}
	
	setupProfile(user.uid)
})


