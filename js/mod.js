let modInfo = {
	name: "Weakling Tree",
	author: "HankG",
	pointsName: "Mentality",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.7.5",
	name: "The Crystal Update Continuation",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.7.5 - 2026/2/28</h3><br>
		<b>The Crystal Update Continuation</b><br>
		Implemented some of the features on both Virtuous and Evil Crystals!<br>
		(up to 50 Crystals of both type because why not)<br><br>
		Some bug fixes along the way<br>
		(finally got the automation on live!)<br><br>
	<h3>v0.7.1 - 2026/2/26</h3><br>
		<b style='color: rgb(44, 186, 241)'>Colorful Update</b><br>
		Implemented the UI for Crystals tab,<br>
		more updates coming soon...<br>
		Changed the version name from "0.07" to "0.7" to include sub versions<br><br>
	<h3>v0.07 - 2026/2/24</h3><br>
		Finished the implementation of automation on Weakling buyables <i>(this took me quite a while)</i><br>
		Adding Crystal Shards milestones until next stage (Crystal merging)<br><br>
	<h3>v0.06 - 2026/2/19</h3><br>
		Re-added Unstable Dust and Crystal Milestones<br>
		Added a secret option ;)<br><br>
	<h3>v0.05 - 2026/1/26</h3><br>
		Fixed the Weakling Dust generation when having less than 1 Point (no more decay mess horray)<br>
		A Crystal Rework is coming soon...<br><br>
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
	if(hasMilestone("c",1)) gain = gain.mul(4)
	if(hasMilestone("c",3)) gain = gain.mul(3)
	if(hasMilestone("c",5)) gain = gain.mul(tmp.c.wmConvert)
	if(hasMilestone("c",6)) gain = gain.mul(tmp.c.crystalsToMentality)
	if(hasMilestone("c",22) & player.c.ud.gte(1e6)) gain = gain.div(player.c.ude.pow(0.4))
	if(hasMilestone("c",43)) gain = gain.mul(tmp.c.vcToMentality)
	
	/* softcap1: 1e7 Mentality gain (not so useful for now tbh)
	let sftcap1 = new Decimal(1e7)
	if(player.points.gte(sftcap1)) gain = gain.div(sftcap1).pow(0.5).mul(sftcap1)*/
	
	gain = (player.points.gte(1)?gain:Decimal.max(gain,0.05))
	return gain
}

// Custom function that will be used here
function totalCostFormula(base, constant, x, factor, offset) { // the original formula for clarity
    return base.mul(factor).mul(factor.pow(x.sub(offset)).sub(1)).div(factor.sub(1)).add(constant)
}

function totalCost(buyableStatus) { // function that puts the variables into a single object
	let base = buyableStatus.base
	let constant = buyableStatus.constant
	let x = buyableStatus.buyCount
	let factor = buyableStatus.factor
	let offset = buyableStatus.offset
	let sumCost = totalCostFormula(base, constant, x, factor, offset)
	return sumCost
}

function totalBuysFormula(points, base, constant, factor, offset) { // the original formula for clarity
    let finalBuys = Decimal.log10((points.sub(constant)).mul(factor.sub(1)).div(base).div(factor).add(1)).div(Decimal.log10(factor)).add(offset)
	if (finalBuys.lt(0)) return finalBuys.ceil()
	return finalBuys.floor()
}

function totalBuys(buyableStatus) { // function that puts the variables into a single object
	let points = buyableStatus.points.add(buyableStatus.boughtCost)
	let base = buyableStatus.base
	let constant = buyableStatus.constant
	let factor = buyableStatus.factor
	let offset = buyableStatus.offset
    buyableStatus.buyCount = totalBuysFormula(points, base, constant, factor, offset)
	return
}

