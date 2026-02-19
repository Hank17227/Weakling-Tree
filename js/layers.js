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
    requires() {
        if (player.w.points.gt(0)) return new Decimal(0)
        else return new Decimal(1)
    }, // Can be a function that takes requirement increases into account
    resource: "Weakling Dust", // Name of prestige currency
    baseResource: "Mentality", // Name of resource prestige is based on
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
        gain = gain.times(hasMilestone("c",2)?tmp.c.mwConvert:1)
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
        let eff = new Decimal(1)
        let exponent = 0.5
        let weakling = player[this.layer].points
        //let lastBuyableCost = tmp[this.layer].buyables[11].cost.div(5)
        //let pointsRatio = player.points.div(lastBuyableCost)
        //let growthRate = new Decimal(0.01)
        //growthRate = growthRate.pow(decay(pointsRatio))
        if(hasUpgrade(this.layer,13)) exponent = 0.4
        if(weakling.gt(0)) eff = Decimal.max(weakling.pow(exponent).add(1),1)
        if(hasMilestone("c",4)) eff = eff.div(tmp.c.udNerfWeaklingEffect)
        return eff
    },
    effectDescription() {
        return "which are dividing Mentality gain by <b>"+format(this.effect())+"</b>."
    },

    update() {
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
            display() {return "Double the Mentality gain!\n"+
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
                return Decimal.log10(player[this.layer].points).mul(3)
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
            description: "Mentality boost itself.",
            cost: new Decimal(500000),
            effect() {
                return player.points.add(1).pow(0.6).div(4).add(1)
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
        /*
        31: {
            title: "???",
            description: "???",
            cost: new Decimal(1e17),
            unlocked() {return (hasUpgrade(this.layer,25)&&hasMilestone("c",4))}
        },*/
    }
}) // Weaklings

addLayer("c", {
    tabFormat: {
        Instability: {
            content:[["infobox","introBox"],
            "main-display",
            "prestige-button",
            "blank",
            ["display-text",
                function() {
                return "You have <b>"+format(player.c.ud)+"</b> Unstable Dust, "+
                "which are dividing <b style=\"color: #7a7a79ff;\">Weakling Dust</b> gain by "+format(player.c.ude)
                //"Projected chance for <b style=\"color: #d937faff;\">Evil Crystal</b>: "+format(one.sub(nonEvil))+"%.<br>"+
                //"Projected chance for Non-Evil Crystal: "+format(nonEvil)+"%."
            }],
            ["blank","10px"],
            ["display-text", function() {
                return "You have <b style=\"color: #7a7a79ff;\">"+format(player.w.points)+"</b> Weakling Dust."+
                " (+"+format(tmp.w.passiveGeneration)+"/s)"
            }],
            "blank",
            "milestones"
            ]
        },
        Fusion: {
            content: ["main-display"]
        }
    },
    name: "Crystals", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    infoboxes: {
        introBox: {
            title: "Crystals",
            body() {
                return "Welcome to the 2nd Mechanic, Crystals! In here, you can condense your Weakling Dusts into some Crystal Shards."+
                " By combining 10 Crystal Shards, you'll have a full crystal!<br><br>"+
                "You can also combine multiple of them at once, but be careful when doing so, you might end up creating <b style=\"color: #d937faff;\">Evil Crystals</b> instead,"+
                " in which it will harm your progress in various ways.<br>"
            }
        }
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        ud: new Decimal(0), // Unstable Dust (UD)
        ude: new Decimal(0), // UD Effect
        nec1: new Decimal(0), // Non-Evil Crystal Effect 1: Points Gain mult
        nec2: new Decimal(0), // Non-Evil Crystal Effect 2: Weakling Dusts Gain mult
        nec3: new Decimal(0), // Non-Evil Crystal Effect 3: Weakling Dust Buyable Cost Reduction
        ec1: new Decimal(0), // Evil Crystal Effect 1: Weakling Dusts effect strengthen
        ec2: new Decimal(0), // Evil Crystal Effect 2: Weakling Dusts Gain div
        ec3: new Decimal(0) // Evil Crystal Effect 3: Non Evil Crystal decrement
    }},
    color: "#d11f1fff",
    requires: new Decimal(2e10), // Can be a function that takes requirement increases into account
    resource: "Crystal Shards", // Name of prestige currency
    baseResource: "Weakling Dust", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.07, // Prestige currency exponent

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

    nonEvilCrystalChance() {
        let projectedCrystals = Decimal.round(Decimal.pow(player.w.points.div("2e10"),Decimal.div(1,3)))
        return Decimal.pow(0.75,projectedCrystals.sub(1))
    },

    udBase() {
        return player.w.points.gte(2e10)?player.w.points.div(2e10).sub(1):new Decimal(0)
    },

    udEffect() {
        let eff = player.c.ud.add(1).pow(0.5)
        return eff
    },

    udGainMult() {
        let mult = new Decimal(1)
        return mult
    },

    mwConvert() {
        let mult = getBuyableAmount("w",11).add(1).pow(1.2)
        return mult
    },

    wmConvert() {
        let mult = Decimal.log10(player.w.points.add(1)).add(1)
        return mult
    },

    udNerfWeaklingEffect() {
        let mult = player.c.ud.pow(0.2).mul(3.3).add(1)
        return mult
    },

    update(diff) {
        player.c.ude = tmp.c.udEffect
        player.c.ud = tmp.c.udBase
        
    },

    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Condense into Crystal Shards", 
        onPress(){
            if (canReset(this.layer)) doReset(this.layer)
        }},
    ],
    layerShown(){return hasUpgrade("w", 25)||player.c.points.gt(0)},

    doReset(resettingLayer) {
        player.c.ud = new Decimal(0)
    },

    
    milestones: {
        0: {
            requirementDescription: "1 Crystal Shard",
            effectDescription: "Triples Weakling Dust gain.",
            done() {return player.c.points.gte(1)}
        },
        1: {
            requirementDescription: "2 Crystal Shards",
            effectDescription: "Quadruples Mentality gain.",
            done() {return player.c.points.gte(2)}
        },
        2: {
            requirementDescription: "3 Crystal Shards",
            effectDescription() {
                return "<b>Points Strengthen</b> boosts Weakling Dust gain.<br>"+
                "Currently: ×"+format(tmp.c.mwConvert)+"."
            },
            done() {return player.c.points.gte(3)}
        },
        3: {
            requirementDescription: "4 Crystal Shards",
            effectDescription: "Triples Mentality gain.",
            done() {return player.c.points.gte(4)},
        },
        4: {
            requirementDescription: "100 Unstable Dust",
            effectDescription() {
                return "Alleviates the Weakling Dust effect based on Unstable Dust.<br>"+
                "Currently: /"+format(tmp.c.udNerfWeaklingEffect)+"."
            },
            done() {return player.c.ud.gte(100)},
        },
        5: {
            requirementDescription: "7 Crystal Shards",
            effectDescription() {
                return "Boost Mentality based on Weakling Dusts.<br>"+
                "Currently: ×"+format(tmp.c.wmConvert)+"."
            },
            done() {return player.c.points.gte(5)},
        },
        /*
        ?: {
            requirementDescription: "5 Crystals",
            effectDescription: "Unlocks a new row of upgrades on Weakling.",
            done() {return player.c.points.gte(5)},
            unlocked() {return hasMilestone(this.layer, 3)}
        },*/
    }
    


})

