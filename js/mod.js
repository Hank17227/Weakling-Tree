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
	num: "0.8.6",
	name: "✦ Achievements ✦",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.8.6 - 2026/3/14</h3><br>
		<b style='color:yellow'>✦ Achievements ✦</b><br>
		Decreased the price for Crystal Upgrade <b>Distillation</b><br>
		Added 3rd Angelic Challenge and Demonic Challenge<br>
		More Purified Crystal tier and more fun!
		<div style='color:yellow'>✦ Added the brand new achievement system ✦</div><br>
	<h3>v0.8.5 - 2026/3/11</h3><br>
		<b>Crystals Purification</b><br>
		Implemented the Purification Tab (it's fancy and <i>AD-like</i>)<br>
		Fixed the issue with unexpected progression spike<br><br>
	<h3>v0.8.2 - 2026/3/7</h3><br>
		<b>Challenges Era</b><br>
		Added Angelic & Demonic layer as well as their own unique challenges!<br>
		Swapped the order of some Crystal Shards milestones (smoother gameplay experience!)<br><br>
	<h3>v0.8.1 - 2026/3/6</h3><br>
		<b>A Small Hotfix</b><br>
		Fixed the state of button on Crystal Shards<br>
		Fixed the requirement for row 3 weakling upgrades<br><br>
	<h3>v0.8 - 2026/3/5</h3><br>
		<b style='color: rgb(209, 31, 31)'>A Completed Crystal</b><br>
		Finished the making of Crystal layer! (I am very proud)<br>
		Enjoy the process of being a slow bum and then soaring at the very end!<br><br>
	<h3>v0.7.6 - 2026/3/4</h3><br>
		<b>The Crystal Upgrades!</b><br>
		3/8 VC, 3/8 EC, and 2/10 Crystal Shards Upgrades had implemented!<br>
		added the UI in Crystal Upgrades (it has the similar structure to Crystals tab)<br><br>
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
		where it produces weakling points...<br><br>`

let winText = `Congratulations! You have endured the mental challenge the game had thrown at you and become the immortal!<br>(or perhaps you're a masochist?)`

// Display extra things at the top of the page
var displayThings = [
	function() {
		//let num = new Decimal("1f5")
		return "Current endgame: Have the final achievement <b>Eruption</b>!"
		//return num	
	}
]

// Determines when the game "ends"
function isEndgame() {
	//return player.points.gte(new Decimal("ee280000000"))
	return (hasAchievement("ach",91))
}


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

	let initialGain = new Decimal(0.05)
	if(inChallenge("dm",11)) initialGain = new Decimal(1)
	let gain = initialGain
	gain = gain.mul(buyableEffect("w",11))
	if(player.w.unlocked&&!inChallenge("a",21)) gain = gain.div(tmp.w.effect)
	if(hasUpgrade("w",14)) gain = gain.mul(5)
	if(hasUpgrade("w",15)) gain = gain.mul(upgradeEffect("w",15))
	if(hasUpgrade("w",23)) gain = gain.mul(upgradeEffect("w",23))
	if(hasMilestone("c",1)) gain = gain.mul(4)
	if(hasMilestone("c",3)) gain = gain.mul(3)
	if(hasMilestone("c",4)) gain = gain.mul(tmp.c.crystalsToMentality)
	if(hasMilestone("c",6)) gain = gain.mul(tmp.c.wmConvert)
	if(hasMilestone("c",22) & player.c.ud.gte(1e6)) gain = gain.div(player.c.ude.pow(0.4))
	if(hasMilestone("c",43)) gain = gain.mul(tmp.c.vcToMentality)
	if(hasChallenge("a",11)) gain = gain.pow(challengeEffect("a",11))
	if((hasMilestone("a",1)&&(inChallenge("a",11)||inChallenge("a",12)||inChallenge("a",21)))||hasMilestone("a",3)) gain = gain.mul(1e10)
	if(inChallenge("a",21)) gain = gain.mul(tmp.a.vppEffect.add(1)).mul(tmp.dm.eppEffect.add(1)).mul(tmp.w.effect)
	if(inChallenge("a",21)&&player.a.inChTime < 0.5) gain = new Decimal(0)
	
	/* softcap1: 1e7 Mentality gain (not so useful for now tbh)
	let sftcap1 = new Decimal(1e7)
	if(player.points.gte(sftcap1)) gain = gain.div(sftcap1).pow(0.5).mul(sftcap1)*/
	
	gain = (player.points.gte(1)?gain:Decimal.max(gain,initialGain))
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
	buyableStatus.scaleStart = [new Decimal(10), new Decimal(50)]
	buyableStatus.scaledFactor = [new Decimal(15), new Decimal(7500)]
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
	buyableStatus.scaleStart = [new Decimal(12), new Decimal(24), new Decimal(81)]
	buyableStatus.scaledFactor = [new Decimal(6), new Decimal(12), new Decimal(2400)]
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
		lockPre+formatWhole(500)+lockPost,
		lockPre+formatWhole(5000)+lockPost,
		lockPre+formatWhole(1e5)+lockPost,
	]
	let effects = [
		"◆ ×"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToCrystalShards))+" Crystal Shards gained on reset.<br>",
        "<div style='padding: 10px'>◆ Keep all of Weakling upgrades<br>on reset.</div>",
        "<div style='padding: 10px'>◆ Unlock automation for<br><b>Mentality Strengthen</b><br>and <b>Weakling Strengthen</b>.</div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToMentality))+" Mentality gain.<br></div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorvc,format(tmp.c.vcToWeakling))+" Weakling Dust gain.<br></div>",
		"<div style='padding: 10px'>◆ Unlock Virtuous Crystal upgrades.</div>",
		"<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorvc,formatWhole(tmp.c.vcToEffectiveVC))+" effective Virtuous Crystals to the VC effects.<div style='color: rgb(167, 167, 167)'>(based on the amount of VC upgrades)</div></div>",
		"<div style='padding: 10px'>◆ The 4th and 5th effects are "+colorText("b",tmp.c.colorvc,formatWhole(tmp.c.vcEff4Eff5Enhance.sub(1).mul(100)))+"% stronger.</div>",
		"<div style='padding: 10px'>◆ A quarter of the total VC also adds into the effective VC count.<div style='color: rgb(167, 167, 167)'>(You have "+colorText("b",tmp.c.colorvc,formatWhole(player.c.totalvc))+" total VC)</div></div>"
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
		lockPre+formatWhole(500)+lockPost,
		lockPre+formatWhole(5000)+lockPost,
		lockPre+formatWhole(1e5)+lockPost,
	]
	let effects = [
		"◆ ×"+colorText("b",tmp.c.colorec,format(new Decimal(tmp.c.ecToUD)))+" Unstable Dust gain.<br>",
        "<div style='padding: 10px'>◆ Unlock new milestones for<br>Unstable Dust.</div>",
		"<div style='padding: 10px'>◆ ×"+colorText("b",tmp.c.colorec,format(tmp.c.ecToWeaklingEffect))+" to the Weakling Dust effect.<br></div>",
		"<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,formatWhole(tmp.c.ecToCostIncrease))+" to the cost of condensing Crystals.<br></div>",
		"<div style='padding: 10px'>◆ /"+colorText("b",tmp.c.colorec,format(tmp.c.ecToVCEffects))+" to the first 5 effects on Virtuous Crystals.<br></div>",
		"<div style='padding: 10px'>◆ Unlock Evil Crystal upgrades.</div>",
		"<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,formatWhole(tmp.c.ecToEffectiveEC))+" effective Evil Crystals to the EC effects.<div style='color: rgb(167, 167, 167)'>(based on the amount of EC upgrades)</div></div>",
		"<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,format(tmp.c.ecToCostIncreaseExp))+" to the exponent on the 4th effect.</div>",
		"<div style='padding: 10px'>◆ A quarter of the total EC also adds into the effective EC count.<div style='color: rgb(167, 167, 167)'>(You have "+colorText("b",tmp.c.colorec,formatWhole(player.c.totalec))+" total EC)</div></div>"
	]
	if(hasUpgrade("c",32)) effects[3] = "<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,formatWhole(tmp.c.ecToCostIncrease))+" and ^"+format(tmp.c.crystalCostExp)+" to the cost of condensing Crystals.<br></div>"
	if(hasMilestone("c",77)) effects[3] = "<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,formatWhole(tmp.c.ecToCostIncrease))+" and ^"+colorText("b",tmp.c.colorec,format(tmp.c.crystalCostExp))+" to the cost of condensing Crystals.<br></div>"
	if(player.c.ec.gte(1e4)) effects[3] = "<div style='padding: 10px'>◆ +"+colorText("b",tmp.c.colorec,formatWhole(tmp.c.ecToCostIncrease))+" (softcapped) and ^"+colorText("b",tmp.c.colorec,format(tmp.c.crystalCostExp))+" to the cost of condensing Crystals.<br></div>"
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
	if(player.c.vc.add(player.c.ec).eq(0)&&!(hasMilestone("c",45)||hasMilestone("c",75))) {
		player.c.vc = player.c.vc.add(1)
		return
	}
	/*
	if(player.c.ec.gte(50)&&player.c.vc.lt(50)&&!hasUpgrade("c",31)&&!hasUpgrade("c",11)) {
		player.c.vc = player.c.vc.add(1)
		return
	}
	if(player.c.vc.gte(50)&&player.c.ec.lt(50)&&!hasUpgrade("c",31)&&!hasUpgrade("c",11)) {
		player.c.ec = player.c.ec.add(1)
		return
	}*/
	let rng = Math.floor(Math.random()*100)
	let thshold = 50
	if(hasUpgrade("c",21)) thshold = 101 // always gets ec
	if(hasUpgrade("c",41)) thshold = -1 // always gets vc
	if(rng >= thshold) player.c.vc = player.c.vc.add(tmp.c.vcGain)
	else player.c.ec = player.c.ec.add(tmp.c.ecGain)
	return
}

