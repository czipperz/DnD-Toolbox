characterManager = null;
characterController = null;
spellsManager = null;
spellsController = null;
const urlParams = new URLSearchParams(window.location.search);

dontClearDiceRollModal = false

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
    stopListening() {
        this.unsubscribe()
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
                    let valButton = null;
                    if (type) {
                        valButton = document.querySelector("#tempHealth");
                        int = parseInt(valButton.value);
                        int += direction;
                        valButton.value = int;
                    } else {
                        valButton = document.querySelector("#health");
                        int = parseInt(valButton.value);
                        int += direction;
                        valButton.value = int;
                    }
                }
            };
            
            document.querySelector("#rollButton").onclick = this.updateRollModal.bind(this)

            $("#diceRollModal").on("show.bs.modal", (event) => {
                // spells prepopulate the modal when cast
                if (dontClearDiceRollModal) {
                    return
                }
                
                // Pre animation
                document.querySelector("#numDice").value = "";
                document.querySelector("#numSides").value = "";
                document.querySelector("#rollMod").value = "";
                document.querySelector("#resultText").innerText = "";
                document.querySelector("#results").innerText = "";

            });
    
            $("#diceRollModal").on("shown.bs.modal", (event) => {
                // don't focus the fields as we already filled them
                if (dontClearDiceRollModal) {
                    dontClearDiceRollModal = false
                    return
                }
                
                //Post animation
                document.querySelector("#numDice").focus();
            });

        }
        
    }

    updateRollModal(event) {
        let dice = parseInt(document.querySelector("#numDice").value) || 0;
        let sides = parseInt(document.querySelector("#numSides").value) || 0;
        let mod = parseInt(document.querySelector("#rollMod").value) || 0;
        if (dice == 0 || sides == 0) {
            return;
        }
        let resultText = "";
        let result = 0;
        let tempNum = 0;
        for (let i = 0; i < dice; i++) {
            tempNum = Math.floor(Math.random() * sides) + 1;
            if (i != 0) {
                if (mod != 0) {
                    resultText += (", " + tempNum.toString() + "+" + mod.toString())
                } else {
                    resultText += (", " + tempNum.toString());
                }
            } else {
                if (mod != 0) {
                    resultText += tempNum.toString() + "+" + mod.toString();
                } else {
                    resultText += tempNum.toString();
                }
            }
            result += (tempNum + mod);
        }
        document.querySelector("#resultText").innerHTML = resultText;
        document.querySelector("#results").innerHTML = result.toString();

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

class Spell {
    constructor(character, dice, level, name) {
        this.character = character
        this.dice = dice
        this.level = level
        this.name = name
    }
}

class SpellLevel {
    constructor(character, level, current, max) {
        this.character = character
        this.level = level
        this.current = current || null
        this.max = max || null
    }
}

class SpellsManager {
    constructor(character) {
        this.character = character
        this.spellsRef = firebase.firestore().collection("Spells")
            .where("character", "==", character)
            .orderBy("level")
            .orderBy("name");
        this.spellLevelsRef = firebase.firestore().collection("SpellLevels")
            .where("character", "==", character)
            .orderBy("level");
    }

    beginListening(changeListener) {
        this.unsubscribeSpells = this.spellsRef.onSnapshot(snap => {
            this.spells = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            changeListener(false)
        })
        this.unsubscribeSpellLevels = this.spellLevelsRef.onSnapshot(snap => {
            this.spellLevels = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            changeListener(true)
        })
    }

    stopListening() {
        this.unsubscribeSpells()
        this.unsubscribeSpellLevels()
    }
    
    addSpell(name, dice, level) {
        firebase.firestore().collection("Spells")
            .add({ name, dice, level, character: this.character })
    }
    
    addSpellLevel(level, max) {
        let obj = { level, character: this.character }
        if (max != null) {
            obj.max = max
        }
        firebase.firestore().collection("SpellLevels")
            .add(obj)
    }
    
    decrementSpellLevelCounter(spellLevelIndex) {
        const spellLevel = this.spellLevels[spellLevelIndex]
        firebase.firestore().collection("SpellLevels")
            .doc(spellLevel.id).set({ current: spellLevel.current - 1 }, { merge: true })
    }
    
    refreshSpells() {
        let batch = firebase.firestore().batch()
        const collection = firebase.firestore().collection("SpellLevels")
        for (let level of this.spellLevels) {
            if (level.max != undefined) {
                batch.update(collection.doc(level.id), {current: level.max})
            }
        }
        batch.commit()
    }
}

class SpellsController {
    constructor() {
        this.promise = Promise.resolve(null)
        this.spellsProduced = false
        this.spellLevelsProduced = false
        spellsManager.beginListening(this.updateViewWrapper.bind(this))
        
        $('#addSpell').on('show.bs.modal', (event) => {
            const level = $(event.relatedTarget).data('level')
            document.getElementById("addSpell-level").innerText = level
            
            document.getElementById("addSpell-name").value = ""
            document.getElementById("addSpell-dice").value = ""
            document.getElementById("addSpell-errors").innerText = ""
        })
        $('#addSpell').on('shown.bs.modal', (event) => {
            document.getElementById("addSpell-name").focus()
        })
        
        document.getElementById("addSpell-submit").onclick = () => {
            const nameE = document.getElementById("addSpell-name")
            const dice = document.getElementById("addSpell-dice").value
            const level = parseInt(document.getElementById("addSpell-level").innerText, 10)
            
            const errorsE = document.getElementById("addSpell-errors")
            errorsE.innerText = ""
            if (!nameE.checkValidity()) {
                errorsE.innerText = "Must specify a name"
                return
            }
            
            console.log("name:", nameE.value)
            console.log("dice:", dice)
            console.log("level:", level)
            spellsManager.addSpell(nameE.value, dice, level)
            
            $('#addSpell').modal('hide')
        }
        
        $('#addSpellLevel').on('show.bs.modal', (event) => {
            document.getElementById("addSpellLevel-level").value = ""
            document.getElementById("addSpellLevel-max").value = ""
            document.getElementById("addSpellLevel-errors").innerText = ""
        })
        $('#addSpellLevel').on('shown.bs.modal', (event) => {
            document.getElementById("addSpellLevel-level").focus()
        })
        
        document.getElementById("addSpellLevel-submit").onclick = () => {
            const levelE = document.getElementById("addSpellLevel-level")
            const maxE = document.getElementById("addSpellLevel-max")
            
            const errorsE = document.getElementById("addSpellLevel-errors")
            errorsE.innerText = ""
            if (!levelE.checkValidity()) {
                errorsE.innerText = "Must specify a level"
                return
            }
            if (!maxE.checkValidity()) {
                errorsE.innerText = "Must specify a valid number of maximum spell points"
                return
            }
            
            const level = parseInt(levelE.value, 10)
            const max = maxE.value == "" ? null : parseInt(maxE.value, 10)
            console.log("level:", level)
            console.log("max:", max)
            spellsManager.addSpellLevel(level, max)
            
            $('#addSpellLevel').modal('hide')
        }
        
        document.getElementById("spellsRefreshButton").onclick = () => spellsManager.refreshSpells()
    }
    
    updateViewWrapper(isLevels) {
        // Using the promise as a wrapper forces each invocation of the callback to happpen
        // sequentially.  This prevents simultaneous edits of the html when the spells and spell
        // levels collections are updated at almost the exact same time.
        this.promise.then(() => {
            if (isLevels) {
                this.spellLevelsProduced = true
            } else {
                this.spellsProduced = true
            }

            if (this.spellLevelsProduced && this.spellsProduced) {
                this.updateView()
            }
        })
    }

    updateView() {
        const rows = []

        let levelIndex = -1
        let previousLevel = null
        for (let spellIndex in spellsManager.spells) {
            const spell = spellsManager.spells[spellIndex]
            const row = this.createRow()

            if (spell.level != previousLevel) {
                if (previousLevel != null) {
                    this.addSpellLevelEnd(rows, previousLevel)
                }
                ++levelIndex
                
                while (true) {
                    const spellLevel = spellsManager.spellLevels[levelIndex]
                    if (spellLevel != spell.level) {
                        break
                    }
                    this.addEmptySpellLevel(rows, spellLevel)
                    ++levelIndex
                }
                
                previousLevel = spell.level
                
                this.putSpellLevelText(row, spellsManager.spellLevels[levelIndex])
            }

            row.querySelector(".name").innerText = spell.name
            
            const diceSpan = document.createElement("span")
            diceSpan.dataset.spellIndex = spellIndex
            if (spell.dice != "") {
                diceSpan.onclick = this.castSpellAndRoll.bind(this);
                diceSpan.innerText = spell.dice
            } else {
                diceSpan.onclick = this.castSpellNoRoll.bind(this)
                diceSpan.innerText = "Cast!"
            }
            row.querySelector(".dice").appendChild(diceSpan)
            
            rows.push(row)
        }
        
        this.addSpellLevelEnd(rows, spellsManager.spellLevels[levelIndex].level)
        
        for (let i = levelIndex + 1; i < spellsManager.spellLevels.length; ++i) {
            this.addEmptySpellLevel(rows, spellsManager.spellLevels[i])
        }
        
        const addSpellLevel = htmlToElement(`<div class="dnd-row"><div class="level"></div>`)
        addSpellLevel.querySelector(".level").innerHTML =
            `<button type="button" class="btn bmd-btn-fab bmd-btn-fab-sm btn-secondary" data-toggle="modal" data-target="#addSpellLevel">
                <i class="material-icons">add</i>
            </button>
            <span data-toggle="modal" data-target="#addSpellLevel">Add Spell Level</span>`
        rows.push(addSpellLevel)

        rows.push(htmlToElement('<div class="dnd-spacer"></div>'))
        
        const elem = document.getElementById("spellLevelList")
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild)
        }
        for (let row of rows) {
            elem.appendChild(row)
        }
    }
    
    castSpellAndRoll(event) {
        const spell = spellsManager.spells[event.target.dataset.spellIndex]
        if (!this.castSpell(spell)) {
            return
        }
        
        const regex = /(\d+)d(\d+)(\+(\d+))?/
        const matches = regex.exec(spell.dice)
        if (!matches) {
            console.log("Couldn't cast spell because invalid dice:", spell.dice)
            return
        }
        
        document.querySelector("#numDice").value = matches[1]
        document.querySelector("#numSides").value = matches[2]
        document.querySelector("#rollMod").value = matches[4] || ""
        dontClearDiceRollModal = true
        characterController.updateRollModal()
        
        $('#diceRollModal').modal('show')
    }
    
    castSpellNoRoll(event) {
        const spell = spellsManager.spells[event.target.dataset.spellIndex]
        this.castSpell(spell)
    }
    
    castSpell(spell) {
        for (let spellLevelIndex in spellsManager.spellLevels) {
            const spellLevel = spellsManager.spellLevels[spellLevelIndex]
            if (spellLevel.level == spell.level) {
                if (spellLevel.current != undefined) {
                    if (spellLevel.current == 0) {
                        document.getElementById("noMoreSpellPoints-level").innerText = spell.level
                        $('#noMoreSpellPoints').modal('show')
                        return false
                    }
                    spellsManager.decrementSpellLevelCounter(spellLevelIndex)
                }
                return true
            }
        }
        
        console.log("invalid spell level", spell.level)
        return false
    }
    
    createRow() {
        return htmlToElement(
            `<div class="dnd-row">
                <div class="level"></div>
                <div class="name"></div>
                <div class="dice"></div>
            </div>`)
    }
    
    addSpellLevelEnd(rows, level) {
        const addSpell = this.createRow()
        this.putAddSpellButton(addSpell, level)
        rows.push(addSpell)

        this.addSpacer(rows)
    }
    
    addSpacer(rows) {
        rows.push(htmlToElement('<div class="dnd-spacer"></div>'))
    }
    
    putAddSpellButton(row, level) {
        row.querySelector(".name").innerHTML =
            `<button type="button" class="btn bmd-btn-fab bmd-btn-fab-sm btn-secondary" data-toggle="modal" data-target="#addSpell" data-level="${level}">
                <i class="material-icons">add</i>
            </button>
            <span data-toggle="modal" data-target="#addSpell" data-level="${level}">Add Spell</span>`
    }
    
    putSpellLevelText(row, spellLevel) {
        let points
        if (spellLevel.max != undefined) {
            points = spellLevel.current + "/" + spellLevel.max
        } else {
            points = "free"
        }
        row.querySelector(".level").innerText =
            spellLevel.level + " (" + points + ")"
    }

    addEmptySpellLevel(rows, spellLevel) {
        const row = this.createRow()
        row.classList.add("emptySpellLevel")
        this.putSpellLevelText(row, spellLevel)
        this.putAddSpellButton(row, spellLevel.level)
        rows.push(row)
        
        this.addSpacer(rows)
    }
}

main = function () {
	if (!urlParams.get("id") && !urlParams.get("newChar")) {
		window.location.href = "/profile.html"
		return
	}

	firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "/"
            return
        } else {
            if (characterManager) {
                characterManager.stopListening()
            }
            characterManager = new CharacterManager(user.uid);
            characterController = new CharacterController();

            let characterId = urlParams.get("id")
            if (spellsManager) {
                spellsManager.stopListening()
            }
            if (characterId) {
                spellsManager = new SpellsManager(characterId);
                spellsController = new SpellsController();
            }
        }
    });
    
};



main();
