// 10:47 2017/4/8
// create by li shihai

// 可否碰牌
function CanPengCards(cards, card) {
    var count = 0;
    for (var i = 0; i < cards.length; ++i) {
        if (cards[i] === card) {
            ++count;
        }
    }
    
    return count >= 2;
}

// 可否杠牌
function CanGangCards(cards, card) {
    var count = 0;
    for (var i = 0; i < cards.length; ++i) {
        if (cards[i] === card) {
            ++count;
        }
    }
    
    return count === 3;
}

// 可否坎牌
function CanKanCards(cards, card) {
    var count = 0;
    for (var i = 0; i < cards.length; ++i) {
        if (cards[i] === card) {
            ++count;
        }
    }
    
    return count >= 2;
}

// 可否将牌
function CanJiangCards(cards, card) {
    var count = 0;
    for (var i = 0; i < cards.length; ++i) {
        if (cards[i] === card) {
            ++count;
        }
    }

    return count === 1;
}

// 是否有杠牌
function HasGangCards(cards, card) {
    var count = 0;
    for (var i = 0; i < cards.length; ++i) {
        if (cards[i] === card) {
            ++count;
        }
    }
    
    return count === 4;
}

// 是否有杠牌
function HasGangCardsByHand(handCards, cardArray) {

    var c = new Array(50);
    Util.ArrayZero(c);
    for (var i= 0; i < handCards.length; ++i ) {
        c[handCards[i]] += 1;
        if (c[handCards[i]] === 4) {
        
            if (typeof cardArray !== 'undefined' && cardArray instanceof Array)
                cardArray.push(handCards[i]);
            
            return true;
        }
    }
    
    return  false;
}

// 是否有牛
function HasNiuCardsByHand(handCards, countArray) {
    var zhong = 0, fa = 0, bai = 0;
    for (var i= 0; i < handCards.length; ++i ) {
        
        if (handCards[i] === 45) {
            ++zhong;
        }
        else if (handCards[i] === 46) {
            ++fa;
        }
        else if (handCards[i] === 47) {
            ++bai;
        }
    }
    
    var hasNiu = false;
    if (zhong >= 1 && fa >= 1 && bai >= 1) {
        hasNiu = true;
    }
    
    if (hasNiu && typeof countArray !== 'undefined' && countArray instanceof Array) {
        countArray.push(zhong);
        countArray.push(fa);
        countArray.push(bai);
    }
    
    return hasNiu
}

// 是否有坎牌
function HasKanCards(cards, card) {
    var count = 0;
    for (var i = 0; i < cards.length; ++i) {
        if (cards[i] === card) {
            ++count;
        }
    }
    
    return count === 3;
}

// 是否有坎牌
function HasKanCardsByHand(handCards, cardArray) {
    var c = new Array(50);
    Util.ArrayZero(c);
    var i;
    for ( i = 0; i < handCards.length; ++i) {
        c[handCards[i]] += 1;
    }
    
    for ( i = 0; i < handCards.length; ++i)
    {
        if (c[handCards[i]] === 3) 
        {
            if (typeof cardArray !== 'undefined' && cardArray instanceof Array)
                cardArray.push(handCards[i]);
            
            return true;
        }
    }
    
    return  false;
}


// 是否有效的牌
function IsValidCard(card) {
    if ((card >= 11 && card <= 19) ||
        (card >= 21 && card <= 29) ||
        (card >= 31 && card <= 39) ||
        (card >= 45 && card <= 47) )
    {
        return true;
    }
    
    return false;
}

// 递归查找
function Search(c, dep, maxdep) {
    
    for (var i=11; i < 50; ++i) { // 三个
    
        if (!IsValidCard(i))
            continue;
    
        if (c[i] >= 3) {
            
            if (dep+1 === maxdep) 
                return true;
            
            c[i] -= 3;
            if (Search(c, dep+1, maxdep)) {
                c[i] += 3;
                return true;
            }
            c[i] += 3;
        }
    }
    
    for (var i=11; i < 39; ++i) { // 顺子
        
        if (!IsValidCard(i))
            continue;
        
        if ((i % 10) >= 1 && (i % 10) <= 7 &&
               c[i] >= 1 && 
             c[i+1] >= 1 && 
             c[i+2] >= 1) {
            
            if (dep+1 === maxdep) 
                return true;
             
            c[i] -= 1; c[i+1] -= 1; c[i+2] -= 1;
            if (Search(c, dep+1, maxdep)) {
                c[i] += 1; c[i+1] += 1; c[i+2] += 1;
                return true;
            }
            c[i] += 1; c[i+1] += 1; c[i+2] += 1;
        }
    }
    
    return false;
}

