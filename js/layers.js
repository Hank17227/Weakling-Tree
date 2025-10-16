addLayer("w", {
    tabFormat: [
        ["infobox","introBox"],
        "resource-display",
        "blank",
        "buyables",
        "blank",
        "blank",
        "main-display",
        //"prestige-button",
        "upgrades"
    ],
    name: "Weaklings", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    infoboxes: {
        introBox: {
            title: "Welcome!",
            body() {
                let lastBuyableCost = tmp[this.layer].buyables[11].cost.div(5)
                let pointsRatio = player.points.div(lastBuyableCost)
                return "Welcome to the Weakling Tree! In here, you start off very weak but eventually becomes stronger"+
                " as you get more upgrades!<br><br>"+
                "Now, you'll have to wait until you get 1 Point, which will enable you to gain <b>Weakling Dust</b> automatically,"+
                " and you can start from there.<br>"
                /*+"Last Buyable Cost: "+format(lastBuyableCost)+
                "<br>Points / Best Points: "+format(pointsRatio)+
                "<br>WD exp. Decay Effect: "+format(decay(pointsRatio))*/
            }
        }
    },
    color: "#7a7a79ff",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Weakling Dust", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0, // Prestige currency exponent
    passiveGeneration() {
        let gain = new Decimal(0.1)
        gain = gain.times(tmp[this.layer].buyables[12].effect)
        gain = gain.times(hasUpgrade(this.layer,11)?3:1)
        gain = gain.times(hasUpgrade(this.layer,12)?4:1)
        gain = gain.times(hasUpgrade(this.layer,21)?upgradeEffect(this.layer,21):1)
        gain = gain.times(hasUpgrade(this.layer,24)?upgradeEffect(this.layer,24):1)
        gain = gain.times(hasMilestone("c",0)?3:1)
        gain = gain.div(player.c.ude)
        gain = gain.times(hasMilestone("c",2)?tmp.c.psConvert:1)
        return gain
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
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

    effect() {
        let eff = 1
        let exponent = 0.5
        let weakling = player[this.layer].points
        let lastBuyableCost = tmp[this.layer].buyables[11].cost.div(5)
        let pointsRatio = player.points.div(lastBuyableCost)
        if(hasUpgrade(this.layer,13)) exponent = 0.4
        if(weakling.gt(0)) eff = Decimal.pow(weakling,exponent).add(1).pow((!hasMilestone("c",3)?decay(pointsRatio):decay(pointsRatio).pow(2)))
        return eff
    },
    effectDescription() {
        return "which are dividing Points gain by <b>"+format(this.effect())+"</b>."
    },

    update() {
        player.devSpeed = new Decimal(1)
    },

    buyables: {
        11: {
            title: "Points Strengthen",
            baseCost() {
                let cost = new Decimal(10)
                if(hasUpgrade(this.layer,22)) cost = cost.div(upgradeEffect(this.layer,22))
                return cost
            },
            cost(x) {
                let consume = new Decimal(this.baseCost()).mul(new Decimal(5).pow(x))
                return consume
            },
            effect(x) {
                let eff = 1
                if(x.gte(0)) eff = Decimal.pow(2,x)
                return eff
            },
            canAfford() {return player.points.gte(this.cost())},
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            display() {return "Double the Points gain!\n"+
                "Currently: "+format(this.effect())+"×\n\n"+
                "Cost: "+format(this.cost())+" Points"
            }
        },
        12: {
            title: "Weakling Strengthen",
            cost(x) {
                let beforeScaleCost = new Decimal(5).mul(new Decimal(3).pow(11))
                if(x.gte(12)) return beforeScaleCost.mul(new Decimal(6).pow(x.sub(11)))
                else return new Decimal(5).mul(new Decimal(3).pow(x))
            },
            effect(x) {
                let eff = 1
                if(x.gte(0)) eff = Decimal.pow(2,x)
                return eff
            },
            canAfford() {return player[this.layer].points.gte(this.cost())},
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            display() {return "Double the Weakling Dust gain!\n"+
                "Currently: "+format(this.effect())+"×\n\n"+
                "Cost: "+format(this.cost())+" Weakling Dust"
            }
        }
    },

    upgrades: {
        11: {
            title: "Weakling UP",
            description: "Triple Weakling Dust gain.",
            cost: new Decimal(20),
            unlocked() {return (player[this.layer].buyables[12].gte(2))}
        },
        12: {
            title: "Weakling UP II",
            description: "Quadruple Weakling Dust gain.",
            cost: new Decimal(200),
            unlocked() {return (hasUpgrade(this.layer,11))}
        },
        13: {
            title: "Alleviate",
            description: "Decrease the division amount from Weakling Dust.<br>(^0.5 → ^0.4)",
            cost: new Decimal(1000),
            unlocked() {return (hasUpgrade(this.layer,12))}
        },
        14: {
            title: "Mega Buff",
            description: "Quintuples (5x) points gain.",
            cost: new Decimal(2500),
            unlocked() {return (hasUpgrade(this.layer,13))}
        },
        15: {
            title: "Contradiction",
            description: "Boosts points based on Weakling Dust.",
            cost: new Decimal(10000),
            tooltip: "Wait something doesn't seem right-",
            effect() {
                return Decimal.log10(player[this.layer].points).mul(3)
            },
            effectDisplay() {
                return format(this.effect())+"×"
            },
            unlocked() {return (hasUpgrade(this.layer,14))}
        },
        21: {
            title: "Weakling UP III",
            description: "Boosts Weakling Dust based on points.",
            cost: new Decimal(25000),
            effect() {
                return player.points.add(1).sqrt()
            },
            effectDisplay() {
                return format(this.effect())+"×"
            },
            unlocked() {return (hasUpgrade(this.layer,15))}
        },
        22: {
            title: "Total Reduction",
            description: "Divide the cost of <b>Points Strengthen</b> based on Weakling Dust.",
            cost: new Decimal(100000),
            effect() {
                return player[this.layer].points.pow(0.2).div(3.3)
            },
            effectDisplay() {
                return format(this.effect())+"×"
            },
            unlocked() {return (hasUpgrade(this.layer,21))}
        },
        23: {
            title: "Self-Synergy",
            description: "Points boost itself.",
            cost: new Decimal(500000),
            effect() {
                return player.points.add(1).pow(0.6).div(3)
            },
            effectDisplay() {
                return format(this.effect())+"×"
            },
            unlocked() {return (hasUpgrade(this.layer,22))}
        },
        24: {
            title: "Powerful Weakling",
            description: "Weakling Dust boosts itself.",
            cost: new Decimal(1000000),
            effect() {
                return player[this.layer].points.pow(0.4).div(8)
            },
            effectDisplay() {
                return format(this.effect())+"×"
            },
            unlocked() {return (hasUpgrade(this.layer,23))}
        },
        25: {
            title: "Crystalize",
            description: "Unlocks the next layer.",
            cost: new Decimal(3e9),
            unlocked() {return (hasUpgrade(this.layer,24))}
        },
        31: {
            title: "???",
            description: "???",
            cost: new Decimal(1e17),
            unlocked() {return (hasUpgrade(this.layer,25)&&hasMilestone("c",4))}
        },
    }
}) // Weaklings

addLayer("c", {
    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        ["display-text",
            function() {return "You have <b>"+format(player.c.ud)+"</b> Unstable Dust, "+
            "which are dividing Weakling Dust gain by <b>"+format(player.c.ude)+"</b>.<br>"+
            "You are gaining "+format(player.c.udg)+" Unstable Dust per second."
        }],
        "blank",
        "milestones"
    ],
    name: "Crystals", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        ud: new Decimal(0), // Unstable Dust (UD)
	    udg: new Decimal(0), // UD gain
	    ude: new Decimal(1) // UD effect
    }},
    color: "#d11f1fff",
    requires: new Decimal(2e10), // Can be a function that takes requirement increases into account
    resource: "Crystals", // Name of prestige currency
    baseResource: "Weakling Dust", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base: 5.75,
    exponent: 1.25, // Prestige currency exponent

    passiveGeneration() {
        let gain = new Decimal(0)
        return gain
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    udBase() {
        return player.w.points.gte(2e10)?player.w.points.div(2e10):new Decimal(0)
    },

    udGain() {
        return Decimal.pow(tmp.c.udBase, 0.5).div(10)
    },

    udEffect() {
        let eff = player.c.ud.add(1).pow(0.5)
        return eff
    },

    udGainMult() {
        let mult = new Decimal(1)
        return mult
    },

    psConvert() {
        let mult = getBuyableAmount("w",11).add(1).pow(1.2)
        return mult
    },

    update(diff) {
        if(!hasMilestone(this.layer,0)) return
        player.c.ud = player.c.ud.add(tmp.c.udGain.times(diff))
        player.c.ude = tmp.c.udEffect
        player.c.udg = tmp.c.udGain
    },

    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Condense into Crystals", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("w", 25)||hasMilestone(this.layer,0)},

    doReset(resettingLayer) {
        player.c.ud = new Decimal(0)
    },

    milestones: {
        0: {
            requirementDescription: "1 Crystal",
            effectDescription: "×3 Weakling Dust gain.",
            done() {return player.c.points.gte(1)}
        },
        1: {
            requirementDescription: "2 Crystals",
            effectDescription: "×10 Points gain.",
            done() {return player.c.points.gte(2)}
        },
        2: {
            requirementDescription: "3 Crystals",
            effectDescription() {
                return "<b>Points Strengthen</b> boosts Weakling Dust gain.<br>"+
                "Currently: ×"+format(tmp.c.psConvert)+"."
            },
            done() {return player.c.points.gte(3)}
        },
        3: {
            requirementDescription: "4 Crystals",
            effectDescription: "×10 Points gain, again.",
            done() {return player.c.points.gte(4)},
            unlocked() {return hasMilestone(this.layer, 2)}
        },
        4: {
            requirementDescription: "5 Crystals",
            effectDescription: "Unlocks a new row of upgrades on Weakling.",
            done() {return player.c.points.gte(5)},
            unlocked() {return hasMilestone(this.layer, 3)}
        },
    }


})