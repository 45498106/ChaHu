//-------------------------------------------------------------
function Player(){
    this.id = -1;
    this.place = -1;
    this.name = "unknow";
    this.headUrl = '';
    this.ready = false;
    this.cards = null;
    this.pengCards = null;
    this.gangCards = null;
    this.niuCards = null;
    this.kanCards = null;
    this.jiangCards = null;
    this.chiCards = null;
    this.outputCards = null;
    
    
    this.score = 0;
    this.singleScore = 0;
    this.totalScore = 0;
    this.piao = false;
}

Player.prototype.Clear = function() {
    this.cards = null;
    this.pengCards = null;
    this.gangCards = null;
    this.niuCards = null;
    this.kanCards = null;
    this.jiangCards = null;
    this.chiCards = null;
    this.outputCards = null;
    
    this.score = 0;
    this.singleScore = 0;
    this.piao = false;
}

Player.prototype.Init = function(id, place, name, headUrl) {
    this.id = id;
    this.place = place;
    this.name = name;
    this.headUrl = headUrl;
}


if(typeof module !== 'undefined')
    module.exports = Player;