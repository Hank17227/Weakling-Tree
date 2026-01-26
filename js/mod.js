let modInfo = {
	name: "Weakling Tree",
	author: "HankG",
	pointsName: "Points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.05",
	name: "Hotfix (I guess)",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.05 - 2026/1/26</h3><br>
		Fixed the Weakling Dust generation when having less than 1 Point (no more decay mess horray)
		A Crystal Rework is coming soon...<br>
	<h3>v0.03 - 2025/10/15</h3><br>
		Adds a "decay" function which allows you to progress the game faster<br>
		<i>(this took a while)</i><br>
		Adds "Crystals" and "Unstable Dust"<br><br>
	<h3>v0.02 - 2025/10/14</h3><br>
		Adds more upgrades on Weakling layer<br>
		Adds a new layer: "Crystals" <i>(not implemented yet)</i><br>
		Enables dev speed :)<br><br>
	<h3>v0.01 - 2025/10/13</h3><br>
		add the layer "Weaklings"<br>
		where it produces weakling points...`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(0.05)
	gain = gain.mul(buyableEffect("w",11))
	if(player["w"].points.gt(0)) gain = gain.div(tmp.w.effect)
	if(hasUpgrade("w",14)) gain = gain.mul(5)
	if(hasUpgrade("w",15)) gain = gain.mul(upgradeEffect("w",15))
	if(hasUpgrade("w",23)) gain = gain.mul(upgradeEffect("w",23))
	if(hasMilestone("c",1)) gain = gain.mul(10)
	if(hasMilestone("c",3)) gain = gain.mul(5)
	gain = (player.points.gte(1)?gain:Decimal.max(gain,0.05))
	return gain
}

// Custom function that will be used here
/*
let best = new Decimal(0)
function bestPoints() {
	best = best.max(tmp.points)
	return best
}

function decay(ratio) {
	let decayRate = new Decimal(0)
	let threshold = new Decimal(0.6)
	if (ratio.lte(threshold)) decayRate = ratio.pow(2).div(threshold.pow(2))
	else decayRate = new Decimal(1)
	return decayRate
}*/

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	
}}

// Display extra things at the top of the page
var displayThings = [
	//function() {return "Current Endgame: Unlock layer <b>Crystals</b>"}
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000"))
	//return hasUpgrade("w",25)
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
