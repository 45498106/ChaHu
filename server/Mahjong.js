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
function HasGangCardsByHand(handCards) {

    var c = new Array(50);
    Util.ArrayZero(c);
    for ( i= 0; i < handCards.length; ++i ) {
        c[handCards[i]] += 1;
        if (c[handCards[i]] === 4) {
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
        return false;   // 手牌不能大于13牌
    }
    
    if ((handCards.length-1) % 3 !== 0) { 
        return false;  // 手牌必须是1,4,7,10,13
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

if(typeof module !== 'undefined') {
    module.exports.CanPengCards = CanPengCards;
    module.exports.CanGangCards = CanGangCards;
    module.exports.HasGangCards = HasGangCards;
    module.exports.HasGangCardsByHand = HasGangCardsByHand;
    module.exports.GetHuCards = GetHuCards;
}