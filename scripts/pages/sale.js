const SalePage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <page-container :syncing="syncing">
        <div class="above_actions" v-if="sale.personId && render">
            <sale-person :sale="sale" :person="person" @click="vibrate();openPerson();"/>

            <div class="box">
                <div class="media p-1">
                    <div class="media-content">
                        Summe <button class="ml-std button is-small is-outlined is-link" @click="vibrate();addArticles();" v-if="!sale.isPayed">Artikel hinzufügen</button>
                    </div>
                    <div class="media-right title is-5">
                        {{format(sale.articleSum)}}
                    </div>
                </div>

                <div class="pt-1">&nbsp;</div>
                <div class="flx col g1 pt-1">
                    <sale-article-line v-for="saleArticle in sale.articles" v-show="saleArticle.amount>0" mode="sale" :article="saleArticle.article" :sale="sale" @modify="(article,amount)=>modify(article,amount)"/>
                </div>
            
            </div>

        </div>
        <div class="actions" v-if="sale.personId">
            <div class="field is-grouped">
                <div class="control">
                    <button-primary @click="vibrate();save();">OK</button-primary>
                </div>
                <div class="control" v-if="sale.articleSum != 0 && !sale.isPayed">
                    <button-success @click="vibrate();pay();">Zahlen</button-success>
                </div>
                <div class="control">
                    <button-cancel @click="vibrate();cancel();"/>
                </div>
                <div class="control">
                    <button-danger-inverted @click="vibrate();remove();">
                        <span class="icon is-small">
                        <i class="fas fa-trash"></i>
                        </span>
                    </button-danger-inverted>
                </div>
            </div>
        </div>
        <modal-person-chooser ref="personChooser"/>
        <modal-article-chooser ref="articleChooser"/>
        <modal-yesno ref="yesNoRemove" title="Verkauf löschen" text="Soll dieser Verkauf wirklich gelöscht werden?"/>
        <modal-input ref="inp"/>
    </page-container>
    `,
    data() {
        return {
            sale: {},
            person: {},
            render: true,
            saveOnDestroy: false
        };
    },
    destroyed() {
        var app = this;
        if(app.saveOnDestroy)
            app.$root.storedSA = { saleId: app.sale.id, articles: app.articles };
    },
    methods: {
        initDone() {
            var app = this;
            app.load();
        },
        async load() {
            var app = this;
            if(app.$route.params.id !== "_") {
                try {
                    app.syncing = true;
                    app.sale = await Sale.get(app.$route.params.id);
                    app.syncing = false;
                    if(app.sale.personId === -1) {
                        app.person = barPerson;
                        app.restore();
                    }
                    else {
                        app.syncing = true;
                        await Person.get(app.sale.personId).then(person=> { 
                            app.person = person;
                            app.restore();
                        });
                        app.syncing = false;
                    }
                }
                catch(e) {
                    router.push({ path: "/sales" });
                }
            }
            else {
                try {
                    var person = await app.$refs.personChooser.open();
                    //person selected
                    //check if there is an open sale for this person
                    if(!person.isBar) {
                        var sale = await Sale.getOpenedSaleForPerson(person);
                        var firstOnNewSale = true;
                        if(sale) {
                            app.sale = sale;
                            firstOnNewSale = false;
                        }
                        else {
                            app.sale = new Sale();
                            app.sale.setPerson(person);
                        }
                        app.person = person;
                        if(!app.restore())
                            app.addArticles(firstOnNewSale);
                    }
                    else {
                        app.sale = new Sale();
                        app.sale.setPerson(person);
                        app.person = person;
                        if(!app.restore())
                            app.addArticles(true);
                    }
                    
                }
                catch(e) {//nothing selected:
                    router.push({ path: "/sales" });
                }
            }
        },
        addArticles(firstOnNewSale) {
            var app = this;
            app.$refs.articleChooser.open(app.sale, app.person, firstOnNewSale).then(modifications => {
                if(modifications) {
                    app.sale.articles = modifications;
                    console.log("add articles after", app.sale.articles);
                    app.calculate();
                }
            }, (rejectMode) => {
                if(rejectMode === "addCredit") 
                    app.addCredit();
                else if(firstOnNewSale === true)
                    router.push({ path: "/sales" });
            });
        },
        modify(article, amount) {
            var app = this;
            util.log("modify", { sale: app.sale, article, amount });
            app.sale.articles.find(a => a.article.id === article.id).amount = amount;
            app.calculate();
        },
        calculate() {
            var app = this;
            util.log("calculate", { sale: app.sale });
            app.sale.calculate();
            app.render = false;
            app.$nextTick(()=>app.render=true);
        },
        async save() {
            var app = this;
            if(app.sale.isPayed)
                app.cancel();
            else {
                app.syncing = true;
                await app.sale.save();
                app.syncing=false;
                router.push({ path: "/sales" });
            }
        },
        async pay(amountJustCredit) {
            var app = this;
            app.syncing = true;
            var ret = await app.sale.save();
            app.sale.id = ret.id;
            app.syncing = false;
            router.push({ path: "/pay/" + app.sale.id, query: { jc: amountJustCredit, saleId: app.sale.id } });
        },
        payWCredit() {
            alert("Todo");
        },
        async remove() {
            var app = this;
            if(app.$route.params.id !== "_") {
                await app.$refs.yesNoRemove.open();
                await app.sale.remove();
                router.push({ path: "/sales" });
            }
            else
                app.cancel();
        },
        cancel() {
            router.push({ path: "/sales" });
        },
        async addCredit() {
            var app = this;

            var val = await app.$refs.inp.open(0, "Guthaben im Wert von € kaufen");
            val = parseFloat(val);
            if(val > 0) 
                await app.pay(val);                
        },
        openPerson() {
            var app = this;
            if(app.person.id  !== -1) {
                app.saveOnDestroy = true;
                router.push({ path: "/person/"+app.person.id, query: { s: app.sale.id } });
            }
        },
        restore() {
            var app = this;
            if(app.$root.storedSA && app.$root.storedSA.saleId === app.sale.id) {
                app.sale.articles = app.$root.storedSA.articles;
                delete app.$root.storedSA;
                return true;
            }
            else
                return false;
        }
    }
}