function MSInitialize(buyableStatus) {
	buyableStatus.scaleStart = [new Decimal(10), new Decimal(50)]
	buyableStatus.scaledFactor = [new Decimal(15), new Decimal(7500)]
	buyableStatus.largeScale = [false,false]
	buyableStatus.large = false
	buyableStatus.points = player.points
	buyableStatus.base = tmp.w.buyables[11].baseCost
	buyableStatus.constant = tmp.w.buyables[11].baseCost
    buyableStatus.factor = new Decimal(5)
    buyableStatus.offset = new Decimal(0)
	buyableStatus.accel = new Decimal(1.5)
	buyableStatus.buyCount = new Decimal(-1)
	buyableStatus.injected = false
	buyableStatus.bought = getBuyableAmount("w",11).sub(1)
	buyableStatus.boughtCost = new Decimal(0)
	return buyableStatus
}

function WSInitialize(buyableStatus) {
	buyableStatus.scaleStart = [new Decimal(12), new Decimal(24), new Decimal(81), new Decimal(160)]
	buyableStatus.scaledFactor = [new Decimal(6), new Decimal(12), new Decimal(2400), new Decimal(2400)]
	buyableStatus.largeScale = [false,false,false,true]
	buyableStatus.large = false
	buyableStatus.points = player.w.points
	buyableStatus.base = tmp.w.buyables[12].baseCost
	buyableStatus.constant = tmp.w.buyables[12].baseCost
    buyableStatus.factor = new Decimal(3)
    buyableStatus.offset = new Decimal(0)
	buyableStatus.accel = new Decimal(1.5)
	buyableStatus.buyCount = new Decimal(-1)
	buyableStatus.injected = false
	buyableStatus.bought = getBuyableAmount("w",12).sub(1)
	buyableStatus.boughtCost = new Decimal(0)
	return buyableStatus
}