function vcuCount() {
	player.c.vcu = new Decimal(0)
	if(hasUpgrade("c",11)) player.c.vcu = player.c.vcu.add(1)
	if(hasUpgrade("c",12)) player.c.vcu = player.c.vcu.add(1)
	if(hasUpgrade("c",13)) player.c.vcu = player.c.vcu.add(1)
	if(hasUpgrade("c",14)) player.c.vcu = player.c.vcu.add(1)
	if(hasUpgrade("c",21)) player.c.vcu = player.c.vcu.add(1)
	if(hasUpgrade("c",22)) player.c.vcu = player.c.vcu.add(1)
	if(hasUpgrade("c",23)) player.c.vcu = player.c.vcu.add(1)
	if(hasUpgrade("c",24)) player.c.vcu = player.c.vcu.add(1)
	return
}

function ecuCount() {
	player.c.ecu = new Decimal(0)
	if(hasUpgrade("c",31)) player.c.ecu = player.c.ecu.add(1)
	if(hasUpgrade("c",32)) player.c.ecu = player.c.ecu.add(1)
	if(hasUpgrade("c",33)) player.c.ecu = player.c.ecu.add(1)
	if(hasUpgrade("c",34)) player.c.ecu = player.c.ecu.add(1)
	if(hasUpgrade("c",41)) player.c.ecu = player.c.ecu.add(1)
	if(hasUpgrade("c",42)) player.c.ecu = player.c.ecu.add(1)
	if(hasUpgrade("c",43)) player.c.ecu = player.c.ecu.add(1)
	if(hasUpgrade("c",44)) player.c.ecu = player.c.ecu.add(1)
	return
}

