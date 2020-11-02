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
	
	removeCharacter(id) {
		db.collection("Characters").doc(id).delete()
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

			const name = '<h3 class="name"><a class="link"></a></h3>'
			const info = '<div>Level <span class="level"></span> <span class="class"></span>, <span class="race"></span></div>'
			const deleteButton = '<button type="button" class="btn btn-primary bmd-btn-fab bmd-btn-fab-sm delete"><i class="material-icons">delete</i></button>'
			const elem = htmlToElement('<div class="character"><div>' + name + info + '</div>' + deleteButton +  '</div>')
			elem.querySelector(".link").href = "charPage.html?id=" + c.id
			elem.querySelector(".link").innerText = c.Name
			elem.querySelector(".level").innerText = c.Level
			elem.querySelector(".class").innerText = c.Class
			elem.querySelector(".race").innerText = c.Race
			elem.querySelector(".delete").onclick = () => {
				//this._manager.removeCharacter(c.id)
			}
			
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