function totalBuysWithScaling(buyableStatus) { // 3rd layer of function that accounts for scaling, returns object for updating
	let injectedBuyCount = buyableStatus.buyCount
	if (!buyableStatus.injected) totalBuys(buyableStatus) 
	for (let scaleIndex = new Decimal(0); scaleIndex.lt(buyableStatus.scaleStart.length); scaleIndex = scaleIndex.add(1)) {
		if (buyableStatus.buyCount.gte(buyableStatus.scaleStart[scaleIndex])) {
			buyableStatus.buyCount = buyableStatus.scaleStart[scaleIndex].sub(1)
			buyableStatus.constant = totalCost(buyableStatus)
			buyableStatus.base = buyableStatus.base.mul(buyableStatus.factor.pow(buyableStatus.scaleStart[scaleIndex].sub(scaleIndex.lt(1)?1:buyableStatus.scaleStart[scaleIndex.sub(1)])))
			buyableStatus.factor = buyableStatus.scaledFactor[scaleIndex]
			buyableStatus.offset = buyableStatus.scaleStart[scaleIndex].sub(1)
			if(!buyableStatus.injected) totalBuys(buyableStatus)
			else buyableStatus.buyCount = injectedBuyCount
		}
    }
	return buyableStatus

	// old function implementation
	/*
	if (buyableStatus.buyCount.gte(buyableStatus.scaleStart[0])) {
        buyableStatus.buyCount = buyableStatus.scaleStart[0].sub(1)
        buyableStatus.constant = totalCost(buyableStatus)
        buyableStatus.base = buyableStatus.base.mul(buyableStatus.factor.pow(buyableStatus.scaleStart[0].sub(1)))
        buyableStatus.factor = buyableStatus.scaledFactor[0]
        buyableStatus.offset = buyableStatus.scaleStart[0].sub(1)
        if(!buyableStatus.injected) totalBuys(buyableStatus)
		else buyableStatus.buyCount = injectedBuyCount
    }
    if (buyableStatus.buyCount.gte(buyableStatus.scaleStart[1])) {
        buyableStatus.buyCount = buyableStatus.scaleStart[1].sub(1)
        buyableStatus.constant = totalCost(buyableStatus)
        buyableStatus.base = buyableStatus.base.mul(buyableStatus.factor.pow(buyableStatus.scaleStart[1].sub(buyableStatus.scaleStart[0])))
        buyableStatus.factor = buyableStatus.scaledFactor[1]
        buyableStatus.offset = buyableStatus.scaleStart[1].sub(1)
        if(!buyableStatus.injected) totalBuys(buyableStatus)
		else buyableStatus.buyCount = injectedBuyCount
    }*/
}

function MSInitialize(buyableStatus) {
	buyableStatus.points = player.points
	buyableStatus.base = tmp.w.buyables[11].baseCost
	buyableStatus.constant = tmp.w.buyables[11].baseCost
    buyableStatus.factor = new Decimal(5)
    buyableStatus.offset = new Decimal(0)
	buyableStatus.buyCount = new Decimal(-1)
	buyableStatus.injected = false
	buyableStatus.bought = getBuyableAmount("w",11).sub(1)
	buyableStatus.boughtCost = new Decimal(0)
	return buyableStatus
}

function WSInitialize(buyableStatus) {
	buyableStatus.points = player.w.points
	buyableStatus.base = tmp.w.buyables[12].baseCost
	buyableStatus.constant = tmp.w.buyables[12].baseCost
    buyableStatus.factor = new Decimal(3)
    buyableStatus.offset = new Decimal(0)
	buyableStatus.buyCount = new Decimal(-1)
	buyableStatus.injected = false
	buyableStatus.bought = getBuyableAmount("w",12).sub(1)
	buyableStatus.boughtCost = new Decimal(0)
	return buyableStatus
}

function test(buyableStatus) {
	let times = new Decimal(0)
	for (let scaleIndex = new Decimal(0); scaleIndex.lt(buyableStatus.scaleStart.length); scaleIndex = scaleIndex.add(1))
		times = buyableStatus.scaleStart[scaleIndex]
	return times
}

function vcEcMani(vc, ec) {
    player.c.vc = new Decimal(vc)
    player.c.ec = new Decimal(ec)
	return ""
}

