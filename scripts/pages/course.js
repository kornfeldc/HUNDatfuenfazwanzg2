const CoursePage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <page-container ref="page" :syncing="syncing">
        <div class="above_actions">
            <search v-model="search" @changed="filter" ref="search" />
            
            <template v-if="personsOpenCourses.length > 0 || personsOpenCoursesBookedToday.length > 0">
                <h5 class="title is-5">Offene Einheiten</h5>
                <div style="color:#AAAAAA;font-size:90%;margin-bottom:1rem;margin-top:-1rem"><b>{{openCourseCount}}</b> Einheiten von <b>{{openCoursePersonCount}}</b> Personen</div>
                <div class="columns is-mobile is-vcentered is-multiline ">
                    <div v-for="person in personsOpenCourses" class="column is-half-mobile is-one-third-tablet is-3-desktop" @click="openPerson(person)">
                        <course-person-card :person="person"></course-person-card>
                    </div>
                </div>
                <div v-if="showDivider" style="background-color:#efefef;width:100%;font-size:1pt;margin-bottom:1rem">&nbsp;</div>
                <div v-if="showDivider" style="color:#AAAAAA;font-size:90%;margin-bottom:1rem">Heute schon abgehackt</div>
                <div class="columns is-mobile is-vcentered is-multiline ">
                    <div v-for="person in personsOpenCoursesBookedToday" class="column is-half-mobile is-one-third-tablet is-3-desktop" @click="openPerson(person)">
                        <course-person-card :person="person"></course-person-card>
                    </div>
                </div>
            </template>
            
            <template v-if="personsNoCourses.length > 0">
                <h5 class="title is-5">Keine Einheiten mehr</h5>
                <div class="columns is-mobile is-vcentered is-multiline ">
                    <div v-for="person in personsNoCourses" class="column is-half-mobile is-one-third-tablet is-3-desktop" @click="openPerson(person)">
                        <course-person-card :person="person"></course-person-card>
                    </div>
                </div>
            </template>
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
    computed: {
        personsOpenCoursesBookedToday() {
            return this.persons.filter(p => p.courseCount > 0 && p.lastBookedCourse && moment(p.lastBookedCourse,util.dateFormat).isSame(moment(),'day'));
        },
        personsOpenCourses() {
            return this.persons.filter(p => p.courseCount > 0 && (!p.lastBookedCourse || !moment(p.lastBookedCourse,util.dateFormat).isSame(moment(),'day')));
        },
        personsNoCourses() {
            return this.persons.filter(p => p.courseCount === 0);
        },
        showDivider() {
            return this.personsOpenCourses.length > 0 && this.personsOpenCoursesBookedToday.length > 0;
        },
        openCourseCount() {
            return this.rawpersons.map(p => p.courseCount).reduce((p1,p2) => p1+p2,0);
        },
        openCoursePersonCount() {
            return this.rawpersons.filter(p => p.courseCount > 0).length;
        }
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
            app.persons = Person.getFiltered(app.rawpersons, { search: app.search, tab: "course" });
            if(app.scrollTop) {
                app.$nextTick(() => {
                    $(window).scrollTop(app.scrollTop);
                    delete app.scrollTop;
                });
            }
        },
        openPerson(entry) {
            var app = this;
            app.$root.storedCoursePage = { search: app.search, scrollTop: $(window).scrollTop() };
            router.push({ path: '/person/'+ (entry && entry.id ? entry.id : '_'), query: { s: true, tab: "course" } });
        },
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