function Check(c, length) {
    for (var i=11; i < 50; ++i) {
        if (c[i] >= 2) {
            
            if (length === 1) {
                return true;
            }
            
            // if (length === 13) // 检测小七对
        
            c[i] -= 2;
            if(Search(c, 0, (length-1)/3)) {
                c[i] += 2;
                return true;
            }
            c[i] += 2;
        }
    }
    return false;
}

// 是否可胡牌
function GetHuCards(handCards, huCards) {

    if (handCards.length > 13 || handCards.length < 1) {
        GameLog("手牌不能大于13张牌,小于1张牌");
        return false;   // 手牌不能大于13牌,小于1张牌
    }
    
    if ((handCards.length-1) % 3 !== 0) {
        GameLog("手牌张数必须是1,4,7,10,13");
        return false;  // 手牌张数必须是1,4,7,10,13
    }

    var c = new Array(50);
    var hu = false;
    var i;
    Util.ArrayZero(c);
    for ( i= 0; i < handCards.length; ++i ) {
        c[handCards[i]] += 1;
        if (c[handCards[i]] > 4) {
            return false;
        }
    }
    
    for ( i=11; i < 50; ++i ) {
        
        if (!IsValidCard(i))
            continue;   // 如果不是有效的牌直接略过
 
        c[i] += 1;
        
        if (Check(c, handCards.length)) {
            if (typeof huCards !== 'undefined' && huCards instanceof Array) {
                huCards.push(i);
            }
            hu = true;
        }
        
        c[i] -= 1;
    }
    
    return hu;
}

// 是否可飘胡
function GetJiangHuCards(handCards, huCards) {

    if (handCards.length > 11 || handCards.length < 2) {
        console.log("手牌不能大于11张牌,小于2张牌");
        return false;   // 手牌不能大于11张牌,小于2张牌
    }
    
    if ((handCards.length-2) % 3 !== 0) { 
        return false;  // 手牌张数必须是2,5,8,11
    }
    
    var c = new Array(50);
    var hu = false;
    var i;
    Util.ArrayZero(c);
    for ( i = 0; i < handCards.length; ++i ) {
        c[handCards[i]] += 1;
        if (c[handCards[i]] > 4) {
            return false;
        }
    }
    
    for ( i = 11; i < 50; ++i) {
        
        if (!IsValidCard(i))
            continue;   // 如果不是有效的牌直接略过
        
        c[i] += 1;
        
        if(Search(c, 0, (handCards.length+1)/3)) {
            if (typeof huCards !== 'undefined' && huCards instanceof Array) {
                huCards.push(i);
            }
            hu = true;
        }
        
        c[i] -= 1;
    }
    
    return hu;
}

function IsFirstType(card) {
    if (card === 11 || card === 19)  {
        return true;
    }
    
    if (card === 21 || card === 29) {
        return true;
    }
    
    if (card === 31 || card === 39) {
        return true;
    }

    if (card >= 45 && card <= 47) {
        return true;
    }
    
    return false;
}

if(typeof module !== 'undefined') {
    module.exports.CanPengCards = CanPengCards;
    module.exports.CanGangCards = CanGangCards;
    module.exports.CanKanCards = CanKanCards;
    module.exports.CanJiangCards = CanJiangCards;
    module.exports.HasGangCards = HasGangCards;
    module.exports.HasGangCardsByHand = HasGangCardsByHand;
    module.exports.HasKanCards = HasKanCards;
    module.exports.HasKanCardsByHand = HasKanCardsByHand;
    module.exports.HasNiuCardsByHand = HasNiuCardsByHand;
    module.exports.GetHuCards = GetHuCards;
    module.exports.GetJiangHuCards = GetJiangHuCards;
    module.exports.IsFirstType = IsFirstType;
}