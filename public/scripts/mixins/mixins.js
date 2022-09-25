var mandatoryMixin = {
    methods: {
        hasValue(obj,property) {
            var app = this;
            return (obj && obj[property] && obj[property].toString().length > 0);
        },
        getInputClass(obj,property) {
            return {
                "input": true,
                "is-danger": !this.hasValue(obj,property)
            };
        },
    }
}

var sessionMixin = {
    data() {
        return {
            syncing: false
        }
    },
    created() {
        console.log("created",this);
    },
    mounted() {
        var app = this;
        console.log("mounted",this);
        var user = storage.get("user");
        if(!user || !user.hash) {
            app.$parent.isLoggedIn = false;
            try { app.$parent.$parent.isLoggedIn = false; } catch(e) {}
            router.replace("/login");
        }
        else {
            app.$parent.isLoggedIn = true;
            app.$parent.groupTitle = "OG"+user.og;

            try {
                app.$parent.$parent.isLoggedIn = true;
                app.$parent.$parent.groupTitle = "OG"+user.og;;
            }
            catch(e) {}

            console.log("start init");
            app.initDone && app.initDone();
        }
    }
}

var utilMixins = {
    methods: {
        format(n, co = 2, d2 = ",", t2 = ".") { 
            var c = isNaN(c = Math.abs(c)) ? 2 : co;
            var d = d2 == undefined ? "." : d2;
            var t = t2 == undefined ? "," : t2;
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;

            return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
        },
        vibrate() {
            navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
            navigator.vibrate && navigator.vibrate(100);
        }
    }
}