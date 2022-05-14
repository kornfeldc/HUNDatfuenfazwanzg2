const CoursePage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <page-container ref="page" :syncing="syncing">
        <div class="above_actions">
            <search v-model="search" @changed="filter" ref="search" />
            {{persons}}
            <!--<person-line v-for="entry in persons" :person="entry" v-on:click="vibrate();open(entry);" :key="entry.id"/>-->
        </div>
    </page-container>
    `,
    data() {
        return {
            search: "",
            rawpersons: [],
            persons: [],
            isMainPage: true,
            first: true,
            saveOnDestroy: false
        };
    },
    watch: {
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
            app.persons = Person.getFiltered(app.rawpersons, { search: app.search, tab: "freecourse" });
            if(app.scrollTop) {
                app.$nextTick(() => {
                    $(window).scrollTop(app.scrollTop);
                    delete app.scrollTop;
                });
            }
        },
        /*open(entry) {
            var app = this;
            app.$root.storedCoursePage = { search: app.search, scrollTop: $(window).scrollTop() };
            router.push({ path: '/person/'+ (entry && entry.id ? entry.id : '_'), query: { s: true } });
        },*/
        restore() {
            var app = this;
            if(app.$root.storedCoursePage) {
                app.search = app.$root.storedCoursePage.search;
                app.$refs.search.set(app.search);
                app.scrollTop = app.$root.storedCoursePage.scrollTop;
                delete app.$root.storedCoursePage;
                return true;
            }
            else
                return false;
        }
    }
}