function totalVCCalc() {
	player.c.totalvc = player.c.vc
	if(hasUpgrade("c",11)) player.c.totalvc = player.c.totalvc.add(50)
	if(hasUpgrade("c",12)) player.c.totalvc = player.c.totalvc.add(100)
	if(hasUpgrade("c",13)) player.c.totalvc = player.c.totalvc.add(1000)
	if(hasUpgrade("c",14)) player.c.totalvc = player.c.totalvc.add(1e4)
	if(hasUpgrade("c",21)) player.c.totalvc = player.c.totalvc.add(1e9)
	if(hasUpgrade("c",22)) player.c.totalvc = player.c.totalvc.add(1e35)
	if(hasUpgrade("c",23)) player.c.totalvc = player.c.totalvc.add(0)
	if(hasUpgrade("c",24)) player.c.totalvc = player.c.totalvc.add(0)
	if(hasUpgrade("c",53)) player.c.totalvc = player.c.totalvc.add(50000)
	if(player.a.vc1Bought > 0)
		for(let count = 0; count < player.a.vc1Bought; count++) {
			let baseCost = new Decimal(2e15)
			player.c.totalvc = player.c.totalvc.add(baseCost.mul(Decimal.pow(3,count)))
		}
	if(player.a.vc2Bought > 0)
		for(let count = 0; count < player.a.vc2Bought; count++) {
			let baseCost = new Decimal(2.5e25)
			player.c.totalvc = player.c.totalvc.add(baseCost.mul(Decimal.pow(12,count)))
		}
	if(player.a.vc3Bought > 0)
		for(let count = 0; count < player.a.vc3Bought; count++) {
			let baseCost = new Decimal(7.5e50)
			player.c.totalvc = player.c.totalvc.add(baseCost.mul(Decimal.pow(60,count)))
		}
	if(player.a.vc4Bought > 0)
		for(let count = 0; count < player.a.vc4Bought; count++) {
			let baseCost = new Decimal("9.99e999")
			player.c.totalvc = player.c.totalvc.add(baseCost.mul(Decimal.pow(360,count)))
		}
	return
}

