addLayer("w", {
    tabFormat: [
        ["infobox","introBox"],
        "blank",
        "buyables",
        "blank",
        "blank",
        "main-display",
        "resource-display",
        ["display-text", function() {return ""}],
        //"prestige-button",
        "upgrades"
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
            scaleStart: [new Decimal(12), new Decimal(24), new Decimal(81)],
            scaledFactor: [new Decimal(6), new Decimal(12), new Decimal(2400)],
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
            title: "Welcome!",
            body() {
                let lastBuyableCost = tmp[this.layer].buyables[11].cost.div(5)
                let pointsRatio = player.points.div(lastBuyableCost)
                return "Welcome to the Weakling Tree! In here, you start off very weak but eventually becomes stronger"+
                " as you get more upgrades!<br><br>"+
                "Now, you'll have to wait until you get 1 Mentality, which will enable you to gain <b>Weakling Dust</b> automatically,"+
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
        if(inChallenge("a",11)) gain = new Decimal(0)
        return gain
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        mult = mult.mul(tmp.w.buyables[12].effect)
        mult = mult.times(hasUpgrade(this.layer,11)?3:1)
        mult = mult.times(hasUpgrade(this.layer,12)?4:1)
        mult = mult.times(hasUpgrade(this.layer,21)?upgradeEffect(this.layer,21):1)
        mult = mult.times(hasUpgrade(this.layer,24)?upgradeEffect(this.layer,24):1)
        mult = mult.times(hasMilestone("c",0)?3:1)
        mult = mult.div(player.c.ude)
        mult = mult.times(hasMilestone("c",2)?tmp.c.mwConvert:1)
        mult = mult.times(hasMilestone("c",4)?tmp.c.crystalsToWeakling:1)
        mult = mult.times(hasMilestone("c",5)?3:1)
        mult = mult.times(hasMilestone("c",44)?tmp.c.vcToWeakling:1)
        if(hasUpgrade(this.layer,31)) mult = mult.pow(1.2)
        if(hasUpgrade("c",55)) mult = mult.mul(tmp.c.effect)
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
        return "which are dividing Mentality gain by "+layerText("h2","w",format(this.effect()))+"."
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
                "Currently: "+format(this.effect())+"×\n\n"+
                "Cost: "+format(this.cost())+" Mentality"
            }
        },
        12: {
            title: "Weakling Strengthen",
            baseCost() {
                let cost = new Decimal(5)
                if(hasMilestone("c",21)) cost = cost.div(tmp.c.udNerfWSCost)
                return cost
            },
            cost(x) {
                let base = this.baseCost()
                let scale = [new Decimal(3), new Decimal(6), new Decimal(12), new Decimal(2400)]
                let scaledCost = [
                    base.mul(scale[0].pow(x)),
                    base.mul(scale[0].pow(11)).mul(scale[1].pow(x.sub(11))),
                    base.mul(scale[0].pow(11)).mul(scale[1].pow(12)).mul(scale[2].pow(x.sub(23))),
                    base.mul(scale[0].pow(11)).mul(scale[1].pow(12)).mul(scale[2].pow(57)).mul(scale[3].pow(x.sub(80))),
                ]
                let consume = scaledCost[0]
                if(x.gte(12)&&x.lt(24)) consume = scaledCost[1]
                if(x.gte(24)&&x.lt(81)) consume = scaledCost[2]
                if(x.gte(81)) consume = scaledCost[3]
                return consume
            },
            effect(x) {
                let eff = new Decimal(1)
                let base = new Decimal(2)
                if(x.gte(0)) eff = Decimal.pow(base,x).round()
                if(hasUpgrade("c",34)) eff = base.add(upgradeEffect("c",34)).pow(x)
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
                if(!hasUpgrade("c",34)) player.w.points = player.w.points.sub(tmp.w.WSCostDifference)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(player.w.WSStatus.buyCount).sub(player.w.WSStatus.bought))
            },
            display() {
                let gainDesc = "Double the Weakling Dust gain!\n"
                let baseGain = new Decimal(2)
                if (hasUpgrade("c",34)) gainDesc = "×"+format(baseGain.add(upgradeEffect("c",34)))+" Weakling Dust gain!<br>"
                return gainDesc+
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
            unlocked() {
                if(inChallenge("dm",11)) return (player.c.ud.gt(0))
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
            description: "Divide the cost of <b>Points Strengthen</b> based on Weakling Dust.",
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
                if (hasUpgrade("w",34)) sftcap = new Decimal(1e9)
                if (eff.gte(sftcap)) eff = eff.div(sftcap).pow(0.5).mul(sftcap)
                return eff
            },
            effectDisplay() {
                if (tmp.w.upgrades[24].effect.gte(10000)) return format(this.effect())+"× (softcapped)"
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
            cost: new Decimal(1e24),
            unlocked() {return (hasMilestone("c",25))}
        },
        32: {
            title: "Real Weakening",
            description: "Weakling Dust divides the first Unstable Dust effect.",
            cost: new Decimal(1e30),
            effect() {
                let eff = player.w.points.pow(0.125).div(1.5).max(1)
                return eff
            },
            effectDisplay() {
                return "/"+format(this.effect())
            },
            unlocked() {return (hasUpgrade("w",31))}
        },
        33: {
            title: "Alleviate II",
            description: "Decrease the base division exponent of Weakling Dust effect.<br>(^0.4 → ^0.25)",
            cost: new Decimal(1e40),
            unlocked() {return (hasUpgrade("w",32))}
        },
        34: {
            title: "Powerful Weakling II",
            description: "Delays the softcap of <b>Powerful Weakling</b>.<br>(softcap start: "+format(1e4)+" -> "+format(1e9)+")",
            cost: new Decimal(1e51),
            unlocked() {return (hasUpgrade("w",33))}
        },
        35: {
            title: "Duality",
            description: "Enhances the effect of <b>Benediction</b> and <b>Imprecation</b> to twice of their original amount.",
            tooltip: "You can rest for a while after this upgrade~",
            cost: new Decimal(1e57),
            unlocked() {return (hasUpgrade("w",34))}
        },
    }
}) // Weaklings

