const RobPage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <page-container ref="page" :syncing="syncing">
        <div class="above_actions">
            <template v-for="rc in robCourses">
                <div class="box hover">
                    <div class="columns is-mobile" @click="open(rc)">
                        <div class="column ">
                            <div class="title is-5">{{moment(rc.date, util.dateFormat).format('DD.MM.YYYY')}}</div>
                            <div class="subtitle is-6">
                                Max. {{rc.maxPersons}} Personen
                            </div>
                        </div>
                        <div :class="'column is-narrow ' + (rc.maxPersons > rc.personCount ? 'warning-text' : 'has-text-success')" style="text-align:right">
                            <b>{{rc.personCount}}</b><br/> Personen angemeldet
                        </div>
                    </div>
                </div>
            </template>
        </div>
        <div class="actions">
            <div class="field is-grouped" style="width:100%">
                <div class="control" style="flex-grow: 1">&nbsp;</div>
                <div class="control">
                    <button-primary @click="vibrate();open();">Neue Kurseinheit</button-primary>
                </div>
            </div>
        </div>
    </page-container>
    `,
    data() {
        return {
            robCourses: [],
            isMainPage: true,
            first: true
        };
    },
    methods: {
        initDone() {
            var app = this;
            app.load();
        },
        load() {
            var app = this;
            if(app.first) app.syncing=true;
            RobCourse.getList().then(robCourses => {
                app.first = false;
                app.syncing = false;
                app.robCourses = robCourses;    
                app.restore();
                if(app.scrollTop) {
                    app.$nextTick(() => {
                        $(window).scrollTop(app.scrollTop);
                        delete app.scrollTop;
                    });
                }
            });
        },
        open(entry) {
            var app = this;
            app.$root.storedAA = { scrollTop: $(window).scrollTop() };
            router.push({ path: '/robcourse/'+ (entry && entry.id ? entry.id : '_') });
        },
        restore() {
            var app = this;
            if(app.$root.storedAA) {
                app.scrollTop = app.$root.storedAA.scrollTop;
                delete app.$root.storedAA;
                return true;
            }
            else
                return false;
        }
    }
}