function totalECCalc() {
	player.c.totalec = player.c.ec
	if(hasUpgrade("c",31)) player.c.totalec = player.c.totalec.add(50)
	if(hasUpgrade("c",32)) player.c.totalec = player.c.totalec.add(100)
	if(hasUpgrade("c",33)) player.c.totalec = player.c.totalec.add(1200)
	if(hasUpgrade("c",34)) player.c.totalec = player.c.totalec.add(1e4)
	if(hasUpgrade("c",41)) player.c.totalec = player.c.totalec.add(1e9)
	if(hasUpgrade("c",42)) player.c.totalec = player.c.totalec.add(1e36)
	if(hasUpgrade("c",43)) player.c.totalec = player.c.totalec.add(0)
	if(hasUpgrade("c",44)) player.c.totalec = player.c.totalec.add(0)
	if(hasUpgrade("c",53)) player.c.totalec = player.c.totalec.add(50000)
	if(player.dm.ec1Bought > 0)
		for(let count = 0; count < player.dm.ec1Bought; count++) {
			let baseCost = new Decimal(5e15)
			player.c.totalec = player.c.totalec.add(baseCost.mul(Decimal.pow(3,count)))
		}
	if(player.dm.ec2Bought > 0)
		for(let count = 0; count < player.dm.ec2Bought; count++) {
			let baseCost = new Decimal(1e26)
			player.c.totalec = player.c.totalec.add(baseCost.mul(Decimal.pow(12,count)))
		}
	if(player.dm.ec3Bought > 0)
		for(let count = 0; count < player.dm.ec3Bought; count++) {
			let baseCost = new Decimal(1e52)
			player.c.totalec = player.c.totalec.add(baseCost.mul(Decimal.pow(60,count)))
		}
	if(player.dm.ec4Bought > 0)
		for(let count = 0; count < player.dm.ec2Bought; count++) {
			let baseCost = new Decimal("9.99e999")
			player.c.totalec = player.c.totalec.add(baseCost.mul(Decimal.pow(360,count)))
		}
	return
}
/*
function filter(list, keep){ // copied from incrementreeverse
    return list.filter(x => keep.includes(x))
}

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
