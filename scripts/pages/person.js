const PersonPage = {
    mixins: [sessionMixin,mandatoryMixin,utilMixins],
    template: `
    <page-container :syncing="syncing">
        <div class="above_actions">
            <div class="field">
                <label class="label">Vorname</label>
                <div class="control">
                    <input :class="getInputClass(person,'firstName')" type="text" placeholder="Vorname" v-model="person.firstName"/>
                </div>
                <p class="help is-danger" v-if="!hasValue(person,'firstName')">
                    Bitte ausfüllen
                </p>
            </div>
            <div><i class="fas fa-exchange-alt" @click="vibrate();switchName();"/></div>
            <div class="field">
                <label class="label">Nachname</label>
                <div class="control">
                    <input class="input" type="text" placeholder="Nachname" v-model="person.lastName"/>
                </div>
            </div>
            <div>&nbsp;</div>
            <div class="field">
                <label class="label">Telefon</label>
                <div class="control">
                    <input class="input" type="number" placeholder="Telefon" v-model="person.phone"/>
                </div>
            </div>
            <div>&nbsp;</div>
            <div class="field">
                <label class="label">Email</label>
                <div class="control">
                    <input class="input" type="text" placeholder="Email" v-model="person.email"/>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <label class="checkbox">
                        <input type="checkbox" v-model="person.isMember">
                        Ist Mitglied
                    </label>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <label class="checkbox">
                        <input type="checkbox" v-model="person.isActive">
                        Ist Aktiv
                    </label>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <label class="checkbox">
                        <input type="checkbox" v-model="isPersonGroup">
                        Zusammenhängende Personen
                    </label>
                </div>
            </div>
            <div class="field" v-if="isPersonGroup">
                <div class="control">
                    <input :class="getInputClass(person,'personGroup')" type="text" placeholder="Personengruppe" v-model="person.personGroup"/>
                </div>
                <p class="help is-danger" v-if="!hasValue(person,'personGroup')">
                    Bitte ausfüllen
                </p>
            </div>
            <p class="help" v-if="person.isMainPerson && person.saleCount && person.saleCount > 0">
                Verkäufe insgesamt: {{person.saleCount}} / € {{format(person.saleSum)}}
            </p>
            <p class="help" v-if="person.isMainPerson && person.saleCount && person.saleCount > 0">
                Verkäufe in den letzten 6 Monaten: {{person.topSaleCount}} / € {{format(person.topSaleSum)}}
            </p>            
            <p class="pt-std" v-if="person.isMainPerson">
                Aktuelles Guthaben: <strong class="has-text-link">€ {{format(person.credit)}}</strong>
            </p>            
            <p class="pt-std" v-if="!person.isMainPerson">
                Guthaben wird nur für die Hauptperson verwaltet
            </p>
            <div class="field is-grouped" v-if="!person.isMainPerson">
                <div class="control">
                    <button-primary-inverted @click="vibrate();openPerson(person.mainPersonId);">Hauptperson öffnen</button-primary-inverted>
                </div>
            </div>
        </div>
        <div class="actions">
            <div class="field is-grouped">
                <div class="control">
                    <button-primary @click="vibrate();save();">Speichern</button-primary>
                </div>
                <div class="control" v-if="person.isMainPerson">
                    <button-primary-inverted @click="vibrate();addCredit();">Guthaben +/-</button-primary-inverted>
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
        <modal-input ref="inp"/>
        <modal-yesno ref="yesNoRemove" title="Person löschen" text="Soll diesee Person wirklich gelöscht werden?"/>
    </page-container>
    `,
    data() {
        return {
            person: {},
            isPersonGroup: false,
            creditDiff: 0
        };
    },
    mounted() {
        var app = this;
        app.load();
    },
    methods: {
        load() {
            var app = this;
            if(app.$route.params.id !== "_") {
                app.syncing=true;            
                Person.get(app.$route.params.id).then(person => { 
                    app.syncing=false;            
                    app.person = person;
                    app.isPersonGroup = app.person.personGroup && app.person.personGroup.length > 0;
                }, () => router.push({ path: "/persons" }));
            }
            else {
                app.person = new Person();
                if(app.$route.query && app.$route.query.name)
                    app.person.firstName = app.$route.query.name;
            }
        },
        async save() {
            var app = this;
            if(!app.isPersonGroup)
                app.person.personGroup = "";
            const result = await app.person.save();
            if(result && result.id && app.creditDiff != 0) {
                var creditHistory = new CreditHistory();
                creditHistory.personId = result.id;
                creditHistory.credit = app.creditDiff;
                await creditHistory.save();
            }
            app.back();
        },
        cancel() {
            var app = this;
            app.back();
        },
        back() {
            var app = this;
            if(app.$route.query && app.$route.query.fs) 
                router.go(-1)
            else if(app.$route.query && app.$route.query.s)
                router.go(-1)
            else
                router.push({ path: "/persons" });
        },
        addCredit() {
            var app = this;
            app.$refs.inp.open(0, "Guthaben hinzufügen (für Kurs € 10)").then(val => { 
                val = parseFloat(val);
                app.person.credit += val;
                app.creditDiff += val;
            });
        },
        switchName() {
            var app = this;
            var f = app.person.firstName;
            app.person.firstName = app.person.lastName;
            app.person.lastName = f;
        },
        remove() {
            var app = this;
            if(app.$route.params.id !== "_") {
                app.$refs.yesNoRemove.open().then(() => {
                    app.person.remove().then(() => app.back());
                });
            }
            else
                app.cancel();
        },
        openPerson(id) {
            var app = this;
            router.replace({ path: '/person/'+ id });
            location.reload();
        }
    }
}