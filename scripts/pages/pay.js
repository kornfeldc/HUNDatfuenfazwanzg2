const PayPage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <page-container :syncing="syncing">
        <div class="above_actions">
            <sale-person :sale="sale" :person="person" mode="pay" v-model="useCredit"/>
            <div>&nbsp;</div>
            <div class="px-std columns is-mobile is-vcentered">
                <div class="column is-centered" style="text-align:center">
                    <div class="title is-6">zu bezahlen</div>
                    <div :class="'subtitle is-2 '+ getColor('toPay',toPay)">{{format(toPay)}}</div>
                </div>
                <div class="column  is-centered" style="text-align:center">
                    <div class="title is-6">retour</div>
                    <div :class="'subtitle is-2 '+ getColor('toReturn',toReturn)">{{format(toReturn)}}</div>
                </div>
                <div class="column is-centered" style="text-align:center" v-if="!person.isBar">
                    <div class="title is-6">neues Guth.</div>
                    <div :class="'subtitle is-2 '+ getColor('newCredit',newCredit)">{{format(newCredit)}}</div>
                </div>
            </div>
            <div>&nbsp;</div>
            <div class="px-std columns is-mobile is-vcentered">
                <div class="column  is-centered" style="text-align:center">
                    <div class="title is-6">inkl. Trinkggeld</div>
                    <div :class="'subtitle is-2 '+ getColor('inclTip',sale.inclTip)" @click="vibrate();openInput('inclTip')">{{format(sale.inclTip)}}</div>
                    <div>
                        <button class="button is-rounded is-danger" @click="vibrate();modify('inclTip','-')">-</button>
                        <button class="button is-rounded is-success" @click="vibrate();modify('inclTip','+')">+</button>
                    </div>
                </div>
                <div class="column  is-centered" style="text-align:center">
                    <div class="title is-6">gegeben</div>
                    <div :class="'subtitle is-2 '+ getColor('given',sale.given)" @click="vibrate();openInput('given')">{{format(sale.given)}}</div>
                    <div>
                        <button class="button is-rounded is-danger" @click="vibrate();modify('given','-')">-</button>
                        <button class="button is-rounded is-success" @click="vibrate();modify('given','+')">+</button>
                    </div>
                </div>
                <div class="column  is-centered" style="text-align:center" v-if="!person.isBar">
                    <div class="title is-6">Guth. aufladen</div>
                    <div :class="'subtitle is-2 '+ getColor('addAdditionalCredit',sale.addAdditionalCredit)" @click="vibrate();openInput('addAdditionalCredit')">{{format(sale.addAdditionalCredit)}} </div>
                    <div>
                        <button class="button is-rounded is-danger" @click="vibrate();modify('addAdditionalCredit','-')">-</button>
                        <button class="button is-rounded is-success" @click="vibrate();modify('addAdditionalCredit','+')">+</button>
                    </div>
                </div>
            </div>
            <div class="px-std columns is-mobile is-vcentered">
               
            </div>
        </div>
        <div class="actions">
            <div class="field is-grouped">
                <div class="control" v-if="allowPay">
                    <button-success @click="vibrate();save();">Fertig</button-success>
                </div>
                <div class="control">
                    <button-primary-inverted v-if="toReturn > 0" @click="vibrate();retourAsCredit();">Retour als Guthaben</button-primary-inverted>
                </div>
                <div class="control">
                    <button-cancel @click="vibrate();cancel();"/>
                </div>
            </div>
        </div>
        <modal-input ref="inp"/>
    </page-container>
    `,
    data() {
        return {
            sale: {},
            person: {},
            useCredit: false
        };
    },
    computed: {
        personCredit() {
            var app = this;
            var credit = app.person.credit || 0;
            return credit;
        },
        allowPay() {
            var app = this;
            return app.sale.given >= app.toPay;
        },
        toPay() {
            var app = this;
            var val = 0;
            
            if(app.useCredit && app.personCredit >= app.sale.articleSum)
                val = 0;
            else if(app.useCredit)
                val = app.sale.articleSum - app.personCredit;
            else
                val = app.sale.articleSum;

            return Math.round(val*10)/10;
        },
        baseToReturn() {
            var app = this;
            return app.sale.given - app.sale.inclTip;
        },
        toReturn() {
            var app = this;
            return app.baseToReturn - app.sale.addAdditionalCredit;
        },
        newCredit() {
            var app = this;
            if(app.person) {
                var ret = app.personCredit;
                if(app.useCredit) 
                    ret -= Math.min(app.personCredit, app.sale.articleSum);

                ret += app.sale.addAdditionalCredit;
                ret = Math.round(ret*10)/10;
                return ret;
            }
            return 0;
        }
    },
    watch: {
        useCredit() {
            var app = this;
            app.recalc("initial");
        }
    },
    created() {
    },
    methods: {
        initDone() {
            var app = this;
            app.load();
        },
        getColor(mode,val) {
            var app = this;
            if(mode == "toPay" && app.toPay > 0)
                return "warning-text";
            else if(mode == "toPay")
                return "has-text-success";
            else if(mode == "toReturn" && app.toReturn > 0)
                return "has-text-danger has-text-weight-bold";
            else if(mode == "newCredit" && app.personCredit > app.newCredit) 
                return "has-text-danger";
            else if(mode == "newCredit" && app.personCredit < app.newCredit) 
                return "has-text-link";
            else if(val === 0)
                return "has-text-grey-light";
            return "";
        },
        load() {
            var app = this;
            if(app.$route.params.id !== "_") {
                app.syncing = true;

                Sale.get(app.$route.params.id).then(sale => { 
                    app.sale=sale;
                    if(app.sale.personId === -1) {
                        app.person = barPerson;
                        app.afterLoad();
                    }
                    else
                        Person.get(app.sale.personId).then(person=> { app.person = person; app.afterLoad() });
                }, () => router.push({ path: "/sales" }));
            }
            else
                router.push({ path: "/sales" });
        },
        afterLoad() {
            var app = this;
            app.syncing = false;
            if(app.personCredit > app.sale.articleSum)
                app.useCredit = true;
            if(app.$route.query.jc > 0)
                app.useCredit = false;

            app.recalc("initial");
        },
        async save() {
            var app = this
            app.syncing = true;
            app.sale.personCreditBefore = app.personCredit;
            app.sale.personCreditAfter = app.newCredit;
            app.sale.toReturn = app.toReturn;
            app.sale.toPay = app.toPay;
            app.sale.usedCredit = app.useCredit;

            if(app.newCredit !== app.personCredit) {
                var creditDiff = app.newCredit - app.person.credit;
                app.person.credit = app.newCredit;
                await app.person.save();

                var creditHistory = new CreditHistory();
                creditHistory.personId = app.person.id;
                creditHistory.credit = creditDiff;
                creditHistory.saleId = app.sale.id;
                await creditHistory.save();
            }

            app.sale.payDate = moment().format(util.dateFormat);
            await app.sale.save();
            app.syncing = false;
            router.push({ path: "/sales" });
        },
        cancel() {
            var app = this;
            router.push({ path: "/sale/"+app.sale.id });
        },
        openInput(mode) {
            var app = this;
            if(mode === "given") 
                app.$refs.inp.open(app.sale.given, "gegeben").then(val => { app.setValue("given", val); app.recalc("given"); });
            else if(mode === "addAdditionalCredit")
                app.$refs.inp.open(app.sale.addAdditionalCredit, "Guthaben aufladen").then(val => { app.setValue("addAdditionalCredit", val); app.recalc(); });
            else if(mode === "inclTip")
                app.$refs.inp.open(app.sale.inclTip, "inklusive Trinkgeld").then(val => { app.setValue("inclTip", val); app.recalc("inclTip"); });
        },
        retourAsCredit() {
            var app = this;
            var retour = app.toReturn;
            app.sale.addAdditionalCredit += retour;
        },
        modify(prop,dir) {
            var app = this;
            var newVal = app.sale[prop];
            if(dir === "+" || app.sale[prop] > 0) {
                var step = dir === "-" ? -0.5 : 0.5;
                var inv = 1.0 / step;
                if(app.sale[prop] === Math.round(app.sale[prop] * inv) / inv)
                    newVal += step;
                else {
                    var newVal = Math.round(app.sale[prop] * inv) / inv;
                    if(dir === "+" && newVal <= app.sale[prop]) 
                        newVal =  Math.round((newVal+step) * inv) / inv;
                }
                
            }

            if(newVal !== app.sale[prop]) {
                app.setValue(prop,newVal);
                app.recalc(prop);
            }
        },
        setValue(prop, value) {
            var app = this;
            
            if(prop === "given" && value < app.toPay)
                return false;

            if(prop === "addAdditionalCredit") {
                var maxAvailableAdditionalCredit = app.baseToReturn;
                if(value > maxAvailableAdditionalCredit)
                    return false;
            }
            app.sale[prop] = parseFloat(value);
        },
        recalc(mode) {
            var app = this;

            if(mode === "initial") {
                app.sale.inclTip = app.toPay;
                app.sale.given = app.toPay;
                app.sale.addAdditionalCredit = 0.0;

                if(app.$route.query && app.$route.query.jc && app.$route.query.jc > 0) 
                    app.sale.addAdditionalCredit = app.sale.given = parseFloat(app.$route.query.jc);
            }

            if(app.sale.inclTip < app.toPay) 
                app.sale.inclTip = app.toPay;
            
            if(mode === "inclTip" && app.sale.given < app.sale.inclTip)
                app.sale.given = app.sale.inclTip;
            if(mode === "given" && app.sale.given < app.sale.inclTip)
                app.sale.inclTip = app.sale.given;

            if(mode === "given" || mode === "inclTip") {
                if(app.toReturn < 0)
                    app.sale.addAdditionalCredit = 0;
            }
        }
    }
}