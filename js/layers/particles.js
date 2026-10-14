addLayer("p", {
    name: "Particles", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: "side", // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    position: 1,
    color: "rgb(220, 62, 212)",
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Particles")
    },
    tabFormat: [["display-text",function() {return "You have "+layerText("h2","p",formatWhole(player.points))+" "+modInfo.pointsName+"."}],
    ,["blank","25px"],["clickable",11],["blank","25px"],
    ["display-text",function() {return "You are gaining "+layerText("h2","p",formatWhole(getPointGen()))+" "+modInfo.pointsName+" per second (PaPS)."}],
    ["blank","15px"],["microtabs","mainUI"]],
    microtabs: {
        mainUI: {
            "Gatherers": {
                content: [
                    ["row", [
                        ["raw-html",function() {
                            let enhText = ""; if(hasUpgrade("p",21)) enhText = " | Enh "+formatWhole(getUpgCount("p",21,25))
                            return "<div style='width: 210px; display: block'>"+
                            "<h2 style='display: block; text-align: left'>Dust Collector</h2>"+
                            "<span style='display: block; text-align: left; margin-bottom: 10px'>+"+format(buyableBaseEffect("p",11))+" PaPS / Lv"+enhText+"</span>"+
                            "<span style='display: block; text-align: left'>Lv<b style='font-size: 25px'>"+formatWhole(getBuyableAmount("p",11))+"</b> >> +"+format(buyableEffect("p",11))+"</span>"+"</div>"
                        }],["blank",["100px","0px"]],["buyable",11],
                    ], {'width':'550px','height':'120px', 'background':'rgba(217, 55, 250, 0.35)'}],
                    ["row", [
                        ["raw-html",function() {
                            let enhText = ""; if(hasUpgrade("p",31)) enhText = " | Enh "+formatWhole(getUpgCount("p",31,35))
                            return "<div style='width: 210px; display: block'>"+
                            "<h2 style='display: block; font-size: 19.5px; text-align: left'>Stardust Fragment</h2>"+
                            "<span style='display: block; text-align: left; margin-bottom: 10px'>+"+formatWhole(buyableBaseEffect("p",12))+" PaPS / Lv"+enhText+"</span>"+
                            "<span style='display: block; text-align: left'>Lv<b style='font-size: 25px'>"+formatWhole(getBuyableAmount("p",12))+"</b> >> +"+format(buyableEffect("p",12))+"</span>"+"</div>"
                        }],["blank",["100px","0px"]],["buyable",12],
                    ], {'width':'550px','height':'120px', 'background':'rgba(218, 185, 101, 0.5)'}],
                    ["row", [
                        ["raw-html",function() {
                            let enhText = ""; if(hasUpgrade("p",41)) enhText = " | Enh "+formatWhole(getUpgCount("p",41,45))
                            return "<div style='width: 210px; display: block'>"+
                            "<h2 style='display: block; text-align: left'>Starcloud</h2>"+
                            "<span style='display: block; text-align: left; margin-bottom: 10px'>+"+formatWhole(buyableBaseEffect("p",13))+" PaPS / Lv"+enhText+"</span>"+
                            "<span style='display: block; text-align: left'>Lv<b style='font-size: 25px'>"+formatWhole(getBuyableAmount("p",13))+"</b> >> +"+format(buyableEffect("p",13))+"</span>"+"</div>"
                        }],["blank",["100px","0px"]],["buyable",13],
                    ], {'width':'550px','height':'120px', 'background':'rgba(101, 200, 218, 0.5)'}],
                ]
            },
            "Enhances": {
                content: [
                    ["blank","5px"],
                    ["display-text",function() {return "<h2 style='color: yellow'>Hands of All Kind</h2>"}],
                    "blank",["column",["blank",["upgrades",[1]]],{'background':'rgba(255, 255, 40, 0.5)','width':'700px'}],"blank",
                    ["display-text",function() {return "<h2 style='color: rgb(217, 55, 250)'>Dust Collector Enhancement</h2>"}],
                    "blank",["column",["blank",["upgrades",[2]]],{'background':'rgba(217, 55, 250, 0.35)','width':'700px'}],"blank",
                    ["display-text",function() {return "<h2 style='color: rgb(218, 185, 101)'>Stardust Fragment Enhancement</h2>"}],
                    "blank",["column",["blank",["upgrades",[3]]],{'background':'rgba(218, 185, 101, 0.5)','width':'700px'}],"blank",
                    ["display-text",function() {return "<h2 style='color: rgb(101, 200, 218)'>Starcloud Enhancement</h2>"}],
                    "blank",["column",["blank",["upgrades",[4]]],{'background':'rgba(101, 200, 218, 0.5)','width':'700px'}],"blank",
                ],
                unlocked() {return getBuyableAmount("p",12).gte(1)}
            }
        }
    },
    startData() {return {
        unlocked: true,
        clickTime: 0,
    }},
    update(diff) {
        player.p.clickTime = player.p.clickTime+diff
    },

    clickables: {
        11: {
            title() {
                let getParticleText = "Click me to get a particle!"
                if(hasUpgrade("p",11)) getParticleText = "Click me to get "+formatWhole(this.tapPower())+" particles!"
                return getParticleText
            },
            tapPower() {
                let tp = new Decimal(1)
                if(hasUpgrade("p",11)) tp = tp.mul(10)
                if(hasUpgrade("p",12)) tp = tp.mul(5)
                if(hasUpgrade("p",14)) tp = tp.mul(upgradeEffect("p",14))
                if(hasUpgrade("p",15)) tp = tp.mul(upgradeEffect("p",15))
                return tp
            },
            onClick() {
                player.points = player.points.add(this.tapPower())
                player.p.clickTime = 0
            },
            canClick: true,
            style: {'width':'500px','border-radius':'10%','font-size':'1em'}
        }
    },
    buyables: {
        11: {
            bulk() {return new Decimal(1)},
            cost(x) {
                let base = new Decimal(10), scale = new Decimal(1.125), accel = new Decimal(1.1)
                consume = base.mul(scale.pow(x.pow(accel)))
                return consume
            },
            baseEffect() {
                let base = new Decimal(0.1)
                if(hasUpgrade("p",21)) base = base.mul(Decimal.pow(2,getUpgCount("p",21,25)))
                if(hasUpgrade("p",13)) base = base.mul(upgradeEffect("p",13))
                return base
            },
            effect(x) {
                let eff = new Decimal(0)
                let base = this.baseEffect()
                if(x.gt(0)) eff = eff.add(base.mul(x))
                return eff
            },
            canAfford() {return player.points.gte(this.cost())},
            buy() {
                if(!this.canAfford()) return
                cost = tmp[this.layer].buyables[this.id].cost
                player.points = player.points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            display() {
                let title = "<h1 style='font-size: 28px'>Buy "+formatWhole(this.bulk())+"</h1><br><br>"
                let costText = "<span style='font-size: 15px'>"+format(this.cost())+" P</span>"
                return title+costText
            },
            style: {'height':'100px','width':'120px','border-radius':'10%'},
        },
        12: {
            bulk() {return new Decimal(1)},
            cost(x) {
                let base = new Decimal(100), scale = new Decimal(1.127), accel = new Decimal(1.1)
                consume = base.mul(scale.pow(x.pow(accel)))
                return consume
            },
            baseEffect() {
                let base = new Decimal(1)
                if(hasUpgrade("p",31)) base = base.mul(Decimal.pow(2,getUpgCount("p",31,35)))
                if(hasUpgrade("p",13)) base = base.mul(upgradeEffect("p",13))
                return base
            },
            effect(x) {
                let eff = new Decimal(0)
                let base = this.baseEffect()
                if(x.gt(0)) eff = eff.add(base.mul(x))
                return eff
            },
            canAfford() {return player.points.gte(this.cost())},
            buy() {
                if(!this.canAfford()) return
                cost = tmp[this.layer].buyables[this.id].cost
                player.points = player.points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            display() {
                let title = "<h1 style='font-size: 28px'>Buy "+formatWhole(this.bulk())+"</h1><br><br>"
                let costText = "<span style='font-size: 15px'>"+format(this.cost())+" P</span>"
                return title+costText
            },
            style: {'height':'100px','width':'120px','border-radius':'10%'},
        },
        13: {
            bulk() {return new Decimal(1)},
            cost(x) {
                let base = new Decimal(1e4), scale = new Decimal(1.14), accel = new Decimal(1.1)
                consume = base.mul(scale.pow(x.pow(accel)))
                return consume
            },
            baseEffect() {
                let base = new Decimal(10)
                if(hasUpgrade("p",41)) base = base.mul(Decimal.pow(2,getUpgCount("p",41,45)))
                if(hasUpgrade("p",13)) base = base.mul(upgradeEffect("p",13))
                return base
            },
            effect(x) {
                let eff = new Decimal(0)
                let base = this.baseEffect()
                if(x.gt(0)) eff = eff.add(base.mul(x))
                return eff
            },
            canAfford() {return player.points.gte(this.cost())},
            buy() {
                if(!this.canAfford()) return
                cost = tmp[this.layer].buyables[this.id].cost
                player.points = player.points.sub(cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            display() {
                let title = "<h1 style='font-size: 28px'>Buy "+formatWhole(this.bulk())+"</h1><br><br>"
                let costText = "<span style='font-size: 15px'>"+format(this.cost())+" P</span>"
                return title+costText
            },
            style: {'height':'100px','width':'120px','border-radius':'10%'},
        },
    },
    milestones: {
    },
    upgrades: {
        11: {
            title: "Bigger Tap",
            description: "Tenfold the tap power.",
            currencyDisplayName: modInfo.pointsName,
            currencyInternalName: "points",
            cost: new Decimal(250),
        },
        12: {
            title: "Even Bigger Tap",
            description: "x5 the tap power.",
            currencyDisplayName: modInfo.pointsName,
            currencyInternalName: "points",
            cost: new Decimal(2500),
        },
        13: {
            title: "Tap Generator",
            description: "Clicking speeds up all gatherers production.",
            tooltip: "This effect will decrease overtime when idling.",
            effect() {
                let clickTime = player.p.clickTime, eff = new Decimal(3)
                eff = Decimal.pow(1/3,clickTime/5).mul(eff).max(1)
                if(hasUpgrade("p",14)) eff = eff.mul(2)
                return eff
            },
            effectDisplay() {return "x"+format(this.effect())},
            currencyDisplayName: modInfo.pointsName,
            currencyInternalName: "points",
            cost: new Decimal(2e4),
        },
        14: {
            title: "Tap Gatherer",
            description: "Each gatherer level boosts tap power at a reduced rate. Double the effect of Tap Generator.",
            effect() {
                let gathererLv = getBuyableAmount("p",11).add(getBuyableAmount("p",12)).add(getBuyableAmount("p",13))
                eff = gathererLv.pow(1/3).max(1)
                return eff
            },
            effectDisplay() {return "x"+format(this.effect())},
            currencyDisplayName: modInfo.pointsName,
            currencyInternalName: "points",
            cost: new Decimal(5e4),
        },
        15: {
            title: "Tap Enhancer",
            description: "Each gatherer enhancement boosts tap power. Unlock a prestige layer.",
            effect() {
                let gathererEnh = new Decimal(getUpgCount("p",21,45))
                eff = Decimal.pow(2,gathererEnh.pow(0.95))
                return eff
            },
            effectDisplay() {return "x"+format(this.effect())},
            currencyDisplayName: modInfo.pointsName,
            currencyInternalName: "points",
            cost: new Decimal(25e4),
        },
        21: {
            costPa: new Decimal(1000),
            reqCo: new Decimal(25), 
            fullDisplay() {
                let title = "<h3>Stardust Collector</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqCo)+" Dust Collector <br>Dust Collector now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let collectorReq = getBuyableAmount("p",11).gte(this.reqCo)
                let paReq = player.points.gte(this.costPa)
                return (collectorReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
        },
        22: {
            costPa: new Decimal(55e3),
            reqCo: new Decimal(50), 
            fullDisplay() {
                let title = "<h3>Particle Collector</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqCo)+" Dust Collector <br>Dust Collector now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let collectorReq = getBuyableAmount("p",11).gte(this.reqCo)
                let paReq = player.points.gte(this.costPa)
                return (collectorReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
        },
        23: {
            costPa: new Decimal(1e100),
            reqCo: new Decimal(100), 
            fullDisplay() {
                let title = "<h3>Stardust Collector</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqCo)+" Dust Collector <br>Dust Collector now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let collectorReq = getBuyableAmount("p",11).gte(this.reqCo)
                let paReq = player.points.gte(this.costPa)
                return (collectorReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
            unlocked: false
        },
        24: {
            costPa: new Decimal(1e100),
            reqCo: new Decimal(150), 
            fullDisplay() {
                let title = "<h3>Stardust Collector</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqCo)+" Dust Collector <br>Dust Collector now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let collectorReq = getBuyableAmount("p",11).gte(this.reqCo)
                let paReq = player.points.gte(this.costPa)
                return (collectorReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
            unlocked: false
        },
        25: {
            costPa: new Decimal(1e100),
            reqCo: new Decimal(200), 
            fullDisplay() {
                let title = "<h3>Stardust Collector</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqCo)+" Dust Collector <br>Dust Collector now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let collectorReq = getBuyableAmount("p",11).gte(this.reqCo)
                let paReq = player.points.gte(this.costPa)
                return (collectorReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
            unlocked: false
        },
        31: {
            costPa: new Decimal(5000),
            reqSF: new Decimal(25), 
            fullDisplay() {
                let title = "<h3>Stardust Shard</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqSF)+" Stardust Fragment <br>Stardust Fragment now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let sfReq = getBuyableAmount("p",12).gte(this.reqSF)
                let paReq = player.points.gte(this.costPa)
                return (sfReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
        },
        32: {
            costPa: new Decimal(5e5),
            reqSF: new Decimal(50), 
            fullDisplay() {
                let title = "<h3>Stardust Fabric</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqSF)+" Stardust Fragment <br>Stardust Fragment now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let sfReq = getBuyableAmount("p",12).gte(this.reqSF)
                let paReq = player.points.gte(this.costPa)
                return (sfReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
        },
        33: {
            costPa: new Decimal(5e100),
            reqSF: new Decimal(100), 
            fullDisplay() {
                let title = "<h3>Stardust Shard</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqSF)+" Stardust Fragment <br>Stardust Fragment now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let sfReq = getBuyableAmount("p",12).gte(this.reqSF)
                let paReq = player.points.gte(this.costPa)
                return (sfReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
            unlocked: false
        },
        34: {
            costPa: new Decimal(5e100),
            reqSF: new Decimal(150), 
            fullDisplay() {
                let title = "<h3>Stardust Shard</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqSF)+" Stardust Fragment <br>Stardust Fragment now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let sfReq = getBuyableAmount("p",12).gte(this.reqSF)
                let paReq = player.points.gte(this.costPa)
                return (sfReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
            unlocked: false
        },
        35: {
            costPa: new Decimal(5e100),
            reqSF: new Decimal(200), 
            fullDisplay() {
                let title = "<h3>Stardust Shard</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqSF)+" Stardust Fragment <br>Stardust Fragment now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let sfReq = getBuyableAmount("p",12).gte(this.reqSF)
                let paReq = player.points.gte(this.costPa)
                return (sfReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
            unlocked: false
        },
        41: {
            costPa: new Decimal(75e4),
            reqSC: new Decimal(25), 
            fullDisplay() {
                let title = "<h3>Starbubble</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqSC)+" Stardust Fragment <br>Stardust Fragment now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let scReq = getBuyableAmount("p",12).gte(this.reqSC)
                let paReq = player.points.gte(this.costPa)
                return (scReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
        },
        42: {
            costPa: new Decimal(1e100),
            reqSC: new Decimal(50), 
            fullDisplay() {
                let title = "<h3>Stardust Shard</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqSC)+" Stardust Fragment <br>Stardust Fragment now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let scReq = getBuyableAmount("p",12).gte(this.reqSC)
                let paReq = player.points.gte(this.costPa)
                return (scReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
            unlocked: false
        },
        43: {
            costPa: new Decimal(5e100),
            reqSC: new Decimal(100), 
            fullDisplay() {
                let title = "<h3>Stardust Shard</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqSC)+" Stardust Fragment <br>Stardust Fragment now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let scReq = getBuyableAmount("p",12).gte(this.reqSC)
                let paReq = player.points.gte(this.costPa)
                return (scReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
            unlocked: false
        },
        44: {
            costPa: new Decimal(5e100),
            reqSC: new Decimal(150), 
            fullDisplay() {
                let title = "<h3>Stardust Shard</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqSC)+" Stardust Fragment <br>Stardust Fragment now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let scReq = getBuyableAmount("p",12).gte(this.reqSC)
                let paReq = player.points.gte(this.costPa)
                return (scReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
            unlocked: false
        },
        45: {
            costPa: new Decimal(5e100),
            reqSC: new Decimal(200), 
            fullDisplay() {
                let title = "<h3>Stardust Shard</h3>"
                let description = "Requires: Lv"+formatWhole(this.reqSC)+" Stardust Fragment <br>Stardust Fragment now produce twice as more particles."
                let cost = "Cost: "+formatWhole(this.costPa)+" "+modInfo.pointsName
                let effText = ""
                return title+"<br>"+description+""+effText+"<br><br>"+cost
            },
            canAfford() {
                let scReq = getBuyableAmount("p",12).gte(this.reqSC)
                let paReq = player.points.gte(this.costPa)
                return (scReq&&paReq)
            },
            pay() {
                player.points = player.points.sub(this.costPa)
            },
            unlocked: false
        },
    }
}) // Particles