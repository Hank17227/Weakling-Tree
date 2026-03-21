addLayer("a", {
    tabFormat: {
        Intro: {
            content: [["infobox","introBox"]]
        },
        Challenges: {
            content: [
                ["display-text", function() {
                    unlockReq = "Next challenge unlocks at <h2>"+format(tmp.a.challengeUnlockCon)+"</h2> Unstable Dust.<br>"+
                    "(You have "+format(player.c.ud)+" Unstable Dust)<br><br>"
                    if(player.a.ch4Unlocked) unlockReq = ""
                    return unlockReq
                }],
                ["display-text", function() {
                    additionalText = ""
                    if(player.a.ch2Unlocked) additionalText = "For <b>God's Punishment</b> and the challenges onwards, your Crystal Shards, total Crystal Shards, VC, and EC will be reset. The 7th effect of VC and EC will be nullified."
                    return additionalText
                }],"blank",
                "challenges","blank","blank",
                "milestones"
            ]
        },
        Purification: {
            content: [
                ["display-text", function() {
                    return "You have "+colorText("h3",tmp.c.colorvc,formatWhole(player.c.vc))+" Virtuous Crystal"+(player.c.vc.eq(1)?"":"s")+". (+"+format(inChallenge("dm",22)?tmp.c.vcGainDC22:upgradeEffect("c",21))+"/s)"
                }],"blank",
                ["display-text", function() {
                    let effectText = "which translates to <h3>+"+formatWhole(tmp.a.vppEffect.mul(100))+"</h3>% of extra VC production."
                    if(inChallenge("a",21)) effectText = "which translates to <h3>+"+formatWhole(tmp.a.vppEffect.mul(100))+"</h3>% of extra Mentality production."
                    if(inChallenge("dm",22)) effectText = "which translates to <h3>+"+format(tmp.a.vppEffect.mul(100))+"</h3>% of extra VC production."
                    return "You have <h2>"+formatWhole(tmp.a.vppCount)+"</h2> Virtuous Purification Power, "+effectText
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
                    return "×"+format(tmp.a.vc3Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.a.vc3)+"</b>"
                    },{'font-size':'30px','width':'418.69px','display':'block'}],
                    ["clickable",13]
                ], {'width':'750px','height':'60px', 'background':'rgba(18, 187, 40, 0.25)'}],
                ["row", [
                    ["display-text", function() {
                    return "<b>Purified<br>Virtuous<br>Crystal<sup>4</sup></b>"
                    }], ["blank",["25px","30px"]],
                    ["display-text", function() {
                    return "×"+format(tmp.a.vc4Mult)
                    },{'width':'40px','display':'block'}],
                    ["display-text", function() {
                    return "<b>"+formatWhole(player.a.vc4)+"</b>"
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
                return "Welcome to the next part of the game! This layer is a continual one dedicated for Virtuous Crystals! "+
                "Now, what you'll be facing are the challenges that will have their own unique condition and requirement.<br><br>"+
                "But worry not! Even though challenges may look tempting, they're actually quite straight forward to complete! "+
                "Once you reached the requirement to unlock them, you're as good to go to attempt them!<br>"+
                "(Each challenge takes about 5-15 minutes)<br><br>"+
                "Next is the Purification, which will be unlocked when you complete the first challenge here. It was my rough idea "+
                "back when I was designing the Crystals layer (to be exact, it was gonna be a random stat for VC). But now it is moved to here "+
                "and I'm quite happy of how it turned out!"
            }
        }
    },
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        challengeCompletion: 0,
        vc1: new Decimal(0), // Purified VC^1
        vc1Bought: 0,
        vc2: new Decimal(0), // Purified VC^2
        vc2Bought: 0,
        vc3: new Decimal(0), // Purified VC^3
        vc3Bought: 0,
        vc4: new Decimal(0), // Purified VC^4
        vc4Bought: 0,
        vpp: new Decimal(0), // Virtuous Purification Power
        ch2Unlocked: false,
        ch3Unlocked: false,
        ch4Unlocked: false,
        inChTime: 0,
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
        if(!player.a.ch3Unlocked) tmp.a.challenge3Unlock
        if(!player.a.ch4Unlocked) tmp.a.challenge3Unlock
        tmp.a.challengeCount
        if(player.a.vc2.gte(1)&&!inChallenge("dm",22)) player.a.vc1 = player.a.vc1.add(tmp.a.vc1Gain.mul(diff))
        if(player.a.vc3.gte(1)&&!inChallenge("dm",22)) player.a.vc2 = player.a.vc2.add(tmp.a.vc2Gain.mul(diff))
        if(player.a.vc4.gte(1)&&!inChallenge("dm",22)) player.a.vc3 = player.a.vc3.add(tmp.a.vc3Gain.mul(diff))
        if(inChallenge("a",12)||inChallenge("a",21)||inChallenge("a",22)) player.a.inChTime = player.a.inChTime + diff
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
        player.a.challengeCompletion = challengeCompletions("a",11)+challengeCompletions("a",12)+challengeCompletions("a",21)//+challengeCompletions("a",22)
        return
    },

    challengeUnlockCon() {
        let req = new Decimal("1e140")
        if(tmp.a.challenges[12].unlocked) req = new Decimal("1e240")
        if(tmp.a.challenges[21].unlocked) req = new Decimal("1e432")
        return req
    },

    challenge2Unlock() {
        if(player.c.ud.gte("1e140")) player.a.ch2Unlocked = true
        return
    },

    challenge3Unlock() {
        if(player.c.ud.gte("1e240")) player.a.ch3Unlocked = true
        return
    },

    challenge4Unlock() {
        if(player.c.ud.gte("1e432")) player.a.ch4Unlocked = true
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
        if(inChallenge("dm",22)) eff = eff.pow(0.025).sub(1)
        return eff
    },

    vc1Gain() { // this only triggers when having more than 1 VC^2
        let count = player.a.vc2.mul(tmp.a.vc2Mult)
        return count
    },

    vc2Gain() { // this only triggers when having more than 1 VC^3
        let count = player.a.vc3.mul(tmp.a.vc3Mult)
        return count
    },

    vc3Gain() { // this only triggers when having more than 1 VC^4
        let count = player.a.vc4.mul(tmp.a.vc4Mult)
        return count
    },

    vc1Mult() {
        let mult = new Decimal(1)
        if(hasChallenge("a",12)) mult = mult.mul(challengeEffect("a",12))
        if(hasUpgrade("c",22)) mult = mult.mul(upgradeEffect("c",22))
        if(hasChallenge("a",21)) mult = mult.mul(challengeEffect("a",21))
        return mult
    },

    vc2Mult() {
        let mult = new Decimal(1)
        if(hasChallenge("a",21)) mult = mult.mul(challengeEffect("a",21))
        if(hasUpgrade("c",23)) mult = mult.mul(upgradeEffect("c",23))
        return mult
    },

    vc3Mult() {
        let mult = new Decimal(1)
        if(hasUpgrade("c",24)) mult = mult.mul(upgradeEffect("c",24))
        return mult
    },

    vc4Mult() {
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

    vc3Cost() {
        let startCost = new Decimal(7.5e50)
        let cost = startCost.mul(Decimal.pow(60,player.a.vc3Bought))
        return cost
    },

    vc4Cost() {
        let startCost = new Decimal("9e999")
        let cost = startCost.mul(Decimal.pow(360,player.a.vc4Bought))
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
            challengeDescription: "Crystal Shards gain is now ^0.5 and disables the gain of EC and its effects. Purified Crystals do nothing.",
            goalDescription: "Reach 1e52 Mentality.",
            rewardDescription: "Unlocks Virtuous Crystal<sup>2</sup> Purification. ×3 Purified Virtuous Crystal<sup>1</sup> multiplier.",
            onEnter() {
                player.c.points = new Decimal(0)
                player.c.vc = new Decimal(0)
                player.c.ec = new Decimal(0)
                player.c.total = new Decimal(0)
                player.a.inChTime = 0
                player.dm.inChTime = 0
            },
            canComplete: function() {return player.points.gte(1e52)},
            unlocked() {return player.a.ch2Unlocked},
            rewardEffect: 3
        },
        21: {
            name: "Mental Clarity",
            challengeDescription: "Purification Power of both types boosts the gain of Mentality instead of Crystals. Weakling Dust gain is drastically decreased but its effect is now multiplicative. Disable the gain of Unstable Dust.",
            goalDescription: "Reach 1e100 Mentality.",
            rewardDescription: "Unlocks Virtuous Crystal<sup>3</sup> Purification. ×3 Purified VC<sup>1</sup> and VC<sup>2</sup> multiplier.",
            onEnter() {
                player.c.points = new Decimal(0)
                player.c.vc = new Decimal(0)
                player.c.ec = new Decimal(0)
                player.c.total = new Decimal(0)
                player.a.inChTime = 0
                player.dm.inChTime = 0
            },
            canComplete: function() {return player.points.gte("1e100")},
            unlocked() {return player.a.ch3Unlocked},
            rewardEffect: 3
        },
        /*22: {
            name: "Ascension to Heaven (WIP)",
            challengeDescription: "You're having <b>Mental Clarity</b> again but Purification Power also increases Weakling Dust. Unlocks new upgrades that are exclusive to this challenge.",
            goalDescription: "Reach the same amount of Weakling Dust and Mentality at the same time!",
            rewardDescription: "Unlocks Virtuous Crystal<sup>4</sup> Purification. ×10 Purified VC<sup>1</sup>, VC<sup>2</sup> and VC<sup>3</sup> multiplier.",
            onEnter() {
                player.c.points = new Decimal(0)
                player.c.vc = new Decimal(0)
                player.c.ec = new Decimal(0)
                player.c.total = new Decimal(0)
                player.a.inChTime = 0
                player.dm.inChTime = 0
            },
            canComplete: function() {return player.points.gte("9e9999")},
            unlocked() {return player.a.ch4Unlocked},
            rewardEffect: 10
        }*/
    },

    milestones: {
        0: {
            requirementDescription: "1 Challenge Completion",
            effectDescription: "Weakling upgrades are no longer reset when entering/exiting Angelic Challenges.",
            done() {return player.a.challengeCompletion >= 1}
        },
        1: {
            requirementDescription: "2 Challenge Completions",
            effectDescription: "×1e10 Mentality gain when entering Angelic Challenges.",
            done() {return player.a.challengeCompletion >= 2}
        },
        2: {
            requirementDescription: "3 Challenge Completions",
            effectDescription: "×1m Virtuous Crystals gain, and ×1k Evil Crystals gain when entering Angelic challenges.",
            done() {return player.a.challengeCompletion >= 3}
        },
        3: {
            requirementDescription: "4 Challenge Completions",
            effectDescription: "The above effects also apply outside of Angelic challenges.",
            done() {return player.a.challengeCompletion >= 4}
        },
    },

    clickables: {
        11: {
            title: "Buy",
            display() {return "Cost: "+format(tmp.a.vc1Cost)+" VC"},
            tooltip() {return "Bought: "+formatWhole(player.a.vc1Bought)},
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
                if(hasChallenge("a",12)) return "Cost: "+format(tmp.a.vc2Cost)+" VC"
                return ""
            },
            tooltip() {
                if(hasChallenge("a",12)) return "Bought: "+formatWhole(player.a.vc2Bought)
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
                if(hasChallenge("a",21)) return "Buy"
                return "Locked"
            },
            display() {
                if(hasChallenge("a",21)) return "Cost: "+format(tmp.a.vc3Cost)+" VC"
                return ""
            },
            tooltip() {
                if(hasChallenge("a",21)) return "Bought: "+formatWhole(player.a.vc3Bought)
                return ""
            },
            canClick() {
                if(hasChallenge("a",21)) return player.c.vc.gte(tmp.a.vc3Cost)
                return false
            },
            onClick() {
                player.c.vc = player.c.vc.sub(tmp.a.vc3Cost)
                player.a.vc3 = player.a.vc3.add(1)
                player.a.vc3Bought++
            },
            onHold() {
                player.c.vc = player.c.vc.sub(tmp.a.vc3Cost)
                player.a.vc3 = player.a.vc3.add(1)
                player.a.vc3Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color3 = "rgb(70, 124, 77)"
                let color = color3
                if(hasChallenge("a",21)) color = color2
                if(tmp.a.clickables[13].canClick) color = color1
                return color
            }}
        },
        14: {
            title() {
                if(hasChallenge("a",22)) return "Buy"
                return "Locked"
            },
            display() {
                if(hasChallenge("a",22)) return "Cost: "+format(tmp.a.vc4Cost)+" VC"
                return ""
            },
            tooltip() {
                if(hasChallenge("a",22)) return "Bought: "+formatWhole(player.a.vc4Bought)
                return ""
            },
            canClick() {
                if(hasChallenge("a",22)) return player.c.vc.gte(tmp.a.vc4Cost)
                return false
            },
            onClick() {
                player.c.vc = player.c.vc.sub(tmp.a.vc4Cost)
                player.a.vc4 = player.a.vc4.add(1)
                player.a.vc4Bought++
            },
            onHold() {
                player.c.vc = player.c.vc.sub(tmp.a.vc4Cost)
                player.a.vc4 = player.a.vc4.add(1)
                player.a.vc4Bought++
            },
            style: {"min-height": "40px", 'background'() {
                let color1 = "rgb(18, 187, 41)"
                let color2 = "rgb(109, 189, 120)"
                let color3 = "rgb(70, 124, 77)"
                let color = color3
                if(hasChallenge("a",22)) color = color2
                if(tmp.a.clickables[14].canClick) color = color1
                return color
            }}
        },
    }
}) // Angelic
