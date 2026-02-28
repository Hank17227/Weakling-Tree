addLayer("w", {
    tabFormat: [
        ["infobox","introBox"],
        "blank",
        "buyables",
        "blank",
        "blank",
        "main-display",
        "resource-display",
        //"prestige-button",
        "upgrades"
    ],
    name: "Weaklings", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        MSStatus: { // Stats for Mentality Strengthen Cost Calculation
            points: new Decimal(0),
            base: new Decimal(10),
            constant: new Decimal(10),
            factor: new Decimal(5),
            offset: new Decimal(0),
            scaleStart: [new Decimal(10)],
            scaledFactor: [new Decimal(15)],
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
            scaleStart: [new Decimal(12), new Decimal(24)],
            scaledFactor: [new Decimal(6), new Decimal(12)],
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
        gain = gain.times(tmp[this.layer].buyables[12].effect)
        gain = gain.times(hasUpgrade(this.layer,11)?3:1)
        gain = gain.times(hasUpgrade(this.layer,12)?4:1)
        gain = gain.times(hasUpgrade(this.layer,21)?upgradeEffect(this.layer,21):1)
        gain = gain.times(hasUpgrade(this.layer,24)?upgradeEffect(this.layer,24):1)
        gain = gain.times(hasMilestone("c",0)?3:1)
        gain = gain.div(player.c.ude)
        gain = gain.times(hasMilestone("c",2)?tmp.c.mwConvert:1)
        gain = gain.times(hasMilestone("c",4)?3:1)
        gain = gain.times(hasMilestone("c",6)?tmp.c.crystalsToWeakling:1)
        gain = gain.times(hasMilestone("c",44)?tmp.c.vcToWeakling:1)
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

    doReset(resettingLayer) {
        let keep = []
        if(hasMilestone("c",41) && resettingLayer=="c") keep.push("upgrades")
        if(layers[resettingLayer].row > this.row) layerDataReset("w",keep)
    },

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
        player.devSpeed = new Decimal(1)
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
                let scale = [new Decimal(5), new Decimal(15)]
                let scaledCost = [
                    base.mul(scale[0].pow(x)),
                    base.mul(scale[0].pow(9)).mul(scale[1].pow(x.sub(9)))
                ]
                let consume = scaledCost[0]
                if(x.gte(10)) consume = scaledCost[1]
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
            buyMax() {
                if (!this.canAfford()) return
                player.points = player.points.sub(tmp.w.MSCostDifference)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(player.w.MSStatus.buyCount).sub(player.w.MSStatus.bought))
            },
            display() {return "Double the Mentality gain!\n"+
                "Currently: "+format(this.effect())+"×\n\n"+
                "Cost: "+format(this.cost())+" Points"
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
                let scale = [new Decimal(3), new Decimal(6), new Decimal(12)]
                let scaledCost = [
                    base.mul(scale[0].pow(x)),
                    base.mul(scale[0].pow(11)).mul(scale[1].pow(x.sub(11))),
                    base.mul(scale[0].pow(11)).mul(scale[1].pow(12)).mul(scale[2].pow(x.sub(23)))
                ]
                let consume = scaledCost[0]
                if(x.gte(12)&&x.lt(24)) consume = scaledCost[1]
                if(x.gte(24)) consume = scaledCost[2]
                return consume
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
            buyMax() {
                if(!this.canAfford()) return;
                player.w.points = player.w.points.sub(tmp.w.WSCostDifference)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(player.w.WSStatus.buyCount).sub(player.w.WSStatus.bought))
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
            unlocked() {
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
        Milestones: {
            content:["main-display",
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
                return "You have <b style='color: "+tmp.w.color+"; text-shadow:0px 0px 10px;'>"+format(player.w.points)+"</b> Weakling Dust."+
                " (+"+format(tmp.w.passiveGeneration)+"/s)"
            }],
            "blank",
            ["microtabs","goals"]
            ]
        },
        Crystals: {
            unlocked() {return hasMilestone("c", 9)},
            content: [["infobox","introBox"],
            "main-display",["clickables",[1]],
            "blank", "blank",
            ["row", [
                ["column", [
                    "blank",
                    ["display-text", function() {
                        return "You have "+colorText("h2",tmp.c.colorvc,format(player.c.vc, 0))+" Virtuous Crystal"+(player.c.vc.eq(1)?"":"s")+"."+
                        "<br>They have the following effects:"
                        //+vcEcMani(30,30)
                    }],
                    "blank",
                    "h-line",
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
                        if(hasMilestone("c",45)) stat = vcEffectsList(new Decimal(3),new Decimal(6),true)
                        return stat
                    }]
                ], {'width': '350px', 'max-height': '700px',
                    'background-color': 'rgba(18, 187, 40, 0.25)',
                }],
                ["column", [
                    "blank",
                    ["display-text", function() {
                    return "You have "+colorText("h2",tmp.c.colorec,format(player.c.ec, 0))+" Evil Crystal"+(player.c.ec.eq(1)?"":"s")+"."+
                    "<br>They have the following effects:"
                    }],
                    "blank",
                    "h-line",
                    "blank",
                    ["display-text", function() {
                        let stat = ecEffectsList()
                        if(hasMilestone("c",70)) stat = ecEffectsList(new Decimal(0),new Decimal(1))
                        if(hasMilestone("c",71)) stat = ecEffectsList(new Decimal(0),new Decimal(2))
                        if(hasMilestone("c",72)) stat = ecEffectsList(new Decimal(0),new Decimal(3))
                        if(hasMilestone("c",73)) stat = ecEffectsList(new Decimal(0),new Decimal(4))
                        if(hasMilestone("c",74)) stat = ecEffectsList(new Decimal(0),new Decimal(5))
                        if(hasMilestone("c",75)) stat = ecEffectsList(new Decimal(0),new Decimal(6),true)
                        return stat
                    }]
                ], {'width': '350px', 'max-height': '700px', 
                    'background-color': 'rgba(217, 55, 250, 0.2)'
                }]
            ]]
        ]}
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
                colorText("b",tmp.c.colorvc,"Virtuous Crystal")+" for your first combination."
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
    }},
    color: "#d11f1fff",
    colorvc: "rgb(18, 187, 41)", // color for Virtuous Crystals
    colorec: "#d937faff", // color for Evil Crystals
    requires: new Decimal(2e10), // Can be a function that takes requirement increases into account
    resource: "Crystal Shards", // Name of prestige currency
    resourceSingular: "Crystal Shard",
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
        if(player.c.vc.gte(1)) mult = mult.mul(tmp.c.vcToCrystalShards)
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
        if(hasMilestone("c",23)) eff = eff.pow(1.2)
        return eff
    },

    udEffect2Desc() {
        return " and <b>Mentality</b> gain by <h3><b>"+format(player.c.ude.pow(0.4))+"</b></h3>."
    },

    udGainMult() {
        let mult = new Decimal(1)
        if(player.c.ec.gte(1)) mult = mult.mul(tmp.c.ecToUD)
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

    udNerfWSCost() {
        let mult = player.c.ud.pow(0.1).add(1)
        return mult
    },

    crystalsToWeakling() {
        let mult = new Decimal(1)
        if (player.c.points.gte(2)) {mult = player.c.points.log10().mul(6.4)}
        return mult
    },

    crystalsToMentality() {
        let mult = new Decimal(1)
        if (player.c.points.gte(2)) {mult = player.c.points.log10().mul(3.1)}
        return mult
    },

    crystalCost() {
        let cost = new Decimal(20)
        if(hasMilestone("c",73)) cost = cost.add(player.c.ec.sub(24))
        return cost
    },

    vcToCrystalShards() {
        let mult = player.c.vc.add(1).pow(0.5)
        if(hasMilestone("c",74)) mult = mult.div(tmp.c.ecToVCEffects)
        return mult
    },

    vcToMentality() {
        let mult = player.c.vc.sub(1).pow(1.2).div(3).add(1)
        if(hasMilestone("c",74)) mult = mult.div(tmp.c.ecToVCEffects)
        return mult
    },

    vcToWeakling() {
        let mult = player.c.vc.sub(10).pow(1.5).div(7.5).add(2).max(1)
        if(hasMilestone("c",74)) mult = mult.div(tmp.c.ecToVCEffects)
        return mult
    },

    ecToUD() {
        let mult = player.c.ec.mul(2).add(1).pow(0.5)
        return mult
    },

    ecToWeaklingEffect() {
        let mult = player.c.ec.sub(1).pow(0.9).div(0.6666).add(1.404)
        return mult
    },

    ecToVCEffects() {
        let mult = player.c.ec.sub(40).pow(0.25).add(1.2).pow(0.2)
        return mult
    },

    /*test() {
        let a = new Decimal(crystalTypeDecider())
        return a
    },*/

    update(diff) {
        player.c.ude = tmp.c.udEffect
        player.c.ud = tmp.c.udBase.mul(tmp.c.udGainMult)
        
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
            requirementDescription: "7 Crystal Shards",
            effectDescription: "Triples Weakling Dust gain, again.",
            done() {return player.c.points.gte(7)},
        },
        5: {
            requirementDescription: "10 Crystal Shards",
            effectDescription() {
                return "Boosts Mentality based on Weakling Dusts.<br>"+
                "Currently: ×"+format(tmp.c.wmConvert)+"."
            },
            done() {return player.c.points.gte(10)},
        },
        6: {
            requirementDescription: "15 Crystal Shards",
            effectDescription() {
                return "Boosts Mentality and Weakling Dusts based on Crystal Shards.<br>"+
                "Currently: ×"+format(tmp.c.crystalsToMentality)+" to Mentality, ×"+format(tmp.c.crystalsToWeakling)+" to Weakling Dust."
            },
            done() {return player.c.points.gte(15)},
        },
        9: {
            requirementDescription: "20 Crystal Shards",
            effectDescription: "Unlocks <b>Crystals</b> tab.",
            done() {return player.c.points.gte(20)},
        },
        /*
        10: {
            requirementDescription: "9e999 Crystal Shards",
            effectDescription: "Unlocks automation for <b>Mentality Strengthen</b> and <b>Weakling Strengthen</b>.",
            toggles:[["c","autoStrengthen"]],
            done() {return player.c.points.gte(9e999)},
        },*/
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
                return "Boosts Unstable Dust gain based on the sum of Virtuous Crystals and Evil Crystals."
            },
            done() {return player.c.ud.gte(1e12)},
            unlocked() {return hasMilestone("c",71)}
        },
        25: {
            requirementDescription: "1e15 Unstable Dust",
            effectDescription() {
                return "Unlocks a new row of Weakling Upgrades."
            },
            done() {return player.c.ud.gte(1e15)},
            unlocked() {return hasMilestone("c",71)}
        },
        26: {
            requirementDescription: "1e18 Unstable Dust",
            effectDescription() {
                return "Weakling Dust and Unstable Dust boost each other."
            },
            done() {return player.c.ud.gte(1e18)},
            unlocked() {return hasMilestone("c",71)}
        },
        27: {
            requirementDescription: "1e33 Unstable Dust",
            effectDescription() {
                return "Unlocks two new layers."
            },
            done() {return player.c.ud.gte(1e33)},
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
        /*
        ?: {
            requirementDescription: "5 Crystals",
            effectDescription: "Unlocks a new row of upgrades on Weakling.",
            done() {return player.c.points.gte(5)},
            unlocked() {return hasMilestone(this.layer, 3)}
        },*/
    },
    clickables: {
        11: {
            title() {
                return "<h2>Condense "+tmp.c.crystalCost+" Crystal Shards into a Crystal<br></h2>"
            },
            display: "<h3>Note: This forces a Crystal Shards reset.</h3>",
            onClick() {
                player.c.points = player.c.points.sub(tmp.c.crystalCost)
                doReset("c", force=true)
                crystalTypeDecider()
            },
            canClick() {
                return player.c.points.gte(tmp.c.crystalCost)
            },
            unlocked: true,
            style: {'width': '400px', 'height': '100px'}
        },
        
        21: { // a replication of toggle but with unlock condition
            title() {
                if(getClickableState("c",21)==1) return "ON"
                return "OFF"
            },
            unlocked() {return player.c.vc.gte(5)},
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
            ["clickables",[1]]]
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
                "<br><h1 style=\"color: rgb(62, 194, 211);\"> "+format(player.w.MSStatus.constant)+" </h1>"
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
