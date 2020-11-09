characterManager = "";
characterController = "";

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
        this.owner = "";
    }
}

class CharacterManager {
    constructor(uid) {
        this.uid = uid;
        this.id = "";
        this.ref = "";
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("id")) {
            this.id = urlParams.get("id");
            this.ref = firebase.firestore().collection("Characters").doc(id);
            this.loadChar();
        }
        if (urlParams.get("newChar")) {
            this.updateChar();
        }
    }
    
    saveChar() {
        if (this.ref) {
            //Update existing character
        } else {
            console.log(this.uid);
            //Creating a new character
            const db = firebase.firestore().collection("Characters");
            //This is gonna be a bit messy. Lots of variables to deal with here
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
                weapons.push(element.value);
            });
            db.add({
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
                "owner": this.uid
            })
            .then((docRef) => {
                console.log("Character created with id: " + docRef.id);
            })
            .catch(function (error){
                console.error("Error adding character:", error);
            });
        }
    }

    updateChar() {
        const button = document.querySelector("#charButton");
        button.innerHTML = "Save";
        button.onclick = (event) => {
            this.saveChar();
        }
        characterController.makeFormEditable();
    }
    
    loadChar() {
    
    }
}

class CharacterController {
    constructor() {
        
    }

    makeFormEditable() {
        document.querySelectorAll(".editable").forEach((element) => {
            element.removeAttribute("disabled");
        });
    }
}

main = function () {
	firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "/"
            return
        } else {
            console.log(user.uid);
            characterController = new CharacterController();
            characterManager = new CharacterManager(user.uid);
        }
    });
    
};



main();
