const PersonsPage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <page-container ref="page" :syncing="syncing">
        <div class="above_actions">
            <search v-model="search" @changed="filter" ref="search" />
            <div class="tabs" v-if="!search || search.length == 0">
                <ul>
                    <li v-for="t in types" :class="(tab == t.id ? 'is-active':'')"><a @click="vibrate();tab = t.id;">{{t.shortTitle}}</a></li>
                </ul>
            </div>
            <person-line v-for="entry in persons" :person="entry" v-on:click="vibrate();open(entry);" :key="entry.id"/>
        </div>
        <div class="actions">
            <div class="field">
                <div class="control">
                    <button-primary @click="vibrate();open();">Neue Person</button-primary>
                </div>
            </div>
        </div>
    </page-container>
    `,
    data() {
        return {
            search: "",
            types: [
                //{ id: "top", shortTitle: "TOP" },
                { id: "all", shortTitle: "Alle aktiven" },
                { id: "member", shortTitle: "Mitglieder" },
                { id: "nomember", shortTitle: "Andere" },
                { id: "inactive", shortTitle: "Inaktiv" }
            ],
            tab: "all",
            rawpersons: [],
            persons: [],
            isMainPage: true,
            first: true,
            saveOnDestroy: false
        };
    },
    watch: {
        tab() {
            this.filter();
        }
    },
    methods: {
        initDone() {
            var app = this;
            app.load();
        },
        load() {
            var app = this;
            if(app.first) app.syncing = true;
            Person.getList().then(persons => {
                app.first = false;
                app.syncing = false;
                app.rawpersons = persons;      
                app.restore();
                app.filter();
            });
        },
        filter() {
            var app = this;
            app.persons = Person.getFiltered(app.rawpersons, { search: app.search, tab: app.tab });
            if(app.scrollTop) {
                app.$nextTick(() => {
                    $(window).scrollTop(app.scrollTop);
                    delete app.scrollTop;
                });
            }
        },
        open(entry) {
            var app = this;
            app.$root.storedPA = { tab: app.tab, search: app.search, scrollTop: $(window).scrollTop() };
            router.push({ path: '/person/'+ (entry && entry.id ? entry.id : '_'), query: { s: true } });
        },
        restore() {
            var app = this;
            if(app.$root.storedPA) {
                app.tab = app.$root.storedPA.tab;
                app.search = app.$root.storedPA.search;
                app.$refs.search.set(app.search);
                app.scrollTop = app.$root.storedPA.scrollTop;
                delete app.$root.storedPA;
                return true;
            }
            else
                return false;
        }
    }
}