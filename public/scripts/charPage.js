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
                console.log("Document data:", doc.data());
                this.character = doc;
                changeListener();
            } else {
                console.log("No such character!");
            }
        });
    }
    saveChar() {
        if (this.ref) {
            //Update existing character
        } else {
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
            characterManager.beginListening(this.updateView.bind(this))
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
        let char = characterManager.getCharacter();
        $("#charName").val(char.name);
        $("#charLevel").val(char.level);
        $("#charRace").val(char.race);
        $("#charAli").val(char.align);
        $("#charBack").val(char.background);
        $(".main6").each((index) => {
            $(this).val(char.stats[index]);
            //more to do here
        })
        for (let i = 0; i < char.profs.length; i++) {
            //stuff to do here
        }
        $("#insp").val(char.insp);
        $("#prof").val(char.prof);
        $("#AC").val(char.ac);
        $("#ini").val(char.init);
        $("#speed").val(char.speed);
        $("#health").val(char.health);
        $("#tempHealth").val(char.tempHealth);
        $("#healthDice").val(char.healthDice);
        $(".wep").each((index) => {
            $(this).val(char.weapons[index]);
        })
        $(".goldNum").each((index) => {
            $(this).val(char.gold[index]);
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
