const RobCoursePage = {
    mixins: [sessionMixin,mandatoryMixin,utilMixins],
    template: `
    <page-container>
        <div class="above_actions">
            <!--<div v-if="robCourse.personCount === 0">
                <div class="is-size-3">{{moment(robCourse.date).format("DD.MM.YYYY")}}</div>
            </div>-->

            <div class="columns is-mobile" v-if="robCourse.personCount === 0">
                <div class="column">
                    <div class="field">
                        <label class="label">Datum</label>
                        <div class="control">
                            <input class="input" type="date" placeholder="Datum" v-model="robCourse.date"/>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <div class="field">
                        <label class="label">Max. Personen</label>
                        <div class="control">
                            <input class="input" type="number" placeholder="Max. Personen" v-model="robCourse.maxPersons"/>
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                <label class="label">Link</label>
                <div class="field has-addons">
                    <div class="control" style="width:100%">
                        <input class="input" v-model="link" readonly @click="copyLink">
                    </div>
                    <div class="control">
                        <a class="button is-info" @click="copyLink">Kopieren</a>
                    </div>
                </div>
            </div>


        </div>
        <div class="actions">
            <div class="field is-grouped">
                <div class="control">
                    <button-primary @click="vibrate();save();">Speichern</button-primary>
                </div>
                <div class="control" v-if="robCourse.id > 0">
                    <button-danger-inverted @click="vibrate();remove();">
                        <span class="icon is-small">
                            <i class="fas fa-trash"></i>
                        </span>
                    </button-danger-inverted>
                </div>
                
                <div class="control">
                    <button-cancel @click="vibrate();cancel();"/>
                </div>
            </div>
        </div>
        <modal-yesno ref="yesNoRemove" title="ROB Einheit löschen" text="Soll diese ROB Einheit wirklich gelöscht werden?"/>
        <modal-alert ref="alertCopied" title="" text="Link wurde kopiert"/>
        <modal-alert ref="alertCantCopy" title="" text="Dein Gerät unterstützt diese Aktion leider nicht, bitte händisch kopieren"/>
    </page-container>
    `,
    data() {
        return {
            robCourse: {}
        };
    },
    computed: {
        link() {
            return "https://rob.og125.at/public/"+this.robCourse.link;
        }
    },
    async mounted() {
        var app = this;
        await app.load();
    },
    methods: {
        async load() {
            var app = this;
            if(app.$route.params.id !== "_")
                RobCourse.get(app.$route.params.id).then(robCourse => { app.robCourse = robCourse; }, () => router.push({ path: "/rob" }));
            else  {
                app.robCourse = new RobCourse();
                await app.robCourse.generateLink();
            }
        },
        save() {
            var app = this;
            app.robCourse.save().then(()=> {
                app.back();
            });
        },        
        cancel() {
            var app = this;
            app.back();
        },
        async remove() {
            const app = this;
            await app.$refs.yesNoRemove.open();
            await app.robCourse.remove();
            router.push({ path: "/rob" });
        },
        copyLink() {
            const app = this;
            util.copyToClipboard(this.link)
                .then(() => {
                    app.$refs.alertCopied.open().then(() => {
                        if(app.robCourse.id === "_")
                            app.saveAndReload();
                    });
                    
                })
                .catch(() => {
                    app.$refs.alertCantCopy.open.then(() => {
                        if(app.robCourse.id === "_")
                            app.saveAndReload();
                    });
                });
        },
        saveAndReload() {
            const app = this;
            app.robCourse.save().then((response)=> {
                router.replace({ path: '/robcourse/'+ response.id });
                location.reload();
            });
        },
        back() {
            var app = this;
            if(app.$route.query && app.$route.query.fs) 
                router.go(-1)
            else if(app.$route.query && app.$route.query.s)
                router.go(-1)
            else
                router.push({ path: "/rob" });
        },
    }
}