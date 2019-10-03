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
                    <sale-article-line v-for="saleArticle in sale.articles" mode="sale" :article="saleArticle.article" :sale="sale" @modify="(article,amount)=>modify(article,amount)"/>
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
                <!--<div class="control" v-if="sale.articleSum != 0 && person.credit >= sale.articleSum && !sale.isPayed">
                    <button-success-inverted @click="vibrate();payWCredit();">Alles mit Guthaben zahlen</button-success-inverted>
                </div>-->
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
        load() {
            var app = this;
            if(app.$route.params.id !== "_") {
                Sale.get(app.$route.params.id).then(sale => {
                    app.sale = sale;
                    if(app.sale.personId === 'bar') {
                        app.person = barPerson;
                        app.restore();
                    }
                    else
                        Person.get(app.sale.personId).then(person=> { 
                            app.person = person;
                            app.restore();
                        });
                }, () => router.push({ path: "/sales" }) );
            }
            else {
                app.$refs.personChooser.open().then(
                    //person selected
                    person => {

                        //check if there is an open sale for this person
                        if(!person.isBar) {
                            Sale.getOpenedSaleForPerson(person).then(sale => {
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
                            });
                        }
                        else {
                            app.sale = new Sale();
                            app.sale.setPerson(person);
                            app.person = person;
                            if(!app.restore())
                                app.addArticles(true);
                        }
                        
                    }, 
                    //nothing selected:
                    () => router.push({ path: "/sales" }) 
                );
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
            app.sale.articles.find(a => a.article.id === article.id).amount = amount;
            app.calculate();
        },
        calculate() {
            var app = this;
            app.sale.calculate();
            app.render = false;
            app.$nextTick(()=>app.render=true);
        },
        save() {
            var app = this;
            if(app.sale.isPayed)
                app.cancel();
            else {
                app.syncing = true;
                app.sale.save().then(()=> {
                    app.syncing=false;
                    router.push({ path: "/sales" });
                });
            }
        },
        pay(amountJustCredit) {
            var app = this;
            app.syncing = true;

            app.sale.save().then(()=> {
                app.syncing = false;
                router.push({ path: "/pay/" + app.sale.id, query: { jc: amountJustCredit } });
            });
        },
        payWCredit() {
            alert("Todo");
        },
        remove() {
            var app = this;
            if(app.$route.params.id !== "_") {
                app.$refs.yesNoRemove.open().then(() => {
                    app.sale.remove().then(() => router.push({ path: "/sales" }));
                });
            }
            else
                app.cancel();
        },
        cancel() {
            router.push({ path: "/sales" });
        },
        addCredit() {
            var app = this;

            app.$refs.inp.open(0, "Guthaben im Wert von € kaufen").then(val => { 
                val = parseFloat(val);
                if(val > 0) 
                    app.pay(val);                
            });
        },
        openPerson() {
            var app = this;
            if(app.person.id  !== 'bar') {
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