addLayer("w", {
    tabFormat: [
        ["infobox","introBox"],
        "blank",
        "buyables",
        "blank",
        "blank",
        "main-display",
        "resource-display",
        ["display-text", function() {
            if(inChallenge("dm",22)&&!tmp.w.upgrades[61].unlocked) 
                return colorText("h1","rgba(211, 13, 13, 0.8)",`Upgrades are nowhere to be seen...<br>
                The complete darkness blinds your eyes...<br>
                Gain the power of the Demon... and adapt to the darkness...`)
            return ""
        }],
        //"prestige-button",
        "upgrades",
        "clickables", "blank"
    ],
    name: "Weaklings", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        MSStatus: { // Stats for Mentality Strengthen Cost Calculation
            points: new Decimal(0),
            base: new Decimal(10),
            constant: new Decimal(10),
            factor: new Decimal(5),
            offset: new Decimal(0),
            scaleStart: [new Decimal(10), new Decimal(50)],
            scaledFactor: [new Decimal(15), new Decimal(7500)],
            largeScale: [false,false],
            large: false,
            accel: new Decimal(1.5),
            buyCount: new Decimal(0),
            injected: false, // filter to the totalBuysWithScaling so that it doesn't mess up the calc with set buyCount value
            bought: new Decimal(0),
            boughtCost: new Decimal(0)
        },
        WSStatus: { // Stats for Weakling Strengthen Cost Calculation
            points: new Decimal(0),
            base: new Decimal(5),
            constant: new Decimal(5),
            factor: new Decimal(3),
            offset: new Decimal(0),
            scaleStart: [new Decimal(12), new Decimal(24), new Decimal(81), new Decimal(160)],
            scaledFactor: [new Decimal(6), new Decimal(12), new Decimal(2400), new Decimal(2400)],
            largeScale: [false,false,false,true],
            large: false,
            accel: new Decimal(1.5),
            buyCount: new Decimal(0),
            injected: false, // filter to the totalBuysWithScaling so that it doesn't mess up the calc with set buyCount value
            bought: new Decimal(0),
            boughtCost: new Decimal(0)
        }
    }},
    MSCostDifference() {
        player.w.MSStatus = MSInitialize(player.w.MSStatus)
        player.w.MSStatus.buyCount = player.w.MSStatus.bought
        player.w.MSStatus.injected = true
        player.w.MSStatus = totalBuysWithScaling(player.w.MSStatus)
        let cost2 = totalCost(player.w.MSStatus)
        player.w.MSStatus = MSInitialize(player.w.MSStatus)
        player.w.MSStatus.boughtCost = cost2
        player.w.MSStatus = totalBuysWithScaling(player.w.MSStatus)
        let totalBuy = player.w.MSStatus.buyCount
        let cost1 = totalCost(player.w.MSStatus)
        player.w.MSStatus.buyCount = totalBuy
        return cost1.sub(cost2)
    },
    WSCostDifference() {
        player.w.WSStatus = WSInitialize(player.w.WSStatus)
        player.w.WSStatus.buyCount = player.w.WSStatus.bought
        player.w.WSStatus.injected = true
        player.w.WSStatus = totalBuysWithScaling(player.w.WSStatus)
        let cost2 = totalCost(player.w.WSStatus)
        player.w.WSStatus = WSInitialize(player.w.WSStatus)
        player.w.WSStatus.boughtCost = cost2
        player.w.WSStatus = totalBuysWithScaling(player.w.WSStatus)
        let totalBuy = player.w.WSStatus.buyCount
        let cost1 = totalCost(player.w.WSStatus)
        player.w.WSStatus.buyCount = totalBuy
        return cost1.sub(cost2)
    },
    infoboxes: {
        introBox: {
            title() {if(inChallenge("dm",22)) return "..."; return "Welcome!"},
            body() {
                if(inChallenge("dm",22)) 
                    return `<i style='color:gray'>No more Mentality left... We're going insane...<br>
                    The demon... he trapped us here!<br>
                    Here in the endless wasteland where no light can be seen...</i>`
                return `Welcome to the Weakling Tree! In here, you start off very weak but 
                eventually becomes stronger as you get more upgrades!<br><br>
                Now, you'll have to wait until you get 1 Mentality, which will enable you to gain
                <b>Weakling Dust</b> automatically, and you can start from there.<br>`
            }
        }
    },
    color: "#7a7a79ff",
    requires() {
        if (player.w.points.gt(0)||(inChallenge("dm",22)&&hasUpgrade(this.layer,61))) return new Decimal(0)
        else return new Decimal(1)
    }, // Can be a function that takes requirement increases into account
    resource: "Weakling Dust", // Name of prestige currency
    baseResource: "Mentality", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0, // Prestige currency exponent
    passiveGeneration() {
        let gain = new Decimal(0.1)
        if(inChallenge("a",11)) gain = new Decimal(0)
        if((inChallenge("a",21)||inChallenge("dm",21))&&(player.a.inChTime < 0.5&&player.dm.inChTime < 0.5)) gain = new Decimal(0)
        return gain
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        mult = mult.mul(tmp.w.buyables[12].effect)
        mult = mult.times(hasUpgrade(this.layer,11)?3:1)
        mult = mult.times(hasUpgrade(this.layer,12)?4:1)
        mult = mult.times(hasUpgrade(this.layer,21)?upgradeEffect(this.layer,21):1)
        mult = mult.times(hasUpgrade(this.layer,24)?upgradeEffect(this.layer,24):1)
        mult = mult.times((hasMilestone("c",0)&&!inChallenge("dm",22))?3:1)
        mult = mult.div(player.c.ude)
        mult = mult.times((hasMilestone("c",2)&&!inChallenge("dm",22))?tmp.c.mwConvert:1)
        mult = mult.times((hasMilestone("c",4)&&!inChallenge("dm",22))?tmp.c.crystalsToWeakling:1)
        mult = mult.times((hasMilestone("c",5)&&!inChallenge("dm",22))?3:1)
        mult = mult.times(hasMilestone("c",44)?tmp.c.vcToWeakling:1)
        if(hasUpgrade(this.layer,31)) mult = mult.pow(1.2)
        if(hasUpgrade("c",55)) mult = mult.mul(tmp.c.effect)
        if(inChallenge("a",21)) mult = mult.pow(0.1)
        if(inChallenge("dm",21)) mult = mult.pow(2)
        if(hasUpgrade("c",62)) mult = mult.mul(tmp.c.csToWeakling)
        if((hasMilestone("dm",1)&&(inChallenge("dm",11)||inChallenge("dm",12)||inChallenge("dm",21)||inChallenge("dm",22)))||hasMilestone("dm",3)) mult = mult.mul(2e10)

        // DC4 exclusive
        if(inChallenge("dm",22)) {
            if(hasUpgrade(this.layer,62)) mult = mult.mul(upgradeEffect(this.layer,62))
            if(hasMilestone("c",4)) mult = mult.mul(tmp.c.crystalsToWeaklingDC22)
        }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        //{key: "w", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    doReset(resettingLayer) {
        let keep = []
        if(hasMilestone("c",41) && resettingLayer=="c") keep.push("upgrades")
        if(hasMilestone("a",0) && resettingLayer=="a") keep.push("upgrades")
        if(hasMilestone("dm",0) && resettingLayer=="dm") keep.push("upgrades")
        if(layers[resettingLayer].row > this.row) layerDataReset(this.layer,keep)
    },

    canReset: false,

    instantUnlockLayer() {
        if(player.points.gte(1)) player.w.unlocked = true
        return
    },

    deReq() {
        let req = new Decimal(3e10)
        let reqBase = req
        let factor = new Decimal(1.6)
        if(player.c.resetCount.gte(1)) req = req.mul(player.c.resetCount.add(1).pow(1.25))
        if(player.c.resetCount.gte(5)) {
            reqBase = reqBase.mul(Decimal.pow(5,1.25))
            req = reqBase.mul(factor.pow(player.c.resetCount.sub(4).max(0)))
        }
        if(hasMilestone("c",5)) req = req.div(tmp.c.resetsToDEReq)
        return req
    },

    effect() {
        let eff = new Decimal(1)
        let exponent = 0.5
        let weakling = player[this.layer].points
        if(hasUpgrade(this.layer,13)) exponent = 0.4
        if(hasUpgrade(this.layer,33)) exponent = 0.25
        if(inChallenge("dm",11)) exponent = 2
        eff = Decimal.max(weakling.pow(exponent).add(1),1)
        if(hasMilestone("c",20)) eff = eff.div(tmp.c.udNerfWeaklingEffect)
        if(hasMilestone("c",72)) eff = eff.mul(tmp.c.ecToWeaklingEffect)
        return eff
    },
    effectDescription() {
        let effText = "which are dividing Mentality gain by "+layerText("h2","w",format(this.effect()))+"."
        if(inChallenge("a",21)) effText = "which are multiplying Mentality gain by "+layerText("h2","w",format(this.effect()))+"."
        return effText
    },

    automate() {
       if(player.c.autoStrengthen) {
            layers.w.buyables[11].buyMax()
            layers.w.buyables[12].buyMax()
       }
    },

    update() {
        if(!player.w.unlocked) tmp.w.instantUnlockLayer
    },

    buyables: {
        11: {
            title: "Mentality Strengthen",
            baseCost() {
                let cost = new Decimal(10)
                if(hasUpgrade(this.layer,22)) cost = cost.div(upgradeEffect(this.layer,22))
                return cost
            },
            cost(x) {
                let base = this.baseCost()
                let scale = [new Decimal(5), new Decimal(15), new Decimal(7500)]
                let scaledCost = [
                    base.mul(scale[0].pow(x)),
                    base.mul(scale[0].pow(9)).mul(scale[1].pow(x.sub(9))),
                    base.mul(scale[0].pow(9)).mul(scale[1].pow(40)).mul(scale[2].pow(x.sub(49)))
                ]
                let consume = scaledCost[0]
                if(x.gte(10)&&x.lt(50)) consume = scaledCost[1]
                if(x.gte(50)) consume = scaledCost[2]
                return consume
            },
            effect(x) {
                let eff = new Decimal(1)
                let base = new Decimal(2)
                if(x.gte(0)) eff = Decimal.pow(base,x)
                if(hasUpgrade("c",14)) eff = base.add(upgradeEffect("c",14)).pow(x)
                return eff
            },
            canAfford() {return player.points.gte(this.cost())},
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!this.canAfford()) return
                if(!hasUpgrade("c",14)) player.points = player.points.sub(tmp.w.MSCostDifference)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(player.w.MSStatus.buyCount).sub(player.w.MSStatus.bought))
            },
            display() {
                let gainDesc = "Double the Mentality gain!\n"
                let baseGain = new Decimal(2)
                if (hasUpgrade("c",14)) gainDesc = "×"+format(baseGain.add(upgradeEffect("c",14)))+" Mentality gain!<br>"
                return gainDesc+
                "Currently: ×"+format(this.effect())+"<br>"+
                "("+formatWhole(getBuyableAmount("w",11))+" purchased)<br><br>"+
                "Cost: "+format(this.cost())+" Mentality"
            },
            unlocked() {return !inChallenge("dm",22)}
        },
        12: {
            title: "Weakling Strengthen",
            baseCost() {
                let cost = new Decimal(5)
                if(hasMilestone("c",21)) cost = cost.div(tmp.c.udNerfWSCost)
                if(hasUpgrade(this.layer,65)) cost = cost.div(upgradeEffect(this.layer,65))
                return cost
            },
            cost(x) {
                let base = this.baseCost()
                let scale = [new Decimal(3), new Decimal(6), new Decimal(12), new Decimal(2400)]
                let accel = new Decimal(1.5)
                let addedPow = x.sub(159).mul(x.sub(159).add(1)).div(2)
                let scaledCost = [
                    base.mul(scale[0].pow(x)),
                    base.mul(scale[0].pow(11)).mul(scale[1].pow(x.sub(11))),
                    base.mul(scale[0].pow(11)).mul(scale[1].pow(12)).mul(scale[2].pow(x.sub(23))),
                    base.mul(scale[0].pow(11)).mul(scale[1].pow(12)).mul(scale[2].pow(57)).mul(scale[3].pow(x.sub(80)))
                ]
                let consume = scaledCost[0]
                if(x.gte(12)&&x.lt(24)) consume = scaledCost[1]
                if(x.gte(24)&&x.lt(81)) consume = scaledCost[2]
                if(x.gte(81)&&x.lt(160)) consume = scaledCost[3]
                if(x.gte(160)) consume = scaledCost[3].mul(accel.pow(addedPow))
                return consume
            },
            addedBuys() {
                let buys = new Decimal(0)
                if(hasUpgrade("w",72)) buys = buys.add(upgradeEffect("w",72))
                if(hasMilestone("c",2)&&inChallenge("dm",22)) buys = buys.add(tmp.c.resetsToWSCount)
                return buys
            },
            effect(x) {
                let eff = new Decimal(1)
                let base = new Decimal(2)
                x = x.add(tmp.w.buyables[12].addedBuys)
                if(x.gte(0)) eff = Decimal.pow(base,x).round()
                if(hasUpgrade("c",34)) eff = base.add(upgradeEffect("c",34)).pow(x)
                if(hasUpgrade("w",73)) eff = base.add(upgradeEffect("w",73)).pow(x)
                return eff
            },
            canAfford() {return player[this.layer].points.gte(this.cost())},
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if(!this.canAfford()) return;
                if(!(hasMilestone("c",1)&&inChallenge("dm",22))&&!hasUpgrade("c",34)) player.w.points = player.w.points.sub(tmp.w.WSCostDifference)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(player.w.WSStatus.buyCount).sub(player.w.WSStatus.bought))
            },
            display() {
                let gainDesc = "Double the Weakling Dust gain!\n"
                let baseGain = new Decimal(2)
                let boughtText = "("+formatWhole(getBuyableAmount("w",12))+" purchased)<br><br>"
                if (inChallenge("dm",22)&&(hasUpgrade("w",72)||hasMilestone("c",2))) boughtText = "("+formatWhole(getBuyableAmount("w",12))+"+"+formatWhole(tmp.w.buyables[12].addedBuys)+" purchased)<br><br>"
                if (hasUpgrade("c",34)) gainDesc = "×"+format(baseGain.add(upgradeEffect("c",34)))+" Weakling Dust gain!<br>"
                if (hasUpgrade("w",73)) gainDesc = "×"+format(baseGain.add(upgradeEffect("w",73)))+" Weakling Dust gain!<br>"
                return gainDesc+
                "Currently: ×"+format(this.effect())+"<br>"+
                boughtText+
                "Cost: "+format(this.cost())+" Weakling Dust"
            }
        },
        14: {
            title: "Demonic Strengthen",
            baseCost() {
                let cost = new Decimal(50)
                return cost
            },
            cost(x) {
                let base = this.baseCost()
                let scale = [new Decimal(4), new Decimal(16)]
                let scaledCost = [
                    base.mul(scale[0].pow(x)),
                    base.mul(scale[0].pow(19)).mul(scale[1].pow(x.sub(19))),
                ]
                let consume = scaledCost[0]
                if(x.gte(20)) consume = scaledCost[1]
                return consume
            },
            effect(x) {
                let eff = new Decimal(1)
                let base = new Decimal(2)
                if(x.gte(0)) eff = Decimal.pow(base,x)
                return eff
            },
            canAfford() {return player.de.gte(this.cost())},
            buy() {
                player.de = player.de.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            display() {
                let gainDesc = "Double the Demonic Essence gain!\n"
                return gainDesc+
                "Currently: ×"+format(this.effect())+"<br>"+
                "("+formatWhole(getBuyableAmount("w",14))+" purchased)<br><br>"+
                "Cost: "+format(this.cost())+" Demonic Essence"
            },
            style: {'background'() {
                let colors = colorPalette("dc22")
                let color = colors[1]
	            if(tmp["w"].buyables[14].canAfford) color = colors[0]
                return color
            }},
            unlocked() {return inChallenge("dm",22)}
        },
    },

    upgrades: {
        11: {
            title: "Weakling UP",
            description: "Triple Weakling Dust gain.",
            cost: new Decimal(20),
            unlocked() {
                if(inChallenge("dm",11)) return (player.c.ud.gt(0))
                if(inChallenge("dm",22)) return false
                if(hasMilestone("c",41)) return true
                return (player[this.layer].buyables[12].gte(2))
            }
        },
        12: {
            title: "Weakling UP II",
            description: "Quadruple Weakling Dust gain.",
            cost: new Decimal(200),
            unlocked() {return (hasUpgrade(this.layer,11))}
        },
        13: {
            title: "Alleviate",
            description: "Decrease the base division exponent of Weakling Dust effect.<br>(^0.5 → ^0.4)",
            cost: new Decimal(1000),
            unlocked() {return (hasUpgrade(this.layer,12))}
        },
        14: {
            title: "Mega Buff",
            description: "Quintuples (5x) Mentality gain.",
            cost: new Decimal(2500),
            unlocked() {return (hasUpgrade(this.layer,13))}
        },
        15: {
            title: "Contradiction",
            description: "Boosts Mentality based on Weakling Dust.",
            cost: new Decimal(10000),
            tooltip: "Wait something doesn't seem right-",
            effect() {
                let eff = new Decimal(1)
                if (player[this.layer].points.gte(1)) eff = Decimal.log10(player[this.layer].points).mul(3).add(1)
                return eff
            },
            effectDisplay() {
                return format(this.effect())+"×"
            },
            unlocked() {return (hasUpgrade(this.layer,14))}
        },
        21: {
            title: "Weakling UP III",
            description: "Boosts Weakling Dust based on Mentality.",
            cost: new Decimal(25000),
            base() {
                let base = player.points.add(1).sqrt()
                return base
            },
            effect() {
                let eff = tmp.w.upgrades[21].base
                let sftcap = new Decimal(1000)
                if (eff.gte(sftcap)) eff = eff.div(sftcap).pow(0.6).mul(sftcap)
                return eff
            },
            effectDisplay() {
                if (tmp.w.upgrades[21].effect.gte(1000)) return format(this.effect())+"× (softcapped)"
                return format(this.effect())+"×"
            },
            unlocked() {return (hasUpgrade(this.layer,15))}
        },
        22: {
            title: "Total Reduction",
            description: "Divide the cost of <b>Mentality Strengthen</b> based on Weakling Dust.",
            cost: new Decimal(100000),
            effect() {
                return player[this.layer].points.pow(0.2).div(3.3).add(1)
            },
            effectDisplay() {
                return "/"+format(this.effect())
            },
            unlocked() {return (hasUpgrade(this.layer,21))}
        },
        23: {
            title: "Self-Synergy",
            description: "Mentality boost itself.",
            cost: new Decimal(500000),
            base() {
                let base = player.points.add(1).pow(0.6).div(4).add(1)
                return base
            },
            effect() {
                let eff = tmp.w.upgrades[23].base
                let sftcap = new Decimal(100)
                if (eff.gte(sftcap)) eff = eff.div(sftcap).pow(0.6).mul(sftcap)
                return eff
            },
            effectDisplay() {
                if (tmp.w.upgrades[23].effect.gte(100)) return format(this.effect())+"× (softcapped)"
                return format(this.effect())+"×"
            },
            unlocked() {return (hasUpgrade(this.layer,22))}
        },
        24: {
            title: "Powerful Weakling",
            description: "Weakling Dust boosts itself.",
            cost: new Decimal(1000000),
            base() {
                let base = player[this.layer].points.pow(0.4).div(8).add(1)
                return base
            },
            effect() {
                let eff = tmp.w.upgrades[24].base
                let sftcap = new Decimal(10000)
                let sftcap2 = new Decimal(1e69)
                if (hasUpgrade("w",34)) sftcap = new Decimal(1e9)
                if (eff.gte(sftcap)) eff = eff.div(sftcap).pow(0.5).mul(sftcap)
                if (eff.gte(sftcap2)) eff = eff.div(sftcap2).pow(0.2).mul(sftcap2)
                return eff
            },
            effectDisplay() {
                let eff = tmp.w.upgrades[24].effect
                let sftcap = new Decimal(10000)
                let sftcap2 = new Decimal(1e69)
                if (hasUpgrade("w",34)) sftcap = new Decimal(1e9)
                if (eff.gte(sftcap) && eff.lt(sftcap2)) return format(this.effect())+"× (softcapped)"
                if (eff.gte(sftcap2)) return format(this.effect())+"× (softcapped^2)"
                return format(this.effect())+"×"
            },
            unlocked() {return (hasUpgrade(this.layer,23))}
        },
        25: {
            title: "Crystalize",
            description() {
                if(hasUpgrade("c",53)) {
                    return "Weakling Dust boosts the gain of Crystals at a greatly reduced rate.<br>"+
                    "Currently: "+format(this.effect())+"×"
                }
                return "Unlocks the next layer."
            },
            effect() {
                let eff = new Decimal(1)
                if(hasUpgrade("c",53)) eff = player.w.points.pow(0.05).div(1.2).max(1)
                return eff
            },
            cost: new Decimal(3e9),
            unlocked() {return (hasUpgrade(this.layer,24))}
        },
        31: {
            title: "Weakling Up IV",
            description: "Weakling Dust gain ^1.2.",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(1e24)
            },
            unlocked() {return (hasMilestone("c",25)||inChallenge("dm",21))&&!inChallenge("dm",22)}
        },
        32: {
            title: "Real Weakening",
            description: "Weakling Dust divides the first Unstable Dust effect.",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(1e30)
            },
            effect() {
                let eff = player.w.points.pow(0.125).div(1.5).max(1)
                return eff
            },
            effectDisplay() {
                return "/"+format(this.effect())
            },
            unlocked() {return (hasUpgrade("w",31)||inChallenge("dm",21))}
        },
        33: {
            title: "Alleviate II",
            description: "Decrease the base division exponent of Weakling Dust effect.<br>(^0.4 → ^0.25)",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(1e40)
            },
            unlocked() {return (hasUpgrade("w",32)||inChallenge("dm",21))}
        },
        34: {
            title: "Powerful Weakling II",
            description: "Delays the softcap of <b>Powerful Weakling</b>.<br>(softcap start: "+format(1e4)+" -> "+format(1e9)+")",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(1e51)
            },
            unlocked() {return (hasUpgrade("w",33)||inChallenge("dm",21))}
        },
        35: {
            title: "Duality",
            description: "Enhances the effect of <b>Benediction</b> and <b>Imprecation</b> to twice of their original amount.",
            tooltip: "You can rest for a while after this upgrade~",
            cost() {
                if(inChallenge("dm",21)) return new Decimal("9.99e9,999")
                return new Decimal(1e57)
            },
            unlocked() {return (hasUpgrade("w",34)||inChallenge("dm",21))}
        },
        61: {
            title: "Awakening Call",
            description: "Reclaim the generation of Weakling Dust.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(400),
            style: {'background'() {return upgradeButtonStyle("dc22","w",61)}},
            unlocked() {return (inChallenge("dm",22)&&(getBuyableAmount("w",14).gte(2))||player.c.resetCount.gt(0))}
        },
        62: {
            title: "Sigma Resonance",
            description: "Demonic Essence boosts Weakling Dust directly.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(450),
            effect() {
                return player.de.add(1)
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("dc22","w",62)}},
            unlocked() {return hasUpgrade(this.layer,61)}
        },
        63: {
            title: "A Weak Respond",
            description: "Weakling Dust slightly boosts Demonic Essence.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(500),
            effect() {
                let eff = player.w.points.max(1).log10().pow(0.2).max(1)
                if(hasUpgrade("w",71)) eff = eff.mul(3)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("dc22","w",63)}},
            unlocked() {return hasUpgrade(this.layer,62)}
        },
        64: {
            title: "Instability Demon",
            description: "Boosts Demonic Essence based on Unstable Dust.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(1200),
            effect() {
                return player.c.ud.max(1).log10().pow(0.75).max(1)
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("dc22","w",64)}},
            unlocked() {return (inChallenge("dm",22)&&getBuyableAmount("w",14).gte(3))}
        },
        65: {
            title: "Bargaining",
            description: "Decrease the price of <i>Weakling Strengthen</i> based on Demonic Essence.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(20000),
            effect() {
                return player.de.max(1).pow(0.5).max(1)
            },
            effectDisplay() {
                return "/"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("dc22","w",65)}},
            unlocked() {return (inChallenge("dm",22)&&getBuyableAmount("w",14).gte(5))}
        },
        66: {
            title: "Wealth",
            description: "Each purchase of <i>Weakling Strengthen</i> provides a boost for Demonic Essence.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(20000),
            effect() {
                let WScount = getBuyableAmount("w",12)
                if(hasUpgrade(this.layer,72)) WScount = WScount.add(upgradeEffect(this.layer,72))
                let eff = WScount.pow(0.5).max(1)
                if(hasUpgrade(this.layer,74)) eff = Decimal.pow(1.0625,WScount)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("dc22","w",66)}},
            unlocked() {return hasUpgrade(this.layer,65)}
        },
        71: {
            title: "OP of Weak",
            description: "Significantly increase the effect of <i>A Weak Respond</i>.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            tooltip: "OP = opposite :)",
            effect() {
                let eff = new Decimal(3)
                return eff
            },
            effectDisplay() {
                return "×"+formatWhole(this.effect())
            },
            cost: new Decimal(2000000),
            style: {'background'() {return upgradeButtonStyle("dc22","w",71)}},
            unlocked() {return (player.ae.gt(0))}
        },
        72: {
            title: "Decay",
            description() {
                let desc = "For every upgrade purchased after this, 2 free <i>Weakling Strengthen</i> will be added."
                if(hasUpgrade(this.layer,76)) desc = "For every upgrade purchased after this, 4 free <i>Weakling Strengthen</i> will be added."
                return desc
            },
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            effect() {
                let eff = new Decimal(2)
                eff = eff.mul(getUpgCount("w",72,76))
                if(hasUpgrade(this.layer,76)) eff = eff.mul(2)
                return eff
            },
            effectDisplay() {
                return "+"+formatWhole(this.effect())
            },
            cost: new Decimal(12000000),
            style: {'background'() {return upgradeButtonStyle("dc22","w",72)}},
            unlocked() {return (inChallenge("dm",22)&&getBuyableAmount("w",14).gte(10))}
        },
        73: {
            title: "Gray Shift",
            description() {
                let desc = "For every upgrade purchased in this tab, The effect of <i>Weakling Strengthen</i> is increased by 0.02 per level."
                if(hasUpgrade(this.layer,76)) desc = "For every upgrade purchased in this tab, The effect of <i>Weakling Strengthen</i> is increased by 0.04 per level."
                return desc
            },
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            effect() {
                let eff = new Decimal(0.02)
                eff = eff.mul(getUpgCount("w",61,76))
                if(hasUpgrade(this.layer,76)) eff = eff.mul(2)
                return eff
            },
            effectDisplay() {
                return "+"+formatWhole(this.effect())
            },
            cost: new Decimal(14000000),
            style: {'background'() {return upgradeButtonStyle("dc22","w",73)}},
            unlocked() {return hasUpgrade(this.layer,72)}
        },
        74: {
            title: "Enrichment",
            description: "Change the formula for <i>Wealth</i>.<br>(x^0.5 → 1.0625^x)",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(16000000),
            style: {'background'() {return upgradeButtonStyle("dc22","w",74)}},
            unlocked() {return hasUpgrade(this.layer,73)}
        },
        75: {
            title: "Ground Zero",
            description: "Drastically improve the effect of the first Unstable Dust milestone.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(1e8),
            effect() {
                let eff = new Decimal(4)
                return eff
            },
            effectDisplay() {
                return "^"+formatWhole(this.effect())
            },
            style: {'background'() {return upgradeButtonStyle("dc22","w",75)}},
            unlocked() {return (inChallenge("dm",22)&&getBuyableAmount("w",14).gte(11))}
        },
        76: {
            title: "Stereo",
            description: "The effects of <i>Decay</i> and <i>Gray Shift</i> are doubled.",
            currencyDisplayName: "Demonic Essence",
            currencyInternalName: "de",
            cost: new Decimal(3.5e8),
            style: {'background'() {return upgradeButtonStyle("dc22","w",76)}},
            unlocked() {return (inChallenge("dm",22)&&getBuyableAmount("w",14).gte(12))}
        },
    },
    clickables: {
        11: {
            title() {
                let csBaseGain = (player.w.points.gte(Decimal.pow(8,52.5))?player.w.points.div(Decimal.pow(8,52.5)).pow(0.021):new Decimal(0))
                let csTotalGain = csBaseGain.mul(tmp.c.gainMult).floor()
                return "<h2>Sacrifice everything for +"+formatWhole(csTotalGain)+" Crystal Shard"+(csTotalGain.eq(1)?"":"s")+"</h2>"
            },
            display() {
                if(hasMilestone("c",7)) return ""
                return "<h3>Requires "+format(tmp.w.deReq)+" Demonic Essence</h3><br>More infos in the prestige button of Crystal Shards"
            },
            onClick() {
                let csBaseGain = (player.w.points.gte(Decimal.pow(8,52.5))?player.w.points.div(Decimal.pow(8,52.5)).pow(0.021):new Decimal(0))
                let csTotalGain = csBaseGain.mul(tmp.c.gainMult).floor()
                player.c.points = player.c.points.add(csTotalGain)
                player.c.resetCount = player.c.resetCount.add(1)
                layerDataReset("w",[])
                player.de = new Decimal(0)
                player.ae = new Decimal(0)
            },
            canClick() {
                if(hasMilestone("c",7)) return player.w.points.gte(Decimal.pow(8,52.5))
                return (player.w.points.gte(Decimal.pow(8,52.5))&&player.de.gte(tmp.w.deReq))
            },
            unlocked() {return player.w.points.gte(1e45)&&inChallenge("dm",22)},
            style: {'width': '500px', 'height': '150px','background'() {
                let colors = colorPalette("dc22")
                let color = colors[1]
	            if(tmp["w"].clickables[11].canClick) color = colors[0]
                return color
            }},
        }
    }
}) // Weaklings