function vcEffectsList(start=new Decimal(0), end=new Decimal(0), effectOnly=false) {
	let lockPre = "<div style='color: gray; padding: 5px'>◇ Next unlocks at "
	let lockPost = " Virtuous Crystals.</div>"
	let effectsLocked = [
		"<div style='color: gray;'>◇ Next unlocks at 1 Virtuous Crystal.</div>",
        lockPre+"3"+lockPost,
		lockPre+"5"+lockPost,
		lockPre+"10"+lockPost,
		lockPre+"30"+lockPost,
		lockPre+"50"+lockPost,
		lockPre+"70"+lockPost,
	]
	let effects = [
		"◆ ×"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToCrystalShards))+" Crystal Shards gained on reset.<br>",
        "<div style='padding: 10px'>◆ Keep the first 2 rows of<br>Weakling upgrades.</div>",
        "<div style='padding: 10px'>◆ Unlock automation for<br><b>Mentality Strengthen</b><br>and <b>Weakling Strengthen</b>.</div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToMentality))+" Mentality gain.<br></div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToWeakling))+" Weakling Dust gain.<br></div>",
		"<div style='padding: 10px'>◆ Unlock Virtuous Crystal upgrades.<br>(next update)</div>"
	]
	let effectText = ""
	for (let index = start; index.lt(end); index = index.add(1))
		effectText = effectText+effects[index]
	if(!effectOnly) effectText = effectText+effectsLocked[end]
	return effectText
}

function ecEffectsList(start=new Decimal(0), end=new Decimal(0), effectOnly=false) {
	let lockPre = "<div style='color: gray; padding: 5px'>◇ Next unlocks at "
	let lockPost = " Evil Crystals.</div>"
	let effectsLocked = [
		"<div style='color: gray;'>◇ Next unlocks at 1 Evil Crystal.</div>",
        lockPre+"5"+lockPost,
		lockPre+"10"+lockPost,
		lockPre+"25"+lockPost,
		lockPre+"40"+lockPost,
		lockPre+"50"+lockPost,
		lockPre+"70"+lockPost,
	]
	let effects = [
		"◆ ×"+colorText("b",tmp.c.colorec,format(new Decimal(tmp.c.ecToUD)))+" Unstable Dust gain.<br>",
        "<div style='padding: 10px'>◆ Unlock new milestones for<br>Unstable Dust.</div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorec,format(tmp.c.ecToWeaklingEffect))+" to the Weakling Dust effect.<br></div>",
		"<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,format(player.c.ec.sub(24), 0))+" to the cost of condensing Crystals.<br></div>",
		"<div style='padding: 10px'>◆ /"+colorText("b",tmp.c.colorec,format(tmp.c.ecToVCEffects))+" to the first 5 effects on<br>Virtuous Crystals.<br></div>",
		"<div style='padding: 10px'>◆ Unlock Evil Crystal upgrades.<br>(next update)</div>"
	]
	let effectText = ""
	for (let index = start; index.lt(end); index = index.add(1))
		effectText = effectText+effects[index]
	if(!effectOnly) effectText = effectText+effectsLocked[end]
	return effectText
}

/*
function crystalEffectsInitializer(status) {
	for(let index = 0; index < status.length; index = index+1)
		status[index] = false
	return status
}*/

function crystalTypeDecider() {
	if(player.c.vc.add(player.c.ec).eq(0)) {
		player.c.vc = player.c.vc.add(1)
		return
	}
	if(player.c.ec.gte(50)&&player.c.vc.lt(50)) {
		player.c.vc = player.c.vc.add(1)
		return
	}
	if(player.c.vc.gte(50)&&player.c.ec.lt(50)) {
		player.c.ec = player.c.ec.add(1)
		return
	}
	let rng = Math.floor(Math.random()*100)
	if(rng >= 50) player.c.vc = player.c.vc.add(1)
	else player.c.ec = player.c.ec.add(1)
	return
}
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
	function() {
		//let num = new Decimal("1f5")
		let vc = "Virtuous Crystals"
		let ec = "Evil Crystals"
		let vcColored = colorText("b",tmp.c.colorvc,vc)
		let ecColored = colorText("b",tmp.c.colorec,ec)
		return "Current Endgame:<br>Have both 50 "+vcColored+" and "+ecColored+"."
		//return num	
	}
]

// Determines when the game "ends"
function isEndgame() {
	//return player.points.gte(new Decimal("ee280000000"))
	return (hasMilestone("c",45)&hasMilestone("c",75))
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