addLayer("c", {
    tabFormat: {
        Milestones: {
            content:[
            ["display-text", function() {
                let mainText = "You have "+layerText("h2","c",formatWhole(player.c.points))+" Crystal Shards<br><br>"
                if(hasUpgrade("c",55)) mainText = "You have "+layerText("h2","c",formatWhole(player.c.points))+" Crystal Shards, which multiplies the base of Weakling Dust by "+layerText("h2","c",formatWhole(tmp.c.effect))+".<br>"
                return mainText
            }],
            ["display-text", function() {
                let gainText = ""
                let csBaseGain = player.w.points.div(2e10).pow(0.07)
                if(inChallenge("a",12)||inChallenge("dm",12)) csBaseGain = player.w.points.div(2e10).pow(0.035)
                if(hasUpgrade("c",55)) gainText = "You are gaining "+colorText("b",tmp.c.color,format(csBaseGain.mul(tmp.c.gainMult).div(2)))+" Crystal Shards per second.<br><br>"
                return gainText
            }],
            "prestige-button",
            "blank",
            ["display-text",
                function() {
                return "You have <h2><b>"+format(player.c.ud)+"</b></h2> Unstable Dust, "+
                "which are dividing "+layerText("b","w","Weakling Dust")+" gain by <h3><b>"+format(player.c.ude)+"</b></h3>"+
                ((hasMilestone("c",22)&player.c.ud.gte(1e6))?tmp.c.udEffect2Desc:".")
            }],
            ["blank","10px"],
            ["display-text", function() {
                let wdBase = (player.w.points.gt(0)?1:0)
                return "You have <b style='color: "+tmp.w.color+"; text-shadow:0px 0px 10px;'>"+format(player.w.points)+"</b> Weakling Dust."+
                " (+"+format(tmp.w.passiveGeneration.mul(tmp.w.gainMult).mul(wdBase))+"/s)"
            }],
            "blank",
            ["microtabs","goals"]
            ]
        },
        Crystals: {
            unlocked() {return hasMilestone("c", 7)},
            content: [["infobox","introBox"],
            ["display-text", function() {
                let mainText = "You have "+layerText("h2","c",formatWhole(player.c.points))+" Crystal Shards<br><br>"
                if(hasUpgrade("c",55)) mainText = "You have "+layerText("h2","c",formatWhole(player.c.points))+" Crystal Shards, which multiplies the base of Weakling Dust by "+layerText("h2","c",formatWhole(tmp.c.effect))+".<br>"
                return mainText
            }],
            ["display-text", function() {
                let gainText = ""
                let csBaseGain = player.w.points.div(2e10).pow(0.07)
                if(inChallenge("a",12)||inChallenge("dm",12)) csBaseGain = player.w.points.div(2e10).pow(0.035)
                if(hasUpgrade("c",55)) gainText = "You are gaining "+colorText("b",tmp.c.color,format(csBaseGain.mul(tmp.c.gainMult).div(2)))+" Crystal Shards per second.<br><br>"
                return gainText
            }],
            ["clickables",[1]],
            "blank", "blank",
            ["row", [
                ["column", [
                    "blank",
                    ["display-text", function() {
                        let currencyDisplay = colorText("h2",tmp.c.colorvc,formatWhole(player.c.vc))
                        let addText = "" // additional text
                        if(hasUpgrade("c",11)) addText = "<br>(Multiplier: ×"+formatWhole(upgradeEffect("c",11))+")"
                        if(hasUpgrade("c",21)) addText = "<br>You are gaining "+colorText("b",tmp.c.colorvc,formatWhole(upgradeEffect("c",21)))+" VC per second."
                        return "You have "+currencyDisplay+" Virtuous Crystal"+(player.c.vc.eq(1)?"":"s")+"."+
                        "<br>They have the following effects:"+addText
                        //+vcEcMani(0,0)
                    }],
                    "blank",
                    ["h-line","300px"],
                    "blank",
                    ["display-text", function() {                   
                        let stat = vcEffectsList()
                        if(hasMilestone("c",40)) {stat = vcEffectsList(new Decimal(0),new Decimal(1))}
                        if(hasMilestone("c",41)) {stat = vcEffectsList(new Decimal(0),new Decimal(2))}
                        if(hasMilestone("c",42)) {stat = vcEffectsList(new Decimal(0),new Decimal(2), true)}
                        return stat
                    }],
                    ["row",[
                        ["display-text", function() {
                            let stat = ""
                            if(hasMilestone("c",42)) stat = vcEffectsList(new Decimal(2),new Decimal(3),true)
                            return stat
                        }],
                        ["clickable",21]
                    ]],
                    ["display-text", function() {
                        let stat = ""
                        if(hasMilestone("c",42)) stat = vcEffectsList(new Decimal(4),new Decimal(3))
                        if(hasMilestone("c",43)) stat = vcEffectsList(new Decimal(3),new Decimal(4))
                        if(hasMilestone("c",44)) stat = vcEffectsList(new Decimal(3),new Decimal(5))
                        if(hasMilestone("c",45)) stat = vcEffectsList(new Decimal(3),new Decimal(6))
                        if(hasMilestone("c",46)) stat = vcEffectsList(new Decimal(3),new Decimal(7))
                        if(hasMilestone("c",47)) stat = vcEffectsList(new Decimal(3),new Decimal(8))
                        if(hasMilestone("c",48)) stat = vcEffectsList(new Decimal(3),new Decimal(9),true)
                        return stat
                    }]
                ], {'width': '350px', 'max-height': '700px',
                    'background-color': 'rgba(18, 187, 40, 0.25)',
                }],
                ["column", [
                    "blank",
                    ["display-text", function() {
                    let currencyDisplay = colorText("h2",tmp.c.colorec,formatWhole(player.c.ec))
                    let addText = "" // additional text
                    if(hasUpgrade("c",31)) addText = "<br>(Multiplier: ×"+formatWhole(upgradeEffect("c",31))+")"
                    if(hasUpgrade("c",41)) addText = "<br>You are gaining "+colorText("b",tmp.c.colorec,formatWhole(upgradeEffect("c",41)))+" EC per second."
                    return "You have "+currencyDisplay+" Evil Crystal"+(player.c.ec.eq(1)?"":"s")+"."+
                    "<br>They have the following effects:"+addText
                    }],
                    "blank",
                    ["h-line","300px"],
                    "blank",
                    ["display-text", function() {
                        let stat = ecEffectsList()
                        if(hasMilestone("c",70)) stat = ecEffectsList(new Decimal(0),new Decimal(1))
                        if(hasMilestone("c",71)) stat = ecEffectsList(new Decimal(0),new Decimal(2))
                        if(hasMilestone("c",72)) stat = ecEffectsList(new Decimal(0),new Decimal(3))
                        if(hasMilestone("c",73)) stat = ecEffectsList(new Decimal(0),new Decimal(4))
                        if(hasMilestone("c",74)) stat = ecEffectsList(new Decimal(0),new Decimal(5))
                        if(hasMilestone("c",75)) stat = ecEffectsList(new Decimal(0),new Decimal(6))
                        if(hasMilestone("c",76)) stat = ecEffectsList(new Decimal(0),new Decimal(7))
                        if(hasMilestone("c",77)) stat = ecEffectsList(new Decimal(0),new Decimal(8))
                        if(hasMilestone("c",78)) stat = ecEffectsList(new Decimal(0),new Decimal(9),true)
                        return stat
                    }]
                ], {'width': '350px', 'max-height': '700px', 
                    'background-color': 'rgba(217, 55, 250, 0.2)'
                }]
            ]], ["blank","30px"]
        ]},
        Upgrades: {
            unlocked() {return hasMilestone("c",45)||hasMilestone("c",75)},
            content: [
                ["display-text", function() {
                    return "You have condensed "+colorText("h3",tmp.c.color,formatWhole(player.c.total))+" Crystal Shards in total.<br><br>"+
                    "You have "+colorText("h3",tmp.c.colorvc,formatWhole(player.c.vc))+" Virtuous Crystal"+(player.c.vc.eq(1)?"":"s")+"."
                }], "blank",
                ["row",[
                    ["display-text", "↑", {'font-size':'100px','color': 'rgb(18, 187, 41)','text-shadow':'0px 0px 10px'}],
                    ["blank",["40px","10px"]],
                    ["v-line","250px"],
                    ["blank",["40px","10px"]],
                    ["display-text", function() {
                        if(!hasMilestone("c",45)) return colorText("h1","rgba(18, 187, 40, 0.5)","Nothing here yet...")
                    }],
                    ["upgrades",[1,2]]
                ], {'width': '700px', 'height': '300px','background-color': 'rgba(18, 187, 40, 0.25)'}],
                "blank",
                ["display-text", function() {
                    return "You have "+colorText("h3",tmp.c.colorec,formatWhole(player.c.ec))+" Evil Crystal"+(player.c.ec.eq(1)?"":"s")+"."
                }],"blank",
                ["row",[
                    ["display-text", "↓", {'font-size':'100px', 'color': 'rgb(217, 55, 250)','text-shadow':'0px 0px 10px'}],
                    ["blank",["40px","10px"]],
                    ["v-line","250px"],
                    ["blank",["40px","10px"]],
                    ["display-text", function() {
                        if(!hasMilestone("c",75)) return colorText("h1","rgba(217, 55, 250, 0.5)","Nothing here yet...")
                    }],
                    ["upgrades",[3,4]]
                ], {'width': '700px', 'height': '300px','background-color': 'rgba(217, 55, 250, 0.2)'}],
                "blank",
                ["display-text", function() {
                    return "You have "+colorText("h3",tmp.c.color,formatWhole(player.c.points))+" Crystal Shard"+(player.c.points.eq(1)?"":"s")+"."
                }], "blank",
                ["row",[
                    ["display-text", function() {
                        if(!hasUpgrade("c",12)||!hasUpgrade("c",32)) return colorText("h1","rgba(209, 31, 31, 0.5)","Nothing here yet...")
                    }],
                    ["upgrades",[5,6]]
                ], {'width': '700px', 'height': '300px','background-color': 'rgba(209, 31, 31, 0.2)'}],
                "blank"
            ]
        }
    },
    microtabs: {
        goals: {
            "Crystal Shards": {
                unlocked: true,
                content: [["milestones", [0,1,2,3,4,5,6,7,8,9,10]]]
            },
            "Unstable Dust": {
                unlocked: true,
                content: [["milestones", [20,21,22,23,24,25,26,27]]]
            }
        }
    },
    name: "Crystals", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["w"],
    infoboxes: {
        introBox: {
            title: "Crystals",
            body() {
                return "Welcome to the major mechanic of this layer!"+
                " In here, you can finally start to make Crystals using the Crystal Shards you have!"+
                " To obtain one of them, you'd need 20 Crystal Shards to do so!<br><br>"+
                "During this process you may obtain "+colorText("b",tmp.c.colorvc,"Virtuous Crystals")+
                " or <br>"+colorText("b",tmp.c.colorec,"Evil Crystals")+", in which they will aid (or harm) your progress"+
                " in various ways!<br><br>"+
                "Combining a Crystal, regardless of the type, will perform a reset of this layer! You will also gain a "+
                colorText("b",tmp.c.colorvc,"Virtuous Crystal")+" for your first combination.<br><br>"+
                "<div style='color: rgb(167, 167, 167)'>(Abbriviations - VC: Virtuous Crystals, EC: Evil Crystals)</div>"
            }
        }
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        ud: new Decimal(0), // Unstable Dust (UD)
        ude: new Decimal(0), // UD Effect
        autoStrengthen: false,
        vc: new Decimal(0), // Virtuous Crystals
        ec: new Decimal(0), // Evil Crystals
        vcu: new Decimal(0), // VC Upgrades
        ecu: new Decimal(0), // EC Upgrades
        totalvc: new Decimal(0),
        totalec: new Decimal(0)
    }},
    color: "rgb(209, 31, 31)",
    colorvc: "rgb(18, 187, 41)", // color for Virtuous Crystals
    colorec: "rgb(217, 55, 250)", // color for Evil Crystals
    requires: new Decimal(2e10), // Can be a function that takes requirement increases into account
    resource: "Crystal Shards", // Name of prestige currency
    resourceSingular: "Crystal Shard",
    baseResource: "Weakling Dust", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        if(inChallenge("a",12)||inChallenge("dm",12)) return 0.035
        return 0.07
    }, // Prestige currency exponent

    effect() {
        let eff = player.c.points.div(1e11).max(1).pow(0.25).div(1.6).add(1).max(1)
        if(hasUpgrade("c",61)) eff = eff.pow(upgradeEffect("c",61))
        return eff.floor()
    },

    passiveGeneration() {
        let gain = new Decimal(0)
        if(hasUpgrade("c",55)) gain = new Decimal(0.5)
        return gain
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasMilestone("c",40)) mult = mult.mul(tmp.c.vcToCrystalShards)
        if(hasUpgrade("c",13)) mult = mult.mul(upgradeEffect("c",13))
        if(inChallenge("a",12)||inChallenge("dm",12)) mult = mult.pow(0.5)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },

    // UD & Crystal Shards Session ########################################################################################
    udBase() {
        return player.w.points.gte(2e10)?player.w.points.div(2e10).sub(1):new Decimal(0)
    },

    udBaseEffect() {
        let eff = player.c.ud.add(1).pow(0.5)
        if(hasMilestone("c",23)) eff = eff.pow(1.2)
        return eff
    },

    udEffect1() {
        let eff = tmp.c.udBaseEffect
        if(hasUpgrade("c",51)) eff = eff.pow(0.9)
        if(hasUpgrade("w",32)) eff = eff.div(upgradeEffect("w",32)).max(1)
        if(hasChallenge("dm",11)) eff = eff.pow(challengeEffect("dm",11))
        return eff
    },

    udEffect2() {
        let eff = tmp.c.udBaseEffect.pow(0.4)
        return eff
    },

    udEffect2Desc() {
        return " and <b>Mentality</b> gain by <h3><b>"+format(tmp.c.udEffect2)+"</b></h3>."
    },

    udGainMult() {
        let mult = new Decimal(1)
        if(hasMilestone("c",70)) mult = mult.mul(tmp.c.ecToUD)
        if(hasMilestone("c",24)) mult = mult.mul(tmp.c.crystalsToUD)
        if(hasUpgrade("c",52)) mult = mult.mul(upgradeEffect("c",52))
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
        let mult = player.c.ud.max(0).pow(0.2).mul(3.3).add(1)
        if(inChallenge("dm",11)) mult = new Decimal(1)
        return mult
    },

    udNerfWSCost() {
        let mult = player.c.ud.max(0).pow(0.1).add(1)
        return mult
    },

    // Crystals Session ########################################################################################
    crystalsToWeakling() {
        let mult = player.c.points.max(1).log10().mul(6.4).max(1.5)
        return mult
    },

    crystalsToMentality() {
        let mult = player.c.points.max(1).log10().mul(3.1).max(1.2)
        return mult
    },

    crystalsToUD() {
        let mult = new Decimal(1)
        let vc = player.c.vc
        let ec = player.c.ec
        if(hasMilestone("c",24)) mult = mult.mul(vc.add(ec)).pow(0.4).mul(2)
        return mult
    },

    crystalBaseCost() {
        let base = new Decimal(20)
        if(hasMilestone("c",73)) base = base.add(tmp.c.ecToCostIncrease)
        return base
    },

    crystalCost() {
        let cost = tmp.c.crystalBaseCost
        if(hasUpgrade("c",32)) cost = cost.pow(tmp.c.crystalCostExp).floor()
        return cost
    },

    crystalCostExp() {
        let exp = new Decimal(1.2)
        if(hasMilestone("c",77)) exp = exp.add(tmp.c.ecToCostIncreaseExp)
        return exp
    },

    crystalsQuantity() {
        let amount = tmp.c.crystalBaseCost.div(20).pow(0.5)
        if(hasUpgrade("c",53)) amount = amount.mul(upgradeEffect("w",25))
        return amount.floor()
    },

    // EC Session ########################################################################################
    ecGain() {
        let gain = new Decimal(1)
        if(hasUpgrade("c",31)) gain = gain.mul(upgradeEffect("c",31))
        if(hasUpgrade("c",32)) gain = gain.mul(tmp.c.crystalsQuantity)
        return gain
    },

    ecToUD() { // Effect 1
        let effectiveEC = player.c.ec
        if(hasMilestone("c",76)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let mult = effectiveEC.mul(2).add(1).pow(0.5)
        if(inChallenge("a",12)) mult = new Decimal(1)
        return mult
    },

    ecToWeaklingEffect() { // Effect 3
        let effectiveEC = player.c.ec
        if(hasMilestone("c",76)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let mult = effectiveEC.sub(1).max(0).pow(0.9).div(0.6666).add(1.404)
        if(inChallenge("a",11)) mult = new Decimal(1)
        if(inChallenge("a",12)) mult = new Decimal(1)
        return mult
    },

    ecToCostIncrease() { // Effect 4
        let effectiveEC = player.c.ec
        if(hasMilestone("c",76)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let addCost = effectiveEC.sub(24).max(0)
        let sftcap = 10000
        if(effectiveEC.gte(sftcap)) addCost = addCost.div(sftcap).pow(2/3).mul(sftcap)
        if(inChallenge("a",12)) mult = new Decimal(1)
        return addCost
    },

    ecToVCEffects() { // Effect 5
        let effectiveEC = player.c.ec
        if(hasMilestone("c",76)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let mult = effectiveEC.sub(40).max(0).pow(0.25).add(1.2).pow(0.2)
        if(hasUpgrade("c",33)) mult = mult.pow(upgradeEffect("c",33))
        if(inChallenge("a",12)) mult = new Decimal(1)
        return mult
    },

    ecToEffectiveEC() { // Effect 7
        ecuCount()
        //hasMilestone("c",78)
        if (true) totalECCalc()
        let effectiveECInc = new Decimal(10)
        let ten = new Decimal(10)
        if(player.c.ecu.gte(3)) effectiveECInc = effectiveECInc.mul(ten.pow(player.c.ecu.sub(2).mul(1.096)))
        if (hasMilestone("c",78)) effectiveECInc = effectiveECInc.add(player.c.totalec.div(4))
        if(inChallenge("a",12)||inChallenge("dm",12)) effectiveECInc = new Decimal(0)
        return effectiveECInc.floor()
    },

    ecToCostIncreaseExp() { // Effect 8 added to 3
        let effectiveEC = player.c.ec
        if(hasMilestone("c",77)) effectiveEC = effectiveEC.add(tmp.c.ecToEffectiveEC)
        let addExp = effectiveEC.div(5000).max(1).log10().div(20).add(0.05)
        if(inChallenge("a",12)) addExp = new Decimal(0)
        return addExp
    },

    // VC Session ########################################################################################
    vcGain() {
        let gain = new Decimal(1)
        if(hasUpgrade("c",11)) gain = gain.mul(upgradeEffect("c",11))
        if(hasUpgrade("c",32)) gain = gain.mul(tmp.c.crystalsQuantity)
        return gain
    },

    vcToCrystalShards() { // Effect 1
        let effectiveVC = player.c.vc
        if(hasMilestone("c",46)) effectiveVC = effectiveVC.add(tmp.c.vcToEffectiveVC)
        let mult = effectiveVC.add(1).pow(0.5).max(1)
        if(hasUpgrade("c",12)) mult = mult.pow(2)
        if(hasMilestone("c",74)) mult = mult.div(tmp.c.ecToVCEffects).max(1)
        if(inChallenge("dm",12)) mult = new Decimal(1)
        return mult
    },

    vcToMentality() { // Effect 4
        let effectiveVC = player.c.vc
        if(hasMilestone("c",46)) effectiveVC = effectiveVC.add(tmp.c.vcToEffectiveVC)
        let mult = effectiveVC.sub(1).max(0).pow(1.2).div(3).add(1).max(1)
        if(hasMilestone("c",74)) mult = mult.div(tmp.c.ecToVCEffects).max(1)
        if(hasMilestone("c",47)) mult = mult.mul(tmp.c.vcEff4Eff5Enhance)
        if(inChallenge("dm",11)||inChallenge("dm",12)) mult = new Decimal(1)
        return mult
    },

    vcToWeakling() { // Effect 5
        let effectiveVC = player.c.vc
        if(hasMilestone("c",46)) effectiveVC = effectiveVC.add(tmp.c.vcToEffectiveVC)
        let mult = effectiveVC.sub(10).max(0).pow(1.5).div(7.5).add(1).max(1)
        if(hasMilestone("c",74)) mult = mult.div(tmp.c.ecToVCEffects).max(1)
        if(hasMilestone("c",47)) mult = mult.mul(tmp.c.vcEff4Eff5Enhance)
        if(inChallenge("dm",11)||inChallenge("dm",12)) mult = new Decimal(1)
        return mult
    },

    vcToEffectiveVC() { // Effect 7
        vcuCount()
        //hasMilestone("c",48)
        if (true) totalVCCalc()
        let effectiveVCInc = new Decimal(10)
        let ten = new Decimal(10)
        if(player.c.vcu.gte(3)) effectiveVCInc = effectiveVCInc.mul(ten.pow(player.c.vcu.sub(2).mul(1.096)))
        if(hasMilestone("c",48)) effectiveVCInc = effectiveVCInc.add(player.c.totalvc.div(4))
        if(inChallenge("a",12)||inChallenge("dm",12)) effectiveVCInc = new Decimal(0)
        return effectiveVCInc.floor()
    },

    vcEff4Eff5Enhance() { // Effect 8
        let effectiveVC = player.c.vc
        if(hasMilestone("c",46)) effectiveVC = effectiveVC.add(tmp.c.vcToEffectiveVC)
        let mult = effectiveVC.pow(0.15).max(1)
        if(inChallenge("dm",11)||inChallenge("dm",12)) mult = new Decimal(1)
        return mult
    },

    /*test() {
        let a = new Decimal(crystalTypeDecider())
        return a
    },*/



    update(diff) {
        player.c.ude = tmp.c.udEffect1
        player.c.ud = tmp.c.udBase.mul(tmp.c.udGainMult)
        if(hasUpgrade("c",21)&&!inChallenge("a",12)) player.c.vc = player.c.vc.add(upgradeEffect("c",21).mul(diff))
        if(inChallenge("a",12)&&player.a.inCh2Time > 0.1) player.c.vc = player.c.vc.add(upgradeEffect("c",21).mul(diff))
        if(hasUpgrade("c",41)&&!inChallenge("dm",12)) player.c.ec = player.c.ec.add(upgradeEffect("c",41).mul(diff))
        if(inChallenge("dm",12)&&player.dm.inCh2Time > 0.1) player.c.ec = player.c.ec.add(upgradeEffect("c",41).mul(diff))
    },

    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Condense into Crystal Shards", 
        onPress(){
            if (canReset(this.layer)) doReset(this.layer)
        }},
    ],
    layerShown(){return hasUpgrade("w", 25)||hasMilestone("c",0)},

    doReset(resettingLayer) {
        player.c.ud = new Decimal(0)
    },

    resetsNothing() {return hasUpgrade("c",54)},

    canReset() {return (!hasUpgrade("c",55)&&player.w.points.gte(2e10))},
    
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
            requirementDescription: "5 Crystal Shards",
            effectDescription() {
                return "Boosts Mentality and Weakling Dusts based on Crystal Shards.<br>"+
                "Currently: ×"+format(tmp.c.crystalsToMentality)+" to Mentality, ×"+format(tmp.c.crystalsToWeakling)+" to Weakling Dust."
            },
            done() {return player.c.points.gte(5)},
        },
        5: {
            requirementDescription: "7 Crystal Shards",
            effectDescription: "Triples Weakling Dust gain, again.",
            done() {return player.c.points.gte(7)},
        },
        6: {
            requirementDescription: "10 Crystal Shards",
            effectDescription() {
                return "Boosts Mentality based on Weakling Dusts.<br>"+
                "Currently: ×"+format(tmp.c.wmConvert)+"."
            },
            done() {return player.c.points.gte(10)},
        },
        7: {
            requirementDescription: "20 Crystal Shards",
            effectDescription: "Unlocks <b>Crystals</b> tab.",
            done() {return player.c.points.gte(20)},
        },
        20: {
            requirementDescription: "100 Unstable Dust",
            effectDescription() {
                return "Alleviates the Weakling Dust effect based on Unstable Dust.<br>"+
                "Currently: /"+format(tmp.c.udNerfWeaklingEffect)+"."
            },
            done() {return player.c.ud.gte(100)},
        },
        21: {
            requirementDescription: "50,000 Unstable Dust",
            effectDescription() {
                return "<b>Weakling Strengthen</b> is slightly cheaper based on Unstable Dust.<br>"+
                "Currently: /"+format(tmp.c.udNerfWSCost)+"."
            },
            done() {return player.c.ud.gte(50000)},
        },
        22: {
            requirementDescription: "1,000,000 Unstable Dust",
            effectDescription() {
                return "Adds the 2nd effect to Unstable Dust.<br><i>this only applies when exceeding 1m Unstable Dust.</i>"
            },
            done() {return player.c.ud.gte(1e6)},
        },
        23: {
            requirementDescription: "1e9 Unstable Dust",
            effectDescription() {
                return "Unstable Dust effects ^1.2."
            },
            done() {return player.c.ud.gte(1e9)},
            unlocked() {return hasMilestone("c",71)}
        },
        24: {
            requirementDescription: "1e12 Unstable Dust",
            effectDescription() {
                return "Boosts Unstable Dust gain based on the sum of Virtuous Crystals and Evil Crystals.<br>"+
                "Currently: ×"+format(tmp.c.crystalsToUD)+"."
            },
            done() {return player.c.ud.gte(1e12)},
            unlocked() {return hasMilestone("c",71)}
        },
        25: {
            requirementDescription: "1e18 Unstable Dust",
            effectDescription() {
                return "Unlocks a new row of Weakling Upgrades."
            },
            done() {return player.c.ud.gte(1e18)},
            unlocked() {return hasMilestone("c",71)}
        },
        26: {
            requirementDescription: "1e70 Unstable Dust",
            effectDescription() {
                return "Unlocks two new layers."
            },
            done() {return player.c.ud.gte(1e70)},
            unlocked() {return hasMilestone("c",71)}
        },
        40: {
            requirementDescription: "1 Virtuous Crystal",
            done() {return player.c.vc.gte(1)},
        },
        41: {
            requirementDescription: "3 Virtuous Crystals",
            done() {return player.c.vc.gte(3)},
        },
        42: {
            requirementDescription: "5 Virtuous Crystals",
            done() {return player.c.vc.gte(5)},
        },
        43: {
            requirementDescription: "10 Virtuous Crystals",
            done() {return player.c.vc.gte(10)},
        },
        44: {
            requirementDescription: "30 Virtuous Crystals",
            done() {return player.c.vc.gte(30)},
        },
        45: {
            requirementDescription: "50 Virtuous Crystals",
            done() {return player.c.vc.gte(50)},
        },
        46: {
            requirementDescription: "500 Virtuous Crystals",
            done() {return player.c.vc.gte(500)},
        },
        47: {
            requirementDescription: "5,000 Virtuous Crystals",
            done() {return player.c.vc.gte(5000)},
        },
        48: {
            requirementDescription: "100,000 Virtuous Crystals",
            done() {return player.c.vc.gte(100000)},
        },
        70: {
            requirementDescription: "1 Evil Crystal",
            done() {return player.c.ec.gte(1)},
        },
        71: {
            requirementDescription: "5 Evil Crystals",
            done() {return player.c.ec.gte(5)},
        },
        72: {
            requirementDescription: "10 Evil Crystals",
            done() {return player.c.ec.gte(10)},
        },
        73: {
            requirementDescription: "25 Evil Crystals",
            done() {return player.c.ec.gte(25)},
        },
        74: {
            requirementDescription: "40 Evil Crystals",
            done() {return player.c.ec.gte(40)},
        },
        75: {
            requirementDescription: "50 Evil Crystals",
            done() {return player.c.ec.gte(50)},
        },
        76: {
            requirementDescription: "500 Evil Crystals",
            done() {return player.c.ec.gte(500)},
        },
        77: {
            requirementDescription: "5,000 Evil Crystals",
            done() {return player.c.ec.gte(5000)},
        },
        78: {
            requirementDescription: "100,000 Evil Crystals",
            done() {return player.c.ec.gte(100000)},
        },
    },
    clickables: {
        11: {
            title() {
                return "<h2>Condense "+formatWhole(tmp.c.crystalCost)+" Crystal Shards into "+(hasUpgrade("c",32)?formatWhole(tmp.c.crystalsQuantity):formatWhole(1))+" Crystal"+((tmp.c.crystalsQuantity.eq(1)||!hasUpgrade("c",32))?"":"s")+"<br></h2>"
            },
            display: "<h3>Note: This forces a Crystal Shards reset.</h3>",
            onClick() {
                player.c.points = player.c.points.sub(tmp.c.crystalCost)
                crystalTypeDecider()
                doReset("c", force=true)
            },
            onHold() { // QOL for mobile players
                player.c.points = player.c.points.sub(tmp.c.crystalCost)
                crystalTypeDecider()
                doReset("c", force=true)
            },
            canClick() {
                return (player.c.points.gte(tmp.c.crystalCost)&&(!hasUpgrade("c",21)||!hasUpgrade("c",41)))
            },
            unlocked: true,
            style: {'width': '400px', 'height': '100px'}
        },
        
        21: { // a replication of toggle but with unlock condition
            title() {
                if(getClickableState("c",21)==1) return "ON"
                return "OFF"
            },
            unlocked() {return hasMilestone("c",72)},
            canClick: true,
            onClick() {
                if(getClickableState("c",21)==1) {
                    setClickableState("c",21,0)
                    player.c.autoStrengthen = false
                }
                else {
                    setClickableState("c",21,1)
                    player.c.autoStrengthen = true
                }
            },
            style: {'width': "45px", 'min-height': "45px", "background-color": 'rgb(18, 187, 41)'}
        }
    },
    upgrades: {
        11: {
            title: "Faith",
            description: "Increase the gain of Virtuous Crystals based on total Crystal Shards.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost: new Decimal(50),
            effect() {
                let eff = player.c.total.pow(0.2).div(1.15).max(1).floor()
                return eff
            },
            effectDisplay() {
                return "×"+formatWhole(this.effect())
            },
            style: {"background"() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color = color2
                if(hasUpgrade("c",11)) color = color1
                if(player.c.vc.gte(tmp.c.upgrades[11].cost)&&!hasUpgrade("c",11)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasMilestone(this.layer,45))}
        },
        12: {
            title: "Empowerment",
            description: "Significantly increase the first VC effect.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost: new Decimal(100),
            effect() {
                let eff = new Decimal(2)
                return eff
            },
            effectDisplay() {
                return "^"+formatWhole(this.effect())
            },
            style: {"background"() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color = color2
                if(hasUpgrade("c",12)) color = color1
                if(player.c.vc.gte(tmp.c.upgrades[12].cost)&&!hasUpgrade("c",12)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,11))}
        },
        13: {
            title: "Enchantment",
            description: "Crystal Shards boosts its own gain.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost: new Decimal(1000),
            effect() {
                let eff = player.c.points.pow(0.14).max(1)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color = color2
                if(hasUpgrade("c",13)) color = color1
                if(player.c.vc.gte(tmp.c.upgrades[13].cost)&&!hasUpgrade("c",13)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,12))}
        },
        14: {
            title: "Benediction",
            description: "<i>Mentality Strengthen</i> no longer costs anything, and its base is improved based on VC.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost: new Decimal(10000),
            effect() {
                let eff = new Decimal(0.05)
                let mult = new Decimal(0.04)
                eff = eff.add(mult.mul(player.c.vc.max(1).log10()))
                if(hasUpgrade("w",35)) eff = eff.mul(2)
                return eff
            },
            effectDisplay() {
                return "+"+format(this.effect())
            },
            style: {"background"() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color = color2
                if(hasUpgrade("c",14)) color = color1
                if(player.c.vc.gte(tmp.c.upgrades[14].cost)&&!hasUpgrade("c",14)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,13))}
        },
        21: {
            title: "Construction",
            description: "Automatically gains VC based on its own gain multiplier.<br>You will no longer gain VC by Crystal condensation.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            tooltip: "When having Destruction at the same time, ×10 the effect of this upgrade and disable the Crystals button.",
            cost: new Decimal(1e9),
            effect() {
                let eff = tmp.c.crystalsQuantity.mul(upgradeEffect("c",11)).div(20)
                if(hasUpgrade("c",21)&&hasUpgrade("c",41)) eff = eff.mul(10)
                if(hasChallenge("a",11)) eff = eff.mul(tmp.a.vppEffect.add(1))
                if(inChallenge("dm",12)) eff = new Decimal(0)
                return eff
            },
            effectDisplay() {
                return format(this.effect())+"/s"
            },
            style: {"background"() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color = color2
                if(hasUpgrade("c",21)) color = color1
                if(player.c.vc.gte(tmp.c.upgrades[21].cost)&&!hasUpgrade("c",21)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,14))}
        },
        22: {
            title: "Purity",
            description: "You gain 5% more multiplier on Purified VC<sup>1</sup> for every bought Purified VC<sup>1</sup>.",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost: new Decimal(1e35),
            effect() {
                let eff = Decimal.pow(1.05,player.a.vc1Bought)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color = color2
                if(hasUpgrade("c",22)) color = color1
                if(player.c.vc.gte(tmp.c.upgrades[22].cost)&&!hasUpgrade("c",22)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (player.a.vc2.gte(5))}
        },
        23: {
            title: "placeholder",
            description: "placeholder",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost: new Decimal(1e100),
            style: {"background"() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color = color2
                if(hasUpgrade("c",23)) color = color1
                if(player.c.vc.gte(tmp.c.upgrades[23].cost)&&!hasUpgrade("c",23)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,22))}
        },
        24: {
            title: "placeholder",
            description: "placeholder",
            currencyDisplayName: "Virtuous Crystals",
            currencyInternalName: "vc",
            currencyLayer: "c",
            cost: new Decimal(100),
            style: {"background"() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color = color2
                if(hasUpgrade("c",24)) color = color1
                if(player.c.vc.gte(tmp.c.upgrades[24].cost)&&!hasUpgrade("c",24)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,23))}
        },
        31: {
            title: "Disbelief",
            description: "Increase the gain of Evil Crystals based on total Crystal Shards.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost: new Decimal(50),
            effect() {
                let eff = player.c.total.pow(0.22).div(1.35).max(1).floor()
                return eff
            },
            effectDisplay() {
                return "×"+formatWhole(this.effect())
            },
            style: {"background"() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color = color2
                if(hasUpgrade("c",31)) color = color1
                if(player.c.ec.gte(tmp.c.upgrades[31].cost)&&!hasUpgrade("c",31)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasMilestone(this.layer,75))}
        },
        32: {
            title: "Rebellion",
            description: "You can condense multiple Crystals at once, but the cost will increase drastically.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost: new Decimal(100),
            style: {"background"() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color = color2
                if(hasUpgrade("c",32)) color = color1
                if(player.c.ec.gte(tmp.c.upgrades[32].cost)&&!hasUpgrade("c",32)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,31))}
        },
        33: {
            title: "Degradation",
            description: "Significantly increase the fifth EC effect.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost: new Decimal(1200),
            style: {"background"() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color = color2
                if(hasUpgrade("c",33)) color = color1
                if(player.c.ec.gte(tmp.c.upgrades[33].cost)&&!hasUpgrade("c",33)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            effect() {
                let eff = new Decimal(4)
                return eff
            },
            effectDisplay() {
                return "^"+formatWhole(this.effect())
            },
            unlocked() {return (hasUpgrade(this.layer,32))}
        },
        34: {
            title: "Imprecation",
            description: "<i>Weakling Strengthen</i> no longer costs anything, and its base is improved based on EC.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost: new Decimal(10000),
            effect() {
                let eff = new Decimal(0.05)
                let mult = new Decimal(0.025)
                eff = eff.add(mult.mul(player.c.ec.max(1).log10()))
                if(hasUpgrade("w",35)) eff = eff.mul(2)
                return eff
            },
            effectDisplay() {
                return "+"+format(this.effect())
            },
            style: {"background"() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color = color2
                if(hasUpgrade("c",34)) color = color1
                if(player.c.ec.gte(tmp.c.upgrades[34].cost)&&!hasUpgrade("c",34)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,33))}
        },
        41: {
            title: "Destruction",
            description: "Automatically gains EC based on its own gain multiplier.<br>You will no longer gain EC by Crystal condensation.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            tooltip: "When having Construction at the same time, ×10 the effect of this upgrade and disable the Crystals button.",
            cost: new Decimal(1e9),
            effect() {
                let eff = tmp.c.crystalsQuantity.mul(upgradeEffect("c",31)).div(20)
                if(hasUpgrade("c",21)&&hasUpgrade("c",41)) eff = eff.mul(10)
                if(hasChallenge("dm",11)) eff = eff.mul(tmp.dm.eppEffect.add(1))
                if(inChallenge("a",12)) eff = new Decimal(0)
                return eff
            },
            effectDisplay() {
                return format(this.effect())+"/s"
            },
            style: {"background"() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color = color2
                if(hasUpgrade("c",41)) color = color1
                if(player.c.ec.gte(tmp.c.upgrades[41].cost)&&!hasUpgrade("c",41)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,34))}
        },
        42: {
            title: "Impurity",
            description: "You gain 5% more multiplier on Purified EC<sup>1</sup> for every bought Purified EC<sup>1</sup>.",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost: new Decimal(1e36),
            effect() {
                let eff = Decimal.pow(1.05,player.dm.ec1Bought)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color = color2
                if(hasUpgrade("c",42)) color = color1
                if(player.c.ec.gte(tmp.c.upgrades[42].cost)&&!hasUpgrade("c",42)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (player.dm.ec2.gte(5))}
        },
        43: {
            title: "placeholder",
            description: "placeholder",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost: new Decimal(1e100),
            style: {"background"() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color = color2
                if(hasUpgrade("c",43)) color = color1
                if(player.c.ec.gte(tmp.c.upgrades[43].cost)&&!hasUpgrade("c",43)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,42))}
        },
        44: {
            title: "placeholder",
            description: "placeholder",
            currencyDisplayName: "Evil Crystals",
            currencyInternalName: "ec",
            currencyLayer: "c",
            cost: new Decimal(100),
            style: {"background"() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color = color2
                if(hasUpgrade("c",44)) color = color1
                if(player.c.ec.gte(tmp.c.upgrades[44].cost)&&!hasUpgrade("c",44)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,43))}
        },
        51: {
            title: "Fogging",
            description: "The first Unstable Dust effect is now ^0.9.",
            cost: new Decimal(1000),
            style: {"background"() {
                let color1 = "rgb(209, 31, 31)"
                let color2 = "rgb(191, 143, 143)"
                let color = color2
                if(hasUpgrade("c",51)) color = color1
                if(player.c.points.gte(tmp.c.upgrades[51].cost)&&!hasUpgrade("c",51)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,12)&&hasUpgrade(this.layer,32))}
        },
        52: {
            title: "Grinding",
            description: "Crystal Shards boost Unstable Dust at a greatly reduced rate.",
            cost: new Decimal(50000),
            effect() {
                let eff = player.c.points.max(1).log10().mul(2.1)
                return eff
            },
            effectDisplay() {
                return "×"+format(this.effect())
            },
            style: {"background"() {
                let color1 = "rgb(209, 31, 31)"
                let color2 = "rgb(191, 143, 143)"
                let color = color2
                if(hasUpgrade("c",52)) color = color1
                if(player.c.points.gte(tmp.c.upgrades[52].cost)&&!hasUpgrade("c",52)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,13)&&hasUpgrade(this.layer,33))}
        },
        53: {
            costCS: new Decimal(5e6),
            costVC: new Decimal(50000),
            costEC: new Decimal(50000),
            fullDisplay() {
                let title = "<h3>Foaming</h3>"
                let description = "Change the description for <b>Crystalize</b>."
                let cost = "Cost: "+formatWhole(tmp.c.upgrades[53].costCS)+" Crystal Shards, "+formatWhole(tmp.c.upgrades[53].costVC)+" VC and<br>"+formatWhole(tmp.c.upgrades[53].costEC)+" EC"
                return title+"<br>"+description+"<br><br>"+cost
            },
            canAfford() {
                let csCost = player.c.points.gte(tmp.c.upgrades[53].costCS)
                let vcCost = player.c.vc.gte(tmp.c.upgrades[53].costVC)
                let ecCost = player.c.ec.gte(tmp.c.upgrades[53].costEC)
                return (csCost&&vcCost&&ecCost)
            },
            pay() {
                player.c.points = player.c.points.sub(tmp.c.upgrades[53].costCS)
                player.c.vc = player.c.vc.sub(tmp.c.upgrades[53].costVC)
                player.c.ec = player.c.ec.sub(tmp.c.upgrades[53].costEC)
            },
            style: {"background"() {
                let color1 = "rgb(209, 31, 31)"
                let color2 = "rgb(191, 143, 143)"
                let color = color2
                if(hasUpgrade("c",53)) color = color1
                if(tmp.c.upgrades[53].canAfford&&!hasUpgrade("c",53)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,14)&&hasUpgrade(this.layer,34))}
        },
        54: {
            title: "Clarity",
            description: "Mentality and Weakling layer are no longer reset by condensing Crystal and Crystal Shards.",
            cost: new Decimal(5e12),
            style: {"background"() {
                let color1 = "rgb(209, 31, 31)"
                let color2 = "rgb(191, 143, 143)"
                let color = color2
                if(hasUpgrade("c",54)) color = color1
                if(player.c.points.gte(tmp.c.upgrades[54].cost)&&!hasUpgrade("c",54)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,41)&&hasUpgrade(this.layer,41))}
        },
        55: {
            title: "Distillation",
            description: "Gain 50% of Crystal Shards on reset. Adds an effect to Crystal Shard.",
            tooltip: "This will also disable the prestige button of Crystal Shards.",
            cost: new Decimal(1e16),
            style: {"background"() {
                let color1 = "rgb(209, 31, 31)"
                let color2 = "rgb(191, 143, 143)"
                let color = color2
                if(hasUpgrade("c",55)) color = color1
                if(player.c.points.gte(tmp.c.upgrades[55].cost)&&!hasUpgrade("c",55)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (hasUpgrade(this.layer,54))}
        },
        61: {
            title: "Defragmentation",
            description: "Drastically improve the Crystal Shards effect.",
            cost: new Decimal(1e51),
            effect() {
                let eff = new Decimal(2)
                return eff
            },
            effectDisplay() {
                return "^"+formatWhole(this.effect())
            },
            style: {"background"() {
                let color1 = "rgb(209, 31, 31)"
                let color2 = "rgb(191, 143, 143)"
                let color = color2
                if(hasUpgrade("c",61)) color = color1
                if(player.c.points.gte(tmp.c.upgrades[61].cost)&&!hasUpgrade("c",61)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return (player.a.vc2.gte(5)||player.dm.ec2.gte(5))}
        },
        63: {
            title: "Equalize",
            description: "<i>Faith</i> and <i>Disbelief</i> has the exact same gain, but the price for Purified VCs will also increase.",
            cost: new Decimal(1e51),
            style: {"background"() {
                let color1 = "rgb(209, 31, 31)"
                let color2 = "rgb(191, 143, 143)"
                let color = color2
                if(hasUpgrade("c",63)) color = color1
                if(player.c.points.gte(tmp.c.upgrades[63].cost)&&!hasUpgrade("c",63)) {
                    color = "linear-gradient("+color2+","+color1+")"
                }
                return color
            }},
            unlocked() {return false}
        },
    }
})

addLayer("a", {
    tabFormat: {
        Challenges: {
            content: [
                ["display-text", function() {
                    unlockReq = "Next challenge unlocks at <h2>"+format(tmp.a.challengeUnlockCon)+"</h2> Unstable Dust.<br><br>"
                    return unlockReq
                }],
                "challenges","blank","blank",
                "milestones"
            ]
        },
        Purification: {
            /*aaa: [
                ["display-text", function() {
                    return "You have "+colorText("h3",tmp.c.colorvc,formatWhole(player.c.vc))+" Virtuous Crystal"+(player.c.vc.eq(1)?"":"s")+". (+"+formatWhole(upgradeEffect("c",21))+"/s)"
                }],"blank",
                ["display-text", function() {
                    return "You have "+format(0)+" Purification Power, which translates to +"+format(0)+"% of extra VC production."
                }], "blank",
            ],*/
            content: [
                ["display-text", function() {
                    return "You have "+colorText("h3",tmp.c.colorvc,formatWhole(player.c.vc))+" Virtuous Crystal"+(player.c.vc.eq(1)?"":"s")+". (+"+formatWhole(upgradeEffect("c",21))+"/s)"
                }],"blank",
                ["display-text", function() {
                    return "You have <h2>"+formatWhole(tmp.a.vppCount)+"</h2> Virtuous Purification Power, which translates to <h3>+"+formatWhole(tmp.a.vppEffect.mul(100))+"</h3>% of extra VC production."
                }], "blank",
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Virtuous<br>Crystal<sup>1</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(tmp.a.vc1Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.a.vc1)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",11]
                ], {'width':'750px','height':'60px', 'background':'rgba(18, 187, 40, 0.25)'}],
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Virtuous<br>Crystal<sup>2</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(tmp.a.vc2Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.a.vc2)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",12]
                ], {'width':'750px','height':'60px', 'background':'rgba(18, 187, 40, 0.4)'}],
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Virtuous<br>Crystal<sup>3</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(1)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(0)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",13]
                ], {'width':'750px','height':'60px', 'background':'rgba(18, 187, 40, 0.25)'}],
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Virtuous<br>Crystal<sup>4</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(1)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(0)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",14]
                ], {'width':'750px','height':'60px', 'background':'rgba(18, 187, 40, 0.4)'}],
            ],
            unlocked() {return hasChallenge("a",11)}
        }
    },
    name: "Angelic", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: -1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["c"],
    infoboxes: {
        introBox: {
            title: "",
            body() {
                return ""
            }
        }
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        challengeCompletion: 0,
        vc1: new Decimal(0), // Purified VC^1
        vc1Bought: 0,
        vc2: new Decimal(0), // Purified VC^1
        vc2Bought: 0,
        vpp: new Decimal(0), // Virtuous Purification Power
        ch2Unlocked: false,
        inCh2Time: 0
    }},
    color: "rgb(252, 244, 132)",
    requires: new Decimal(5e14), // Can be a function that takes requirement increases into account
    resource: "Angelic Particles", // Name of prestige currency
    resourceSingular: "Angelic Particle",
    baseResource: "Virtuous Crystals", // Name of resource prestige is based on
    baseAmount() {return player.c.vc}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0, // Prestige currency exponent
    update(diff) {
        if(!player.a.unlocked) tmp.a.instantUnlockLayer
        if(!player.a.ch2Unlocked) tmp.a.challenge2Unlock
        tmp.a.challengeCount
        if(player.a.vc2.gte(1)) player.a.vc1 = player.a.vc1.add(tmp.a.vc1Gain.mul(diff))
        if(inChallenge("a",12)) player.a.inCh2Time = player.a.inCh2Time + diff
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasMilestone("c",26)},
    doReset(resettingLayer) {
        
    },

    canReset: false,

    instantUnlockLayer() {
        if(player.c.vc.gte(5e14)) player.a.unlocked = true
        return
    },

    challengeCount() {
        player.a.challengeCompletion = challengeCompletions("a",11)+challengeCompletions("a",12)//+challengeCompletions("a",21)+challengeCompletions("a",22)
        return
    },

    challengeUnlockCon() {
        let req = new Decimal("1e140")
        if(tmp.a.challenges[12].unlocked) req = new Decimal("1e240")
        return req
    },

    challenge2Unlock() {
        if(player.c.ud.gte("1e140")) player.a.challenge2Unlock = true
        return
    },

    // Purification #################################################################################################
    vppCount() {
        let count = player.a.vc1.mul(tmp.a.vc1Mult)
        if(inChallenge("a",12)||inChallenge("dm",12)) count = new Decimal(0)
        return count
    },

    vppEffect() {
        let eff = tmp.a.vppCount
        return eff
    },

    vc1Gain() { // this only triggers when having more than 1 VC^2
        let count = player.a.vc2.mul(tmp.a.vc2Mult)
        return count
    },

    vc1Mult() {
        let mult = new Decimal(1)
        if(hasChallenge("a",12)) mult = mult.mul(challengeEffect("a",12))
        if(hasUpgrade("c",22)) mult = mult.mul(upgradeEffect("c",22))
        return mult
    },

    vc2Mult() {
        let mult = new Decimal(1)
        return mult
    },

    vc1Cost() {
        let startCost = new Decimal(2e15)
        let cost = startCost.mul(Decimal.pow(3,player.a.vc1Bought))
        return cost
    },

    vc2Cost() {
        let startCost = new Decimal(2.5e25)
        let cost = startCost.mul(Decimal.pow(12,player.a.vc2Bought))
        return cost
    },

    challenges: {
        11: {
            name: "Weakling Nullifier",
            challengeDescription: "Disable the gain of Weakling Dust, the 4th EC effect does nothing.",
            goalDescription: "Reach 1.2e34 Mentality.",
            rewardDescription: "Unlocks Virtuous Crystal Purification. Mentality gain ^1.1.",
            canComplete: function() {return player.points.gte(1.2e34)},
            rewardEffect: 1.1
        },
        12: {
            name: "God's Punishment",
            challengeDescription: "Your Crystal Shards, total Crystal Shards, VC, and EC will be reset. Crystal Shards gain is now ^0.5 and disables the gain of EC and its effects. The 7th VC effect and Purified Crystals do nothing.",
            goalDescription: "Reach 1e52 Mentality",
            rewardDescription: "Unlocks Virtuous Crystal<sup>2</sup> Purification. ×3 Purified Virtuous Crystal<sup>1</sup> multiplier.",
            onEnter() {
                player.c.points = new Decimal(0)
                player.c.vc = new Decimal(0)
                player.c.ec = new Decimal(0)
                player.c.total = new Decimal(0)
                player.a.inCh2Time = 0
            },
            canComplete: function() {return player.points.gte(1e52)},
            unlocked() {return player.a.challenge2Unlock},
            rewardEffect: 3
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 Challenge Completion",
            effectDescription: "Weakling upgrades are no longer reset when entering/exiting challenges.",
            done() {return player.a.challengeCompletion >= 1}
        }
    },

    clickables: {
        11: {
            title: "Buy",
            display() {return "Cost: "+format(tmp.a.vc1Cost)+" VC"},
            canClick() {return player.c.vc.gte(tmp.a.vc1Cost)},
            onClick() {
                player.c.vc = player.c.vc.sub(tmp.a.vc1Cost)
                player.a.vc1 = player.a.vc1.add(1)
                player.a.vc1Bought++
            },
            onHold() {
                player.c.vc = player.c.vc.sub(tmp.a.vc1Cost)
                player.a.vc1 = player.a.vc1.add(1)
                player.a.vc1Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color = color2
                if(tmp.a.clickables[11].canClick) color = color1
                return color
            }}
        },
        12: {
            title() {
                if(hasChallenge("a",12)) return "Buy"
                return "Locked"
            },
            display() {
                if(hasChallenge("a",12)) return "Cost: "+format(tmp.a.vc2Cost)+" EC"
                return ""
            },
            canClick() {
                if(hasChallenge("a",12)) return player.c.vc.gte(tmp.a.vc2Cost)
                return false
            },
            onClick() {
                player.c.vc = player.c.vc.sub(tmp.a.vc2Cost)
                player.a.vc2 = player.a.vc2.add(1)
                player.a.vc2Bought++
            },
            onHold() {
                player.c.vc = player.c.vc.sub(tmp.a.vc2Cost)
                player.a.vc2 = player.a.vc2.add(1)
                player.a.vc2Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color3 = "rgb(70, 124, 77)"
                let color = color3
                if(hasChallenge("a",12)) color = color2
                if(tmp.a.clickables[12].canClick) color = color1
                return color
            }}
        },
        13: {
            title() {
                return "Locked"
            },
            display() {
                return ""
            },
            canClick: false,
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color3 = "rgb(70, 124, 77)"
                let color = color3
                if(tmp.a.clickables[13].canClick) color = color1
                return color
            }}
        },
        14: {
            title() {
                return "Locked"
            },
            display() {
                return ""
            },
            canClick: false,
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color3 = "rgb(70, 124, 77)"
                let color = color3
                if(tmp.a.clickables[14].canClick) color = color1
                return color
            }}
        },
    }
})