addLayer("d", {
    name: "Dev Zone", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: "side", // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    color: "#ffffffff",
    resource: ":)",
    tabFormat: [["display-text", "Welcome to the Dev Center! In here, you can fiddle with some settings regarding the game!"],
    "blank",
    "clickables"
    ],
    startData() {return {
        unlocked: true
        }
    },
    update(diff) {
        player.devSpeed = tmp.d.speedCalc
    },
    speedCalc() {
        let speed = new Decimal(1)
        if(getClickableState("d",11)) speed = new Decimal(0)
        if(getClickableState("d",12)) speed = new Decimal(10)
        if(getClickableState("d",13)) speed = new Decimal(100)
        return speed
    },
    clickables: {
        11: {
            title: "Pause",
            display: "Pause the game. Click it again to resume.",
            onClick() {
                if(getClickableState("d",11)==1) setClickableState("d",11,0)
                else setClickableState("d",11,1)
            },
            canClick() {
                if (getClickableState("d",12)==1 || getClickableState("d",13)==1) return false
                else return true
            },
            unlocked: true
        },
        12: {
            title: "10x speed",
            display: "Gives 10x Dev Speed.",
            onClick() {
                if(getClickableState("d",12)==1) setClickableState("d",12,0)
                else {
                    setClickableState("d",12,1)
                }
            },
            canClick() {
                if (getClickableState("d",11)==1 || getClickableState("d",13)==1) return false
                else return true
            },
            unlocked: true
        },
        13: {
            title: "100x speed",
            display: "Gives 100x Dev Speed.",
            onClick() {
                if(getClickableState("d",13)==1) setClickableState("d",13,0)
                else setClickableState("d",13,1)
            },
            canClick() {
                if (getClickableState("d",11)==1 || getClickableState("d",12)==1) return false
                else return true
            },
            unlocked: true
        }
    }
})