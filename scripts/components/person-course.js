Vue.component('person-course', { 
    mixins: [utilMixins],
    template:`
    <div>
        <div class="box">
            <div class="media">
                <div class="media-content">
                    <p class="title is-5">{{person.nameWithGroup}}</p>
                </div>
                <div class="media-right">
                    {{person.courseCount}} Kurs(e) frei
                </div>
            </div>
            <div class="media">
                <div class="media-content">
                    <button-primary-inverted @click="book" v-if="person.courseCount > 0">Einheit abziehen</button-primary-inverted>
                </div>
                <div class="media-right">
                    <button class="button" @click="reCharge">Aufladen</button>
                </div>
            </div>
        </div>
        <template v-if="courseHistory.length > 0">
            <div style="margin-bottom:1em">
                <pilltab v-model="courseHistoryTab" v-for="t in courseHistoryTabs" :id="t.id" :title="t.shortTitle"/>
            </div>
            
            <div 
                v-for="entry in filteredCourseHistory" 
                class="columns is-mobile is-vcentered hover">
                <div class="column">
                    {{moment(entry.date,util.dateFormat).format('DD.MM.YYYY')}}
                </div>    
                <div v-if="entry.courses > 0" class="column is-narrow has-text-success" style="min-width:100px;text-align:right">
                    {{entry.courses}}
                </div>
                <div v-if="entry.courses < 0" class="column is-narrow warning-text" style="min-width:100px;text-align:right">
                    {{entry.courses}}
                </div>
            </div>
        </template>
        <modal-input-text ref="inptext"/>
    </div>
    `,
    props: {
        person: { type: Object }
    },
    data() {
        return {
            courseHistory: [],
            courseHistoryTab: "all",
            courseHistoryTabs: [
                { id: "all", shortTitle: "Alles" },
                { id: "booked", shortTitle: "Verbraucht" },
                { id: "reCharged", shortTitle: "Aufgeladen" },
            ]
        };
    },
    computed: {
        filteredCourseHistory() {
            return this.courseHistory.filter(ch =>
                (this.courseHistoryTab === 'all' && ch.courses !== 0) || 
                (this.courseHistoryTab === 'booked' && ch.courses < 0) || 
                (this.courseHistoryTab === 'reCharged' && ch.courses > 0));
        }
    },
    watch: {
        "person.id"() {
            this.loadCourseHistory();
        }
    },
    methods: {
        async book() {
            const app = this;
            const day = await app.$refs.inptext.open(moment().format("DD.MM.YYYY"), "Datum");    
            if(!moment(day,"DD.MM.YYYY", true).isValid()) {
                alert("Ungültiges Datum");
                return;
            }

            await this.saveCourseHistory(moment(day,"DD.MM.YYYY", true), -1);
        },
        
        async loadCourseHistory() {
            const app = this;
            if(!app.person.id) return;
            app.courseHistory = await Person.getCourseHistory(app.person.id);
        },

        async reCharge() {
            const app = this;
            const units = await app.$refs.inptext.open(10, "Einheiten aufladen");
            if (isNaN(units)) {
                alert("Ungültige Zahl");
                return;
            }
            
            await this.saveCourseHistory(moment(), units);
        },
        
        async saveCourseHistory(day, units) {
            const app = this;
            const courseHistory = new CourseHistory();
            courseHistory.personId = app.person.id;
            courseHistory.courses = units;
            courseHistory.date = day.format(util.dateFormat);
            await courseHistory.save();
            await this.reload();
        },
        
        async reload() {
            const app = this;
            await this.loadCourseHistory();
            Person.get(app.person.id).then(person => {
                app.person = person;
            });
        }
    }
 });