addLayer("dm", {
    tabFormat: {
        Challenges: {
            content: [
                ["display-text", function() {
                    unlockReq = "Next challenge unlocks at <h2>"+format(tmp.dm.challengeUnlockCon)+"</h2> Unstable Dust.<br><br>"
                    return unlockReq
                }],
                "challenges","blank","blank",
                "milestones"
            ]
        },
        Purification: {
            content: [
                ["display-text", function() {
                    return "You have "+colorText("h3",tmp.c.colorec,formatWhole(player.c.ec))+" Virtuous Crystal"+(player.c.ec.eq(1)?"":"s")+". (+"+formatWhole(upgradeEffect("c",41))+"/s)"
                }],"blank",
                ["display-text", function() {
                    return "You have <h2>"+formatWhole(tmp.dm.eppCount)+"</h2> Evil Purification Power, which translates to <h3>+"+formatWhole(tmp.dm.eppEffect.mul(100))+"%</h3> of extra EC production."
                }], "blank",
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Evil<br>Crystal<sup>1</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(tmp.dm.ec1Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.dm.ec1)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",11]
                ], {'width':'750px','height':'60px', 'background':'rgba(217, 55, 250, 0.2)'}],
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Evil<br>Crystal<sup>2</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(tmp.dm.ec2Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.dm.ec2)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",12]
                ], {'width':'750px','height':'60px', 'background':'rgba(217, 55, 250, 0.35)'}],
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Evil<br>Crystal<sup>3</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(1)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(0)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",13]
                ], {'width':'750px','height':'60px', 'background':'rgba(217, 55, 250, 0.2)'}],
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Evil<br>Crystal<sup>4</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(1)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(0)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",14]
                ], {'width':'750px','height':'60px', 'background':'rgba(217, 55, 250, 0.35)'}],
            ],
            unlocked() {return hasChallenge("dm",11)}
        }
    },
    name: "Demonic", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["c"],
    infoboxes: {
        introBox: {
            title: "",
            body() {
                return ""
            }
        }
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        challengeCompletion: 0,
        ec1: new Decimal(0), // Purified EC^1
        ec1Bought: 0,
        ec2: new Decimal(0), // Purified EC^2
        ec2Bought: 0,
        epp: new Decimal(0), // Evil Purification Power
        ch2Unlocked: false,
        inCh2Time: 0
    }},
    color: "rgb(168, 26, 69)",
    requires: new Decimal(1e15), // Can be a function that takes requirement increases into account
    resource: "Demonic Particles", // Name of prestige currency
    resourceSingular: "Demonic Particle",
    baseResource: "Evil Crystals", // Name of resource prestige is based on
    baseAmount() {return player.c.ec}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0, // Prestige currency exponent
    update(diff) {
        if(!player.dm.unlocked) tmp.dm.instantUnlockLayer
        if(!player.dm.ch2Unlocked) tmp.dm.challenge2Unlock
        tmp.dm.challengeCount
        if(player.dm.ec2.gte(1)) player.dm.ec1 = player.dm.ec1.add(tmp.dm.ec1Gain.mul(diff))
        if(inChallenge("dm",12)) player.dm.inCh2Time = player.dm.inCh2Time + diff
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasMilestone("c",26)},
    doReset(resettingLayer) {

    },

    canReset: false,

    instantUnlockLayer() {
        if(player.c.ec.gte(1e15)) player.dm.unlocked = true
        return
    },

    challengeCount() {
        player.dm.challengeCompletion = challengeCompletions("dm",11)+challengeCompletions("dm",12)//+challengeCompletions("dm",21)+challengeCompletions("dm",22)
        return
    },

    challengeUnlockCon() {
        let req = new Decimal("1e140")
        if(tmp.dm.challenges[12].unlocked) req = new Decimal("1e240")
        return req
    },

    challenge2Unlock() {
        if(player.c.ud.gte("1e140")) player.dm.challenge2Unlock = true
        return
    },

    // Purification
    eppCount() {
        let count = player.dm.ec1.mul(tmp.dm.ec1Mult)
        if(inChallenge("a",12)||inChallenge("dm",12)) count = new Decimal(0)
        return count
    },

    eppEffect() {
        let eff = tmp.dm.eppCount
        return eff
    },

    ec1Gain() { // this only triggers when having more than 1 EC^2
        let count = player.dm.ec2.mul(tmp.dm.ec2Mult)
        return count
    },

    ec1Mult() {
        let mult = new Decimal(1)
        if(hasChallenge("dm",12)) mult = mult.mul(challengeEffect("dm",12))
        if(hasUpgrade("c",42)) mult = mult.mul(upgradeEffect("c",42))
        return mult
    },

    ec2Mult() {
        let mult = new Decimal(1)
        return mult
    },

    ec1Cost() {
        let startCost = new Decimal(5e15)
        let cost = startCost.mul(Decimal.pow(3,player.dm.ec1Bought))
        return cost
    },

    ec2Cost() {
        let startCost = new Decimal(1e26)
        let cost = startCost.mul(Decimal.pow(12,player.dm.ec2Bought))
        return cost
    },

    challenges: {
        11: {
            name: "Weakling Amplifier",
            challengeDescription: "Weakling Dust effect is now ^2. The 4th, 5th, 8th VC effects, and 1st UD milestone are disabled.",
            goalDescription: "Reach 1e11 Weakling Dust.",
            rewardDescription: "Unlocks Evil Crystal Purification. The first UD Effect is further reduced to ^0.7.",
            canComplete: function() {return player.w.points.gte(1e11)},
            rewardEffect: 0.7
        },
        12: {
            name: "Virtue Eradication",
            challengeDescription: "Your Crystal Shards, total Crystal Shards, VC, and EC will be reset. Crystal Shards gain is now ^0.5 and disables the gain of VC and its effects. The 7th EC effect and Purified Crystals do nothing.",
            goalDescription: "Reach 5e31 Weakling Dust.",
            rewardDescription: "Unlocks Evil Crystal<sup>2</sup> Purification. ×3 Purified Evil<br>Crystal<sup>1</sup> multiplier.",
            onEnter() {
                player.c.points = new Decimal(0)
                player.c.vc = new Decimal(0)
                player.c.ec = new Decimal(0)
                player.c.total = new Decimal(0)
                player.dm.inCh2Time = 0
            },
            canComplete: function() {return player.w.points.gte(5e31)},
            unlocked() {return player.dm.challenge2Unlock},
            rewardEffect: 3
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 Challenge Completion",
            effectDescription: "Weakling upgrades are no longer reset when entering/exiting challenges.",
            done() {return player.dm.challengeCompletion >= 1}
        }
    },

     clickables: {
        11: {
            title: "Buy",
            display() {return "Cost: "+format(tmp.dm.ec1Cost)+" EC"},
            canClick() {return player.c.ec.gte(tmp.dm.ec1Cost)},
            onClick() {
                player.c.ec = player.c.ec.sub(tmp.dm.ec1Cost)
                player.dm.ec1 = player.dm.ec1.add(1)
                player.dm.ec1Bought++
            },
            onHold() {
                player.c.ec = player.c.ec.sub(tmp.dm.ec1Cost)
                player.dm.ec1 = player.dm.ec1.add(1)
                player.dm.ec1Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color = color2
                if(tmp.dm.clickables[11].canClick) color = color1
                return color
            }}
        },
        12: {
            title() {
                if(hasChallenge("dm",12)) return "Buy"
                return "Locked"
            },
            display() {
                if(hasChallenge("dm",12)) return "Cost: "+format(tmp.dm.ec2Cost)+" EC"
                return ""
            },
            canClick() {
                if(hasChallenge("dm",12)) return player.c.ec.gte(tmp.dm.ec2Cost)
                return false
            },
            onClick() {
                player.c.ec = player.c.ec.sub(tmp.dm.ec2Cost)
                player.dm.ec2 = player.dm.ec2.add(1)
                player.dm.ec2Bought++
            },
            onHold() {
                player.c.ec = player.c.ec.sub(tmp.dm.ec2Cost)
                player.dm.ec2 = player.dm.ec2.add(1)
                player.dm.ec2Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color3 = "rgb(133, 34, 153)"
                let color = color3
                if(hasChallenge("dm",12)) color = color2
                if(tmp.dm.clickables[12].canClick) color = color1
                return color
            }}
        },
        13: {
            title() {
                return "Locked"
            },
            display() {
                return ""
            },
            canClick: false,
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color3 = "rgb(133, 34, 153)"
                let color = color3
                if(tmp.dm.clickables[13].canClick) color = color1
                return color
            }}
        },
        14: {
            title() {
                return "Locked"
            },
            display() {
                return ""
            },
            canClick: false,
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(217, 55, 250)"
                let color2 = "rgb(225, 151, 240)"
                let color3 = "rgb(133, 34, 153)"
                let color = color3
                if(tmp.dm.clickables[14].canClick) color = color1
                return color
            }}
        },
    }
})

addLayer("d", {
    name: "Dev Zone", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    //row: "side", // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    color: "#ffffffff",
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Dev Options")
    },
    tabFormat: {
        DevSpeed:{
            content: [["display-text", "Welcome to the Dev Center! In here, you can fiddle with some settings regarding the game!"],
            "blank",
            ["clickables",[1,2]]]
        },
        Autobuyers: {
            content: [["display-text", "<h3 style='text-shadow:0px 0px 10px;'>Here are some parameters for automating buyables.</h3>"],
            "blank",
            ["display-text", function() {
                return "<b style='text-shadow:0px 0px 10px;'>Mentality Strengthen</b> Count: "+getBuyableAmount("w",11)+
                "<br><b style='text-shadow:0px 0px 10px;'>Weakling Strengthen</b> Count: "+getBuyableAmount("w",12)+
                "<br><br>Current Mentality: "+format(player.w.MSStatus.points)+
                "<br>Which is enough to buy "+format(player.w.MSStatus.buyCount.sub(player.w.MSStatus.bought))+" <b style='text-shadow:0px 0px 10px;'>Mentality Strengthen</b> at once."+
                "<br>along with the total cost of "+format(tmp.w.MSCostDifference)+"."+
                "<br><br>Current Weakling Dust: "+format(player.w.WSStatus.points)+
                "<br>Which is enough to buy "+format(player.w.WSStatus.buyCount.sub(player.w.WSStatus.bought))+" <b style='text-shadow:0px 0px 10px;'>Weakling Strengthen</b> at once."+
                "<br>along with the total cost of "+format(tmp.w.WSCostDifference)+"."
                //"Projected chance for <b style=\"color: #d937faff;\">Evil Crystal</b>: "+format(one.sub(nonEvil))+"%.<br>"+
                //"Projected chance for Non-Evil Crystal: "+format(nonEvil)+"%."
            }],
            "blank",
            ["display-text",function() {
                return "Currently, the test value is:"+
                "<br><h1 style=\"color: rgb(62, 194, 211);\"> "+format(1)+" </h1>"
            }],
            "blank",
            "milestones"
            ]
        },
    },
    startData() {return {
        unlocked: true,
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
        if(getClickableState("d",22)) speed = new Decimal(0.1)
        if(getClickableState("d",23)) speed = new Decimal(0.01)
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
        },
        22: {
            title: "0.1x speed",
            display: "Gives 0.1x Dev Speed.",
            onClick() {
                if(getClickableState("d",22)==1) setClickableState("d",22,0)
                else setClickableState("d",22,1)
            },
            canClick() {
                if (getClickableState("d",11)==1 || getClickableState("d",12)==1) return false
                else return true
            },
            unlocked: true
        },
        23: {
            title: "0.01x speed",
            display: "Gives 0.01x Dev Speed.",
            onClick() {
                if(getClickableState("d",23)==1) setClickableState("d",23,0)
                else setClickableState("d",23,1)
            },
            canClick() {
                if (getClickableState("d",11)==1 || getClickableState("d",12)==1) return false
                else return true
            },
            unlocked: true
        },
    },
    milestones: {
        0: {
            requirementDescription: "30+ Crystal Shards",
            effectDescription: "Unlocks automation for <b>Mentality Strengthen</b> and <b>Weakling Strengthen</b>.",
            toggles:[["d","autoStrengthen"]],
            done() {return false}
        }
    }
})
