characterManager = "";
characterController = "";
const urlParams = new URLSearchParams(window.location.search);

class Character {
    constructor() {
        this.name = "";
        this.level = "";
        this.race = "";
        this.align = "";
        this.background = "";
        this.stats = [0, 0, 0, 0, 0, 0];
        this.profs = [];
        this.insp = 0;
        this.prof = 0;
        this.ac = 0;
        this.init = 0;
        this.speed = 0;
        this.health = 0;
        this.tempHealth = 0;
        this.healthDice = 0;
        this.weapons = ["", "", "", "", "", "", "", "", ""]
        this.gold = [0, 0, 0, 0];
        this.equipment = "";
        this.feats = "";
    }
}

class CharacterManager {
    constructor(uid) {
        this.uid = uid;
        this.id = "";
        this.ref = "";
        this.unsubscribe = null;
        this.character = null;
        if (urlParams.get("id")) {
            this.id = urlParams.get("id");
            this.ref = firebase.firestore().collection("Characters").doc(this.id);
        }
    }
    beginListening(changeListener) {
        this.unsubscribe = this.ref.onSnapshot((doc) => {
            if (doc.exists) {
                this.character = doc;
                changeListener();
            } else {
                console.log("No such character!");
            }
        });
    }
    saveChar() {
        let stats = [];
        document.querySelectorAll(".main6").forEach((element) => {
            stats.push(element.value);
        });
        let proficiencies = [];
        document.querySelectorAll(".skill:checked").forEach((element) => {
            proficiencies.push(element.id);
        });
        let weapons = [];
        document.querySelectorAll(".wep").forEach((element) => {
            weapons.push(element.value);
        });
        let gold = [];
        document.querySelectorAll(".goldNum").forEach((element) => {
            gold.push(element.value);
        });
        let character = {
            "name": $("#charName").val(),
            "level": $("#charLevel").val(),
            "race": $("#charRace").val(),
            "align": $("#charAli").val(),
            "background": $("#charBack").val(),
            "stats": stats,
            "profs": proficiencies,
            "insp": $("#insp").val(),
            "prof": $("#prof").val(),
            "ac": $("#AC").val(),
            "init": $("#ini").val(),
            "speed": $("#speed").val(),
            "health": $("#health").val(),
            "tempHealth": $("#tempHealth").val(),
            "healthDice": $("#healthDice").val(),
            "weapons": weapons,
            "gold": gold,
            "equipment": $("#equipment").val(),
            "feats": $("#feats").val(),
            "owner": this.uid,
            "lastChanged": firebase.firestore.Timestamp.now()
        }
        if (this.ref) {
            //Update existing character
            this.ref.update(character)
            .then(function () {
                console.log("Character updated!");
            })
            .catch(function (error){
                console.error("Error updating character:", error);
            });
        } else {
            //Creating a new character
            const db = firebase.firestore().collection("Characters");
            db.add(character)
            .then((docRef) => {
                console.log("Character created with id: " + docRef.id);
                window.location.href = "/charPage.html?id="+docRef.id;
            })
            .catch(function (error){
                console.error("Error adding character:", error);
            });
        }
    }
    getCharacter() {
        let char = new Character();
        char.name = this.character.get("name");
        char.level = this.character.get("level");
        char.race = this.character.get("race");
        char.align = this.character.get("align");
        char.background = this.character.get("background");
        char.stats = this.character.get("stats");
        char.profs = this.character.get("profs");
        char.insp = this.character.get("insp");
        char.prof = this.character.get("prof");
        char.ac = this.character.get("ac");
        char.init = this.character.get("init");
        char.speed = this.character.get("speed");
        char.health = this.character.get("health");
        char.tempHealth = this.character.get("tempHealth");
        char.healthDice = this.character.get("healthDice");
        char.weapons = this.character.get("weapons");
        char.gold = this.character.get("gold");
        char.equipment = this.character.get("equipment");
        char.feats = this.character.get("feats");
        return char;
    }
}

class CharacterController {
    constructor() {
        if (urlParams.get("newChar")) {
            this.setupEditCharacter();
        } else {
            characterManager.beginListening(this.updateView.bind(this));
            const button = document.querySelector("#charButton");
            button.onclick = (event) => {
                this.setupEditCharacter();
            }
            const buttons = document.querySelectorAll(".healthButton");
            for (const button of buttons) {
                button.onclick = (event) => {
                    const direction = parseInt(button.dataset.direction);
                    const type = button.dataset.type == "temp";
                    console.log(direction, type);
                    let int = 0;
                    let button = null;
                    if (type) {
                        button = document.querySelector("#tempHealth");
                        int = parseInt(button.value);
                        int += direction;
                        button.value = int;
                    } else {
                        button = document.querySelector("#health");
                        int = parseInt(button.value);
                        int += direction;
                        button.value = int;
                    }
                }
            };
        }
        
    }
    setupEditCharacter() {
        document.querySelectorAll(".editable").forEach((element) => {
            element.removeAttribute("disabled");
        });
        const button = document.querySelector("#charButton");
        button.innerHTML = "Save";
        button.onclick = (event) => {
            characterManager.saveChar();
        }
    }

    updateView(){
        document.querySelectorAll(".editable").forEach((element) => {
            element.setAttribute("disabled", "");
        });
        const button = document.querySelector("#charButton");
        button.innerHTML = "Edit";
        button.onclick = (event) => {
            this.setupEditCharacter();
        }
        let char = characterManager.getCharacter();
        $("#charName").val(char.name);
        $("#charLevel").val(char.level);
        $("#charRace").val(char.race);
        $("#charAli").val(char.align);
        $("#charBack").val(char.background);
        $(".main6").each((index, element) => {
            $(element).val(char.stats[index]);
            let modId = "#" + element.id + "Mod";
            let modVal = Math.floor((parseInt(char.stats[index]) - 10) / 2);
            if (modVal >= 0) {
                modVal = "+" + modVal.toString();
            } else {
                modVal = modVal.toString();
            }
            $(modId).html(modVal);
        })
        for (let i = 0; i < char.profs.length; i++) {
            document.querySelector("#" + char.profs[i]).checked = true;
        }
        let defArr = ["strDef", "dexDef", "conDef", "intDef", "wisDef", "chaDef"];
        let modVal = 0;
        let tempInt = 0;
        for (let k = 0; k < defArr.length; k++) {
            modVal = Math.floor((parseInt(char.stats[k]) - 10) / 2);
            document.querySelectorAll("." + defArr[k]).forEach((element) => {
                tempInt = modVal;
                if (document.querySelector("#" + element.id + "Mod").checked) {
                    tempInt += parseInt(char.prof);
                }
                if (tempInt >= 0) {
                    tempInt = "+" + tempInt.toString();
                } else {
                    tempInt = tempInt.toString();
                }
                element.innerHTML = tempInt;
            }) 
        }
        $("#insp").val(char.insp);
        $("#prof").val(char.prof);
        $("#AC").val(char.ac);
        $("#ini").val(char.init);
        $("#speed").val(char.speed);
        $("#health").val(char.health);
        $("#tempHealth").val(char.tempHealth);
        $("#healthDice").val(char.healthDice);
        $(".wep").each((index, element) => {
            $(element).val(char.weapons[index]);
        })
        $(".goldNum").each((index, element) => {
            $(element).val(char.gold[index]);
        })
        $("#equipment").val(char.equipment);
        $("#feats").val(char.feats);
    }
}

main = function () {
	firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "/"
            return
        } else {
            characterManager = new CharacterManager(user.uid);
            characterController = new CharacterController();
        }
    });
    
};



main();
