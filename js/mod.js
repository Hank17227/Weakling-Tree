let modInfo = {
	name: "Kire Particles",
	author: "HankG",
	pointsName: "particles",
	modFiles: ["layers/particles.js",
		"layers/devTool.js","tree.js"],

	discordName: "hankgaming",
	discordLink: "https://discord.gg/G8Yt9xbCgd",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Particles Clicker",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.1 - 2026/10/14</h3><br>
		<b>Particles Clicker</b><br>
		This is a game inspired from an AI slop game... (ironic, I know)<br>
		Your goal is to first gather enough of particles to finally prestige-<br>
		Feel free to use autoclicker if your hand hurts XD<br><br>
		<div style='color:rgb(44, 186, 241)'>Current Endgame: Reach 1,000,000 particles</div><br>
	`

let winText = `Congratulations! You have beaten the game for now... and then?`

// Display extra things at the top of the page
var displayThings = [
	function() {
	}
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(1e6)
	
}

//let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return getBuyableAmount("p",11).gte(0)
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(0)
	gain = gain.add(buyableEffect("p",11))
	gain = gain.add(buyableEffect("p",12))
	gain = gain.add(buyableEffect("p",13))
	return gain
}

// Custom function that will be used here
function totalCostFormula(base, constant, x, factor, offset) { // the original formula for clarity
    return base.mul(factor).mul(factor.pow(x.sub(offset)).sub(1)).div(factor.sub(1)).add(constant)
}

function totalCostFormulaLARGE(base, x, factor, offset, accel) { // this is used for the larger scaling
	let totalFactor = new Decimal(1)
	for (let i = 0; i < x.sub(offset); i++) {
		factor = factor.mul(accel)
		totalFactor = totalFactor.mul(factor)
	}
	return base.mul(totalFactor)
}

function totalCost(buyableStatus) { // function that puts the variables into a single object
	let base = buyableStatus.base
	let constant = buyableStatus.constant
	let x = buyableStatus.buyCount
	let factor = buyableStatus.factor
	let offset = buyableStatus.offset
	let accel = buyableStatus.accel
	let sumCost = totalCostFormula(base, constant, x, factor, offset)
	if(buyableStatus.large) sumCost = totalCostFormulaLARGE(base, x, factor, offset, accel)
	return sumCost
}

function totalBuysFormula(points, base, constant, factor, offset) { // the original formula for clarity
    let finalBuys = Decimal.log10((points.sub(constant)).mul(factor.sub(1)).div(base).div(factor).add(1)).div(Decimal.log10(factor)).add(offset)
	if (finalBuys.lt(0)) return finalBuys.ceil()
	return finalBuys.floor()
}

function totalBuysFormulaLARGE(points, base, factor, offset, accel) { // this is used for the larger scaling
    let finalBuys = offset
	let totalFactor = new Decimal(1)
	while(points.div(base).div(totalFactor).gte(1)) {
		factor = factor.mul(accel)
		totalFactor = totalFactor.mul(factor)
		finalBuys = finalBuys.add(1)
	}
	return finalBuys.sub(1)
}

function totalBuys(buyableStatus) { // function that puts the variables into a single object
	let points = buyableStatus.points.add(buyableStatus.boughtCost)
	let base = buyableStatus.base
	let constant = buyableStatus.constant
	let factor = buyableStatus.factor
	let offset = buyableStatus.offset
	let accel = buyableStatus.accel
    if(buyableStatus.large) buyableStatus.buyCount = totalBuysFormulaLARGE(points, base, factor, offset, accel)
    else buyableStatus.buyCount = totalBuysFormula(points, base, constant, factor, offset)
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
			buyableStatus.large = buyableStatus.largeScale[scaleIndex]
			if(!buyableStatus.injected) totalBuys(buyableStatus)
			else buyableStatus.buyCount = injectedBuyCount
		}
    }
	return buyableStatus
}

function colorPalette(type) {
	switch(type) {
		case "c": // Crystal Shards
			return ["rgb(209, 31, 31)","rgb(191, 143, 143)"]
	}
}

function getCurrency(type) {
	switch(type) {
		case "c": // Crystal Shards
			return
	}
}

function upgradeButtonStyle(type,layer,id,multi=false) { // multi: for upgrades with multiple currencies required
	let colors = colorPalette(type)
	let currency = getCurrency(type)
	let color = colors[1]
	if(hasUpgrade(layer,id)) color = colors[0]
	if(currency.gte(tmp[layer].upgrades[id].cost)&&!hasUpgrade(layer,id)&&!multi) {
		color = "linear-gradient("+colors[1]+","+colors[0]+")"
	}
	if(tmp[layer].upgrades[id].canAfford&&!hasUpgrade(layer,id)&&multi) {
		color = "linear-gradient("+colors[1]+","+colors[0]+")"
	}
	return color
}

function getUpgCount(layer, start, end) {
	let upgs = 0
	for(let i = start; i <= end; i++) {
		if(hasUpgrade(layer,i)) upgs++
	}
	return upgs
}

function hideUpgs(layer,id) {
    return hasUpgrade(layer,id)&&player[layer].hideUpgrades
}

function reqCalc(layer,baseResource) {
	let resource = baseResource.div(tmp[layer].requires).pow(tmp[layer].exponent).mul(tmp[layer].gainMult).pow(tmp[layer].gainExp).floor()
    let next_resource = resource.add(1)
	let req = next_resource.pow(1/tmp[layer].gainExp).div(tmp[layer].gainMult).pow(1/tmp[layer].exponent).mul(tmp[layer].requires)
	return req
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	//return player.points.gte(new Decimal(1e6))
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