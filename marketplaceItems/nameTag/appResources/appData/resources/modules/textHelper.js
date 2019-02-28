var charMap = {
    a: 0.05,
    b: 0.051, 
    c: 0.05,
    d: 0.051,
    e: 0.05,
    f: 0.035,
    g: 0.051,
    h: 0.051,
    i: 0.025,
    j: 0.025,
    k: 0.05,
    l: 0.025,
    m: 0.0775,
    n: 0.051,
    o: 0.051,
    p: 0.051,
    q: 0.051,
    r: 0.035,
    s: 0.05,
    t: 0.035,
    u: 0.051,
    v: 0.05,
    w: 0.05,
    x: 0.05,
    y: 0.05,
    z: 0.05,
    A: 0.06,
    B: 0.06,
    C: 0.06,
    D: 0.06,
    E: 0.05,
    F: 0.05,
    G: 0.06,
    H: 0.0625,
    I: 0.0275,
    J: 0.05,
    K: 0.06,
    L: 0.05,
    M: 0.075,
    N: 0.0625,
    O: 0.0625,
    P: 0.06,
    Q: 0.0625,
    R: 0.06,
    S: 0.06,
    T: 0.06,
    U: 0.06,
    V: 0.06,
    W: 0.075,
    X: 0.06,
    Y: 0.06,
    Z: 0.06
}

var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')


function TextHelper(){
    this.text = "";
    this.textArray = "";
    this.DEFAULT_LINE_HEIGHT = 0.1;
    this.lineHeight = 0;
    this.totalTextLength = 0;
    this.scaler = 1.0;
}

// Comment
TextHelper.prototype.setText =
    function(newText){
        this.text = newText;
        this.createTextArray();

        return this;
    };

// Comment
TextHelper.prototype.setLineHeight = 
    function(newLineHeight){
        this.lineHeight = newLineHeight;
        this.scaler = this.lineHeight / this.DEFAULT_LINE_HEIGHT;

        return this;
    };
    
// Comment
TextHelper.prototype.createTextArray = 
    function(){
        this.textArray = this.text.split("");

        return this;
    };
    
// Comment
var DEFAULT_CHAR_SIZE = 0.035;
TextHelper.prototype.getTotalTextLength = 
    function(){
        var lengthArray = this.textArray.map(function(letter){
            if (charMap[letter]){
                return charMap[letter];
            } else {
                return DEFAULT_CHAR_SIZE;
            }
        });

        var defaultTextLength = lengthArray.reduce(function(prev, curr){
            return prev + curr;
        }, 0);
        // log(defaultTextLength);
        this.adjustForScale(defaultTextLength);

        return this.totalTextLength;
    };
    
// Comment
TextHelper.prototype.adjustForScale = 
    function(defaultTextLength){
        this.totalTextLength = defaultTextLength * this.scaler;

        return this;
    };
    

module.exports = TextHelper;