
class Bbnk extends Object {

    static deepEqual(obj1, obj2) {
        // Eğer her iki değer de aynı ise
        if (obj1 === obj2) return true;

        // Değerlerden biri null ya da obje değilse
        if (obj1 === null || obj2 === null || typeof obj1 !== "object" || typeof obj2 !== "object") {
            return false;
        }

        // Her iki nesnenin anahtarlarını al
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        // Anahtar sayıları eşleşmiyorsa
        if (keys1.length !== keys2.length) return false;

        // Her anahtar için derin karşılaştırma yap
        for (const key of keys1) {
            if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
                return false;
            }
        }

        return true;
    }
    static checkOptions(options) {
        if (options === undefined) options = {};
        if (options === null) options = {};
        if (typeof options !== "object") options = {};
        return options;
    }
    static Initialize() {
        Bbnk.RegisteredObjects = {};
        Bbnk.ObjectIDGenerator = 0;
        Bbnk.functioIDGenerator = 0;
    }
    static get funcID() {
        let res = "func_"+Bbnk.functioIDGenerator.toString(16);
        Bbnk.functioIDGenerator++;
        return res;
    }
    static registerObject(obj) {
        let id = Bbnk.ObjectIDGenerator.toString(16);
        Bbnk.ObjectIDGenerator++;
        while (id.length < 16) id = "0" + id;
        id = "JS" + id;
        obj.$fields.ID = id;
        Bbnk.RegisteredObjects[id] = obj;
    }
    static unRegisterObject(obj) {
        let o = Bbnk.RegisteredObjects[obj.ID];
        if (o !== undefined) delete Bbnk.RegisteredObjects[obj.ID];
    }
    static isBbnk(value) {
        if (value === undefined) return false;
        if (value === null) return false;
        return  (value.isBbnk === true);
    }
    static New(type, options) {
        if (type == undefined) type = Bbnk;
        let responce = new type(options);
        responce.initializeObject();
        return responce;
    }
    constructor(options) {
        super();
        options = Bbnk.checkOptions(options);
        this.$fields = {};
        this.$fields.options = options;
        Bbnk.registerObject(this);
        this.$fields.parent = null;
        this.$fields.children = [];
        this.$fields.slaves = [];
        this.$fields.actions = {};
        this.$fields.actionTargets = [];
    }
    initializeObject() {
        if (typeof this.options.name === "string") this.name = this.options.name;
        if (typeof this.options.init === "function") {
            this.initFunc = this.options.init;
            this.initFunc();
        }
        if (Bbnk.isBbnk(this.options.parent) === true) {
            this.parent = this.options.parent;
        }
    }
    get options() { return this.$fields.options; }
    get ID() { return this.$fields.ID; }
    get isBbnk() { return true; }
    toString() {
        let v = "---";
        if ((this.value !== null) && (this.value !== undefined)) {
            v = this.value.toString();
        }
        return this.path+"  "+v;
    }
    getName() {
        if (this.$fields.name === undefined) return this.ID;
        return this.$fields.name;
    }
    setName(value) {
        this.$fields.name = value;
    }
    get name() { return this.getName(); }
    set name(value) { this.setName(value); }

    getParent() {
        return this.$fields.parent;
    }
    get parentIndex() {
        if (this.parent === null) return -1;
        return this.parent.$fields.children.indexOf(this);
    }
    setParent(value) {
        if (Bbnk.isBbnk(value) !== true) value = null;
        if (value !== this.parent) {
            let index = this.parentIndex;
            if (index !== -1) {
                this.parent.$fields.children.splice(index, 1);
            }
        }
        this.$fields.parent = value;
        if (value !== null) {
            value.$fields.children.push(this);
        }

    }
    get parent() { return this.getParent(); }
    set parent(value) {
        this.setParent(value);
        this.runAction("onSetParent");
    }

    getChildren() {
        return this.$fields.children;
    }
    get children() { return this.getChildren(); }
    get path() {
        if (this.parent !== null) {
            return this.parent.path + "." + this.name;
        }
        return this.name;
    }
    get master() {
        if (Bbnk.isBbnk(this.$fields.master) !== true) return null;
        return this.$fields.master;
    }

    getSlaves() {
        return this.$fields.slaves;
    }
    get slaves() { return this.getSlaves(); }
    get slaveIndex() {
        if (this.master === null) return -1;
        return this.master.$fields.slaves.indexof(this);
    }
    set master(value) {
        if (Bbnk.isBbnk(value) !== true) value = null;
        if (value !== this.master) {
            let index = this.slaveIndex;
            if (index !== -1) {
                this.master.$fields.slaves.splice(index, 1);
            }
        }
        this.$fields.master = value;
        if (value !== null) {
            value.$fields.slaves.push(this);
        }

    }

    getValue() {
        return this.$fields.value;
    }
    setValue(value) {
        this.$fields.value = value;
    }

    updateValue(value) {

    }
    updateSlaves(value) {
        this.runAction("onUpdateValue", value);
        this.updateValue(value);
        let sl = this.slaves;
        for (var i = 0; i < sl.length; i++) {
            sl.updateSlaves(value);
        }
    }
    get value() {
        if (this.master !== null) return this.master.value;
        return this.getValue();
    }
    set value(value) {
        this.runAction("onSetValue",value);
        if (Bbnk.deepEqual(this.value, value) === true) return;
        this.runAction("onChangedValue", value);
        if (this.master !== null) {
            this.master.value = value;
            return;
        }
        this.setValue(value);
        this.updateSlaves(value);
    }

    addAction(...args) {
        let name, target, action, options;
        options = [];
        for (var i = 0; i < args.length; i++) {
            let islendi = false;
            let type = typeof args[i];
            if (type === "string") {
                if (name === undefined) {
                    name = args[i];
                    islendi = true;
                }
            }
            if (Bbnk.isBbnk(args[i]) === true) {
                if (target === undefined) {
                    target = args[i];
                    islendi = true;
                }
            }
            if (type === "function") {
                if (action === undefined) {
                    action = args[i];
                    islendi = true;
                }

            }
            if (islendi === false) {
                options.push(args[i]);
            }
        }
        if (name === undefined) return;
        if (action === undefined) return;
        if (target === undefined) target = this;

        let actionItem = {
            name: name,
            source:this,
            action: action,
            target: target,
            options:options
        }
        let actions = this.$fields.actions[name];
        if (actions === undefined) {
            this.$fields.actions[name] = [];
            actions = this.$fields.actions[name];
        }
        actions.push(actionItem);
        this.$fields.actionTargets.push(actionItem);
    }
    runAction(name, ...args) {
        let action = this.$fields.actions[name];
        if (action === undefined) return;
        for (var i = 0; i < action.length; i++) {


            let n = Bbnk.funcID;
            action[i].target[n] = action[i].action;
            action[i].target[n](action[i], args);
            delete action[i].target[n];
        }
    }
    clear() {

    }
    disposeing() {

    }
    dispose() {

    }
}
function WsamStarted(options) {
    let x = 0;

    callWAsm("FromBrowserInit", 1234,"Mustafa",true);
}
function AddDomToBrowser(parent, options) {
    let x = 0;
}


function callWAsm(fname,...args) {

    DotNet.invokeMethodAsync('BbnkWAsmLib', fname, args)
            .then(() => console.log('StartWAsm method called successfully!'))
            .catch(err => {
                console.error('Error calling StartWAsm:', err)
            });
 
}

addEventListener("load", function () {
    Bbnk.Initialize();
    let b1 = Bbnk.New(Bbnk, {
        name: "obj1",
        init: function () {
            let x = 0;
        }
    });
    let b2 = Bbnk.New(Bbnk, {
        name: "obj2",
        parent:b1,
        init: function () {
            let x = 0;
        }
    });
    let b3 = Bbnk.New(Bbnk, {
        name: "obj3",
        init: function () {
            let x = 0;
        }
    });
    let bx = Bbnk.New(Bbnk, {
        name: "objx",
        init: function () {
            let x = 0;
        }
    });
   
    b1.addAction("onUpdateValue", bx, function (a, b) {
        let x = 0;
    })
    b1.addAction("onChangedValue", bx, function (a, ...b) {
        let x = 0;
    })
    b1.value = 123